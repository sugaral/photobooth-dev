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

$rawFile = isset($_POST['file']) ? trim($_POST['file']) : '';
$templateRel = isset($_POST['template']) ? trim($_POST['template']) : '';

$imagesDir = realpath(FolderEnum::IMAGES->absolute()) ?: FolderEnum::IMAGES->absolute();
$tmpDir = realpath(FolderEnum::TEMP->absolute()) ?: FolderEnum::TEMP->absolute();
$thumbsDir = realpath(FolderEnum::THUMBS->absolute()) ?: FolderEnum::THUMBS->absolute();

if (!is_dir($tmpDir)) {
    @mkdir($tmpDir, 0777, true);
}
if (!is_dir($thumbsDir)) {
    @mkdir($thumbsDir, 0777, true);
}

// 1. 解析用户抓拍照片
if (empty($rawFile) || $rawFile === 'latest') {
    $candidates = glob($imagesDir . DIRECTORY_SEPARATOR . '*.jpg');
    if (empty($candidates)) {
        $candidates = glob($tmpDir . DIRECTORY_SEPARATOR . '*.jpg');
    }
    if (!empty($candidates)) {
        usort($candidates, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });
        $rawFile = basename($candidates[0]);
    }
}

if (empty($rawFile)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '未指定用户照片且近期无拍摄记录']);
    exit;
}

$filename = basename($rawFile);
if (strpos($filename, '?') !== false) {
    $filename = explode('?', $filename)[0];
}

$sourceInput = $imagesDir . DIRECTORY_SEPARATOR . $filename;
if (!file_exists($sourceInput)) {
    $sourceInput = $tmpDir . DIRECTORY_SEPARATOR . $filename;
}
if (!file_exists($sourceInput)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => '源照片文件不存在: ' . $filename]);
    exit;
}

// 2. 解析变身模板图片
if (empty($templateRel)) {
    $templateRel = 'resources/img/templates_ai/hanfu_female_01.jpg';
}

$templatePath = realpath(__DIR__ . '/../' . ltrim($templateRel, '/\\'));
if (!$templatePath || !file_exists($templatePath)) {
    // 尝试备用路径
    $alt = realpath(__DIR__ . '/../resources/img/templates_ai/' . basename($templateRel));
    if ($alt && file_exists($alt)) {
        $templatePath = $alt;
    }
}

if (!$templatePath || !file_exists($templatePath)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => '指定的变身模板文件不存在: ' . $templateRel]);
    exit;
}

// 3. 准备输出路径与美颜参数
$pathParts = pathinfo($filename);
$ext = isset($pathParts['extension']) ? $pathParts['extension'] : 'jpg';
$baseName = $pathParts['filename'];
$outputFilename = $baseName . '_swap.' . $ext;
$outputPath = $imagesDir . DIRECTORY_SEPARATOR . $outputFilename;
$outputThumb = $thumbsDir . DIRECTORY_SEPARATOR . $outputFilename;

$smooth = isset($_POST['smooth']) && is_numeric($_POST['smooth']) ? (float)$_POST['smooth'] : 0.0;
$white = isset($_POST['white']) && is_numeric($_POST['white']) ? (float)$_POST['white'] : 0.0;
$rosy = isset($_POST['rosy']) && is_numeric($_POST['rosy']) ? (float)$_POST['rosy'] : 0.0;
$clarity = isset($_POST['clarity']) && is_numeric($_POST['clarity']) ? (float)$_POST['clarity'] : 0.0;
$eye = isset($_POST['eye']) && is_numeric($_POST['eye']) ? (float)$_POST['eye'] : 0.0;
$slim = isset($_POST['slim']) && is_numeric($_POST['slim']) ? (float)$_POST['slim'] : 0.0;

$swapSource = $sourceInput;
if ($smooth > 0 || $white > 0 || $rosy > 0 || $clarity > 0 || $eye > 0 || $slim > 0) {
    // 拍摄前置美颜：先对抓拍原图进行大眼、瘦脸、磨皮与冷白皮初修，确保送入换脸引擎的五官特征更美更立体
    $beautifiedSource = $tmpDir . DIRECTORY_SEPARATOR . 'beauty_src_' . md5($filename . '_' . $eye . '_' . $slim . '_' . $smooth . '_' . $white) . '.jpg';
    $beautyUrl = 'http://127.0.0.1:8001/beauty';
    $beautyPayload = json_encode([
        'input' => $sourceInput,
        'output' => $beautifiedSource,
        'eye' => $eye,
        'slim' => $slim,
        'smooth' => $smooth,
        'white' => $white,
        'rosy' => $rosy,
        'clarity' => $clarity,
        'preview' => false,
    ]);
    if (function_exists('curl_init')) {
        $bch = curl_init($beautyUrl);
        if ($bch) {
            curl_setopt($bch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($bch, CURLOPT_POST, true);
            curl_setopt($bch, CURLOPT_POSTFIELDS, $beautyPayload);
            curl_setopt($bch, CURLOPT_HTTPHEADER, ['Content-Type: application/json; charset=utf-8']);
            curl_setopt($bch, CURLOPT_TIMEOUT_MS, 8000);
            curl_setopt($bch, CURLOPT_CONNECTTIMEOUT_MS, 1500);
            curl_setopt($bch, CURLOPT_NOSIGNAL, 1);
            $bresp = curl_exec($bch);
            curl_close($bch);
            if ($bresp) {
                $bparsed = json_decode($bresp, true);
                if (!empty($bparsed['success']) && file_exists($beautifiedSource) && filesize($beautifiedSource) > 0) {
                    $swapSource = $beautifiedSource;
                }
            }
        }
    }
}

// 4. 调用本地 Python AI 换脸微服务 (端口 8001)
$daemonScript = realpath(__DIR__ . '/../bin/rembg_service.py');
if ($daemonScript) {
    $fp = @fsockopen('127.0.0.1', 8001, $errno, $errstr, 0.05);
    if ($fp) {
        fclose($fp);
    } else {
        if (strncasecmp(PHP_OS, 'WIN', 3) === 0) {
            $psCmd = sprintf('powershell -NoProfile -NonInteractive -Command "Start-Process python -ArgumentList \'%s\' -WindowStyle Hidden"', addslashes($daemonScript));
            @pclose(@popen('start "" /min ' . $psCmd, 'r'));
        } else {
            @exec('python ' . escapeshellarg($daemonScript) . ' > /dev/null 2>&1 &');
        }
    }
}

$serviceUrl = 'http://127.0.0.1:8001/faceswap';
$postData = json_encode([
    'source' => $swapSource,
    'target' => $templatePath,
    'output' => $outputPath,
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

// 5. 降级兜底 CLI 运行
if ($returnCode !== 0 && (!isset($resultJson['error']) || strpos($resultJson['error'], '人脸') === false)) {
    $projectRoot = dirname(__DIR__);
    $script = realpath(__DIR__ . '/../bin/faceswap_core.py');
    if ($script) {
        $cmd = sprintf(
            'python -X utf8 -c "import sys, json; sys.path.insert(0, %s); from bin.faceswap_core import FaceSwapEngine; e=FaceSwapEngine(); r=e.swap(sys.argv[1], sys.argv[2], sys.argv[3]); print(json.dumps(r, ensure_ascii=False))" %s %s %s',
            var_export($projectRoot, true),
            escapeshellarg($sourceInput),
            escapeshellarg($templatePath),
            escapeshellarg($outputPath)
        );
        exec($cmd, $cliOutput, $cliCode);
        if ($cliCode === 0 && !empty($cliOutput)) {
            $cliResult = json_decode(implode("\n", $cliOutput), true);
            if ($cliResult && !empty($cliResult['success'])) {
                $resultJson = $cliResult;
                $returnCode = 0;
            } elseif ($cliResult && isset($cliResult['error'])) {
                $resultJson = $cliResult;
            }
        }
    }
}

if ($returnCode !== 0 || !file_exists($outputPath)) {
    http_response_code(500);
    $errorMsg = isset($resultJson['error']) ? $resultJson['error'] : 'AI 换脸融合处理失败，请重试';
    echo json_encode([
        'success' => false,
        'error' => $errorMsg,
        'details' => $resultJson,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 6. 生成换脸图的缩略图 (用于相册与四宫格显示)
try {
    if (class_exists(Image::class)) {
        Image::createThumbnail($outputPath, $outputThumb);
    }
} catch (\Throwable $t) {
    // 容错处理
}

echo json_encode([
    'success' => true,
    'file' => $outputFilename,
    'images' => [$outputFilename],
    'image' => PathUtility::getPublicPath('data/images/' . $outputFilename),
    'thumb' => PathUtility::getPublicPath('data/thumbs/' . $outputFilename),
    'duration' => $resultJson['duration'] ?? 0,
    'enhancer' => $resultJson['enhancer'] ?? null,
    'message' => $resultJson['message'] ?? 'AI 换脸融合成功！'
], JSON_UNESCAPED_UNICODE);
