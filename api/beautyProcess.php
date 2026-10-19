<?php

require_once __DIR__ . '/../lib/boot.php';

use Photobooth\Enum\FolderEnum;
use Photobooth\Image;
use Photobooth\Utility\PathUtility;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

checkCsrfOrFail($_POST);
$rawFile = isset($_POST['file']) ? trim($_POST['file']) : '';
$sourceFileParam = isset($_POST['source_file']) ? trim($_POST['source_file']) : '';
$action = isset($_POST['action']) ? trim($_POST['action']) : 'apply'; // 'preview' | 'apply' | 'reset'

$imagesDir = realpath(FolderEnum::IMAGES->absolute()) ?: FolderEnum::IMAGES->absolute();
$tmpDir = realpath(FolderEnum::TEMP->absolute()) ?: FolderEnum::TEMP->absolute();
$thumbsDir = realpath(FolderEnum::THUMBS->absolute()) ?: FolderEnum::THUMBS->absolute();

if (!is_dir($tmpDir)) {
    @mkdir($tmpDir, 0777, true);
}
if (!is_dir($thumbsDir)) {
    @mkdir($thumbsDir, 0777, true);
}

if (empty($rawFile) || $rawFile === 'latest') {
    http_response_code(400);
    echo json_encode(['error' => '必须明确指定当前照片，禁止使用 latest']);
    exit;
}

if (empty($rawFile)) {
    http_response_code(400);
    echo json_encode(['error' => 'No image specified and no recent photo found']);
    exit;
}

$filename = basename($rawFile);
if (strpos($filename, '?') !== false) {
    $filename = explode('?', $filename)[0];
}

// Effects must start from the image currently visible on the result stage.
// The old implementation always read orig_<name>, which silently removed a
// previously selected background/template or filter before applying beauty.
$sourceFilename = basename($sourceFileParam !== '' ? $sourceFileParam : $filename);
if (strpos($sourceFilename, '?') !== false) {
    $sourceFilename = explode('?', $sourceFilename)[0];
}
if (!preg_match('/^[A-Za-z0-9._-]+$/', $sourceFilename)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid source filename']);
    exit;
}

// Clean base filename (strip any previous edit prefixes or rembg markers if needed)
$baseName = $filename;
if (strpos($baseName, 'orig_') === 0) {
    $baseName = substr($baseName, 5);
}

$origBackupFile = $tmpDir . DIRECTORY_SEPARATOR . 'orig_' . $baseName;
$imageFile = $imagesDir . DIRECTORY_SEPARATOR . $baseName;
$tmpFile = $tmpDir . DIRECTORY_SEPARATOR . $baseName;

$sourceCandidates = [
    $imagesDir . DIRECTORY_SEPARATOR . $sourceFilename,
    $tmpDir . DIRECTORY_SEPARATOR . $sourceFilename,
];
$sourceInput = null;
foreach ($sourceCandidates as $candidate) {
    if (is_file($candidate) && filesize($candidate) > 0) {
        $sourceInput = $candidate;
        break;
    }
}

// Ensure pristine raw original backup exists
if (!file_exists($origBackupFile) || filesize($origBackupFile) === 0) {
    if (file_exists($tmpFile) && filesize($tmpFile) > 0) {
        @copy($tmpFile, $origBackupFile);
    } elseif (file_exists($imageFile) && filesize($imageFile) > 0) {
        @copy($imageFile, $origBackupFile);
    }
}

// For a fresh capture the current file is the raw image. For an explicit
// source_file (template/filter/beauty result), preserve that composite.
if ($sourceInput === null) {
    http_response_code(404);
    echo json_encode(['error' => 'Specified source image not found']);
    exit;
}
if (!file_exists($sourceInput)) {
    http_response_code(404);
    echo json_encode(['error' => 'Base image file not found: ' . $baseName]);
    exit;
}

// 1. Handle Reset Action
if ($action === 'reset') {
    if (file_exists($origBackupFile)) {
        $baseName = 'beauty_reset_' . bin2hex(random_bytes(16)) . '.jpg';
        $imageFile = $imagesDir . DIRECTORY_SEPARATOR . $baseName;
        if (!copy($origBackupFile, $imageFile)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to restore image']);
            exit;
        }

        // Regenerate thumbnail
        try {
            $imageHandler = new Image();
            $imageHandler->debugLevel = $config['dev']['loglevel'] ?? 0;
            $res = $imageHandler->createFromImage($imageFile);
            if ($res) {
                $thumbRes = $imageHandler->resizeImage($res, (int)($config['picture']['thumb_size'] ?? 600));
                if ($thumbRes) {
                    $imageHandler->jpegQuality = (int)($config['jpeg_quality']['thumb'] ?? 75);
                    $imageHandler->saveJpeg($thumbRes, $thumbsDir . DIRECTORY_SEPARATOR . $baseName);
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }

        echo json_encode([
            'success' => true,
            'file' => $baseName,
            'reset' => true,
            'url' => PathUtility::getPublicPath('data/images/' . $baseName) . '?v=' . time(),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// 2. Beauty Parameters
$beautyCfg = is_array($config['beauty'] ?? null) ? $config['beauty'] : [];
$eye = isset($_POST['eye']) ? max(0, min(100, (float)$_POST['eye'])) : (float)($beautyCfg['default_eye'] ?? 15);
$slim = isset($_POST['slim']) ? max(0, min(100, (float)$_POST['slim'])) : (float)($beautyCfg['default_slim'] ?? 15);
$smooth = isset($_POST['smooth']) ? max(0, min(100, (float)$_POST['smooth'])) : (float)($beautyCfg['default_smooth'] ?? 20);
$white = isset($_POST['white']) ? max(0, min(100, (float)$_POST['white'])) : (float)($beautyCfg['default_white'] ?? 15);
$rosy = isset($_POST['rosy']) ? max(0, min(100, (float)$_POST['rosy'])) : (float)($beautyCfg['default_rosy'] ?? 20);
$clarity = isset($_POST['clarity']) ? max(0, min(100, (float)$_POST['clarity'])) : (float)($beautyCfg['default_clarity'] ?? 15);

$isPreview = ($action === 'preview');

if ($isPreview) {
    // Generate fast preview file
    $previewFileName = 'beauty_prev_' . md5($baseName . '_' . $eye . '_' . $slim . '_' . $smooth . '_' . $white . '_' . $rosy . '_' . $clarity) . '.jpg';
    $outputPath = $tmpDir . DIRECTORY_SEPARATOR . $previewFileName;
} else {
    // Each result gets a new name; never overwrite a base used by an editor/save.
    $baseName = 'beauty_' . bin2hex(random_bytes(16)) . '.jpg';
    $imageFile = $imagesDir . DIRECTORY_SEPARATOR . $baseName;
    $outputPath = $imageFile;
}

$serviceUrl = rtrim((string)($beautyCfg['service_url'] ?? 'http://127.0.0.1:8001'), '/') . '/beauty';
$postData = json_encode([
    'input' => $sourceInput,
    'output' => $outputPath,
    'eye' => $eye,
    'slim' => $slim,
    'smooth' => $smooth,
    'white' => $white,
    'rosy' => $rosy,
    'clarity' => $clarity,
    'preview' => $isPreview,
    'preview_max' => 960,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

$resultJson = null;
$returnCode = 1;

// 1. Query Python microservice
if (function_exists('curl_init')) {
    $ch = curl_init($serviceUrl);
    if ($ch) {
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json; charset=utf-8']);
        curl_setopt($ch, CURLOPT_TIMEOUT_MS, 15000);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT_MS, 1500);
        curl_setopt($ch, CURLOPT_NOSIGNAL, 1);
        $response = curl_exec($ch);
        $curlErr = curl_errno($ch);
        curl_close($ch);
        if (!$curlErr && $response) {
            $parsed = json_decode($response, true);
            if ($parsed && !empty($parsed['success'])) {
                $resultJson = $parsed;
                $returnCode = 0;
            }
        }
    }
}

// 2. Fallback to CLI runner if microservice is temporarily unavailable
if ($returnCode !== 0) {
    $script = realpath(__DIR__ . '/../bin/beauty_core.py');
    if ($script) {
        $cmd = sprintf(
            'python -X utf8 %s --input %s --output %s --eye %f --slim %f --smooth %f --white %f%s',
            escapeshellarg($script),
            escapeshellarg($sourceInput),
            escapeshellarg($outputPath),
            $eye,
            $slim,
            $smooth,
            $white,
            $isPreview ? ' --preview' : ''
        );
        exec($cmd, $cliOutput, $cliCode);
        if ($cliCode === 0 && file_exists($outputPath)) {
            $resultJson = ['success' => true, 'output' => $outputPath, 'cli_fallback' => true];
            $returnCode = 0;
        }
    }
}

if ($returnCode !== 0 || !file_exists($outputPath)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'AI Beauty processing failed',
        'details' => $resultJson,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($isPreview) {
    echo json_encode([
        'success' => true,
        'action' => 'preview',
        'file' => $baseName,
        'preview_file' => $previewFileName,
        'preview_url' => PathUtility::getPublicPath('data/tmp/' . $previewFileName) . '?v=' . time(),
        'num_faces' => $resultJson['num_faces'] ?? 1,
        'time_ms' => $resultJson['time_ms'] ?? 0,
        'params' => [
            'eye' => $eye,
            'slim' => $slim,
            'smooth' => $smooth,
            'white' => $white,
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Final bake: regenerate thumbnail and return updated image info
try {
    $imageHandler = new Image();
    $imageHandler->debugLevel = $config['dev']['loglevel'] ?? 0;
    $res = $imageHandler->createFromImage($imageFile);
    if ($res) {
        $thumbRes = $imageHandler->resizeImage($res, (int)($config['picture']['thumb_size'] ?? 600));
        if ($thumbRes) {
            $imageHandler->jpegQuality = (int)($config['jpeg_quality']['thumb'] ?? 75);
            $imageHandler->saveJpeg($thumbRes, $thumbsDir . DIRECTORY_SEPARATOR . $baseName);
        }
    }
} catch (\Throwable $e) {
    // ignore
}

echo json_encode([
    'success' => true,
    'action' => 'apply',
    'file' => $baseName,
    'url' => PathUtility::getPublicPath('data/images/' . $baseName) . '?v=' . time(),
    'num_faces' => $resultJson['num_faces'] ?? 1,
    'time_ms' => $resultJson['time_ms'] ?? 0,
    'params' => [
        'eye' => $eye,
        'slim' => $slim,
        'smooth' => $smooth,
        'white' => $white,
    ]
], JSON_UNESCAPED_UNICODE);
