<?php

require_once __DIR__ . '/../lib/boot.php';

use Photobooth\Enum\FolderEnum;
use Photobooth\Image;
use Photobooth\Service\AiServiceLauncher;
use Photobooth\Utility\PathUtility;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

checkCsrfOrFail($_POST);

$imagesDir = FolderEnum::IMAGES->absolute();
$thumbsDir = FolderEnum::THUMBS->absolute();
$sourceInput = null;
if (!empty($_POST['capture_token'])) {
    try {
        $sourceInput = (new \Photobooth\Service\CaptureSourceService())->resolve((string)$_POST['capture_token'], $_SESSION);
    } catch (\Throwable $t) {
        \Photobooth\Service\LoggerService::getInstance()->getLogger('main')->warning('CaptureSourceService resolve failed, attempting tmp fallback', ['error' => $t->getMessage()]);
    }
}
if (!$sourceInput && !empty($_POST['file'])) {
    $rawName = basename((string)$_POST['file']);
    $tmpCandidate = FolderEnum::TEMP->absolute() . DIRECTORY_SEPARATOR . $rawName;
    $imgCandidate = FolderEnum::IMAGES->absolute() . DIRECTORY_SEPARATOR . $rawName;
    if (is_file($tmpCandidate) && @getimagesize($tmpCandidate)) {
        $sourceInput = $tmpCandidate;
    } elseif (is_file($imgCandidate) && @getimagesize($imgCandidate)) {
        $sourceInput = $imgCandidate;
    }
}

if (!$sourceInput || !is_file($sourceInput)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => '拍摄原片已失效或未找到，请重新拍摄'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $templatePath = (new \Photobooth\Service\AiTemplateCatalogService())->resolve((string)($_POST['template'] ?? ''));
} catch (\RuntimeException $error) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => $error->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}
// Raw identity pixels only: no beauty, eye enlargement, face slimming or previous customer's image.
$swapSource = $sourceInput;
$outputFilename = 'swap_' . bin2hex(random_bytes(16)) . '.jpg';
$outputPath = $imagesDir . DIRECTORY_SEPARATOR . $outputFilename;
$outputThumb = $thumbsDir . DIRECTORY_SEPARATOR . $outputFilename;
// Release the PHP session lock before waiting on the inference queue.
session_write_close();

// Startup has its own bounded wait; never race dependency imports or reuse another project.
@set_time_limit(60);
try {
    (new AiServiceLauncher())->ensureReady();
} catch (\RuntimeException $error) {
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => $error->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

$fidelity = 0.90; // Restoration strength; CodeFormer high-fidelity
$faceMode = in_array(($_POST['mode'] ?? 'neural'), ['neural', 'full_face', 'fast', 'preserve_identity'], true) ? (string)($_POST['mode'] ?? 'neural') : 'neural';
$serviceUrl = 'http://127.0.0.1:8001/faceswap';
$postData = json_encode([
    'source' => $swapSource,
    'target' => $templatePath,
    'output' => $outputPath,
    'fidelity' => $fidelity,
    'mode' => $faceMode,
], JSON_UNESCAPED_UNICODE);

$resultJson = null;
$returnCode = -1;

if (function_exists('curl_init')) {
    $ch = curl_init($serviceUrl);
    if ($ch) {
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json; charset=utf-8']);
        curl_setopt($ch, CURLOPT_TIMEOUT_MS, 30000);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT_MS, 2000);
        curl_setopt($ch, CURLOPT_NOSIGNAL, 1);
        curl_setopt($ch, CURLOPT_PROXY, '');
        $response = curl_exec($ch);
        $curlErr = curl_errno($ch);
        curl_close($ch);
        if (!$curlErr && $response) {
            $parsed = json_decode($response, true);
            if ($parsed && !empty($parsed['success'])) {
                $resultJson = $parsed;
                $returnCode = 0;
            } elseif ($parsed && isset($parsed['error'])) {
                $resultJson = $parsed;
            }
        }
    }
}

// A timed-out request may still be running: never launch a second CLI inference.
if ($returnCode !== 0 || !is_file($outputPath) || !@getimagesize($outputPath)) {
    http_response_code(200);
    $errorMsg = isset($resultJson['error']) ? $resultJson['error'] : 'AI 服务未就绪或处理超时，本次未生成成片，请检查服务状态后重试';
    echo json_encode([
        'success' => false,
        'error' => $errorMsg,
        'details' => $resultJson,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Apply AI Beauty Retouching (Skin smoothing, porcelain whitening, rosy tone, clarity, eye/jaw refinement)
$smooth = isset($_POST['smooth']) ? max(0, min(100, (float)$_POST['smooth'])) : 0.0;
$white = isset($_POST['white']) ? max(0, min(100, (float)$_POST['white'])) : 0.0;
$rosy = isset($_POST['rosy']) ? max(0, min(100, (float)$_POST['rosy'])) : 0.0;
$clarity = isset($_POST['clarity']) ? max(0, min(100, (float)$_POST['clarity'])) : 0.0;
$eye = isset($_POST['eye']) ? max(0, min(100, (float)$_POST['eye'])) : 0.0;
$slim = isset($_POST['slim']) ? max(0, min(100, (float)$_POST['slim'])) : 0.0;

if ($smooth > 0 || $white > 0 || $rosy > 0 || $clarity > 0 || $eye > 0 || $slim > 0) {
    $beautyPayload = json_encode([
        'input' => $outputPath,
        'output' => $outputPath,
        'smooth' => $smooth,
        'white' => $white,
        'rosy' => $rosy,
        'clarity' => $clarity,
        'eye' => $eye,
        'slim' => $slim,
        'preview' => false,
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    if (function_exists('curl_init')) {
        $bCh = curl_init('http://127.0.0.1:8001/beauty');
        if ($bCh) {
            curl_setopt_array($bCh, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $beautyPayload,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json; charset=utf-8'],
                CURLOPT_TIMEOUT_MS => 15000,
                CURLOPT_CONNECTTIMEOUT_MS => 1500,
                CURLOPT_NOSIGNAL => 1,
            ]);
            curl_exec($bCh);
            curl_close($bCh);
        }
    }
}

// Use the actual Image API; never return a thumbnail URL for a missing file.
$imageUrl = PathUtility::getPublicPath('data/images/' . $outputFilename);
$thumbUrl = $imageUrl;
try {
    $imageHandler = new Image();
    $imageHandler->jpegQuality = (int)($config['jpeg_quality']['thumb'] ?? 75);
    $sourceResource = $imageHandler->createFromImage($outputPath);
    $thumbResource = $sourceResource ? $imageHandler->resizeImage($sourceResource, (int)($config['picture']['thumb_size'] ?? 600)) : false;
    if (!$thumbResource || !$imageHandler->saveJpeg($thumbResource, $outputThumb) || !@getimagesize($outputThumb)) {
        throw new \RuntimeException('无法生成换脸缩略图');
    }
    $thumbUrl = PathUtility::getPublicPath('data/thumbs/' . $outputFilename);
} catch (\Throwable $t) {
    \Photobooth\Service\LoggerService::getInstance()->getLogger('main')->warning('AI thumbnail unavailable; use full image', ['error' => $t->getMessage()]);
} finally {
    unset($sourceResource, $thumbResource);
}

echo json_encode([
    'success' => true,
    'file' => $outputFilename,
    'images' => [$outputFilename],
    'image' => $imageUrl,
    'thumb' => $thumbUrl,
    'duration' => $resultJson['duration'] ?? 0,
    'enhancer' => $resultJson['enhancer'] ?? null,
    'model' => $resultJson['model'] ?? null,
    'mode' => $resultJson['mode'] ?? null,
    'providers' => $resultJson['providers'] ?? [],
    'quality' => $resultJson['quality'] ?? null,
    'message' => $resultJson['message'] ?? 'AI 换脸融合成功！'
], JSON_UNESCAPED_UNICODE);
