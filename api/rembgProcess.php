<?php

require_once __DIR__ . '/../lib/boot.php';

use Photobooth\Service\LanguageService;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$filename = isset($_POST['file']) ? basename($_POST['file']) : '';
$template = isset($_POST['template']) ? trim($_POST['template']) : '';
$action = isset($_POST['action']) ? trim($_POST['action']) : 'apply'; // 'preview' or 'apply'

// SOTA AI matting engines:
// 1. 'birefnet' (BiRefNet-Portrait): 专为人像发丝优化，【最适合半身照、自拍照、大头贴】
// 2. 'rmbg2' (RMBG-2.0): 商业级通用高清稳定去底，【最适合全身照、站姿、多人合影、复杂服装】
$allowedEngines = ['birefnet', 'rmbg2'];
$engineAliases = [
    'birefnet-portrait' => 'birefnet',
    'birefnet_portrait' => 'birefnet',
    'rmbg-2.0' => 'rmbg2',
    'rmbg_2' => 'rmbg2',
    'bria-rmbg-2.0' => 'rmbg2',
    'rembg' => 'birefnet',
    'feynobg' => 'rmbg2',
];
$configRembg = is_array($config['rembg'] ?? null) ? $config['rembg'] : [];
$configEngine = (string)($configRembg['engine'] ?? 'birefnet');
if (isset($engineAliases[$configEngine])) {
    $configEngine = $engineAliases[$configEngine];
}
$rawRequested = isset($_POST['engine']) ? strtolower(trim((string)$_POST['engine'])) : $configEngine;
$requestedEngine = $engineAliases[$rawRequested] ?? $rawRequested;
if (!in_array($requestedEngine, $allowedEngines, true)) {
    $requestedEngine = in_array($configEngine, $allowedEngines, true) ? $configEngine : 'birefnet';
}
$autoFallback = filter_var(
    $_POST['auto_fallback'] ?? ($configRembg['auto_fallback'] ?? true),
    FILTER_VALIDATE_BOOLEAN,
    FILTER_NULL_ON_FAILURE
);
$autoFallback = $autoFallback ?? true;
$serviceUrl = rtrim((string)($configRembg['service_url'] ?? 'http://127.0.0.1:8001'), '/') . '/process';
$connectTimeoutMs = max(100, (int)($configRembg['connect_timeout_ms'] ?? 2000));
$requestTimeoutMs = max($connectTimeoutMs, (int)($configRembg['request_timeout_ms'] ?? 45000));
$cmd = null;
$stderr = '';
$fallbackUsed = false;
$fallbackReason = null;

if (empty($filename)) {
    echo json_encode(['error' => 'No image specified']);
    exit;
}

$imagesDir = realpath(__DIR__ . '/../data/images');
$tmpDir = realpath(__DIR__ . '/../data/tmp');
if (!$tmpDir) {
    $tmpDir = __DIR__ . '/../data/tmp';
    if (!is_dir($tmpDir)) {
        mkdir($tmpDir, 0777, true);
    }
}

$inputPath = $imagesDir . DIRECTORY_SEPARATOR . $filename;
if (!file_exists($inputPath)) {
    // Check in tmpDir if already processed once
    if (file_exists($tmpDir . DIRECTORY_SEPARATOR . $filename)) {
        $inputPath = $tmpDir . DIRECTORY_SEPARATOR . $filename;
    } else {
        echo json_encode(['error' => 'Original image not found: ' . $filename]);
        exit;
    }
}

// Resolve template path
$templatePath = '';
if ($template !== '' && $template !== 'transparent') {
    // Check if absolute or relative
    $cand1 = realpath(__DIR__ . '/../' . ltrim($template, '/\\'));
    $cand2 = realpath(__DIR__ . '/../resources/img/templates/' . basename($template));
    $cand3 = realpath(__DIR__ . '/../data/templates/' . basename($template));
    if ($cand1 && file_exists($cand1)) {
        $templatePath = $cand1;
    } elseif ($cand2 && file_exists($cand2)) {
        $templatePath = $cand2;
    } elseif ($cand3 && file_exists($cand3)) {
        $templatePath = $cand3;
    }
    if ($templatePath === '') {
        http_response_code(422);
        echo json_encode(['error' => 'Template image not found'], JSON_UNESCAPED_SLASHES);
        exit;
    }
}

$ext = ($template === 'transparent') ? 'png' : 'jpg';
// Do not use time() alone: rapid template switching can otherwise reuse one
// filename and let concurrent requests overwrite each other's output.
try {
    $outputToken = date('YmdHis') . '_' . bin2hex(random_bytes(6));
} catch (Throwable $e) {
    $outputToken = date('YmdHis') . '_' . uniqid('', true);
}
$outFilename = pathinfo($filename, PATHINFO_FILENAME) . '_rembg_' . $outputToken . '.' . $ext;

if ($action === 'apply') {
    $outputPath = $imagesDir . DIRECTORY_SEPARATOR . $outFilename;
} else {
    $outputPath = $tmpDir . DIRECTORY_SEPARATOR . $outFilename;
}

$templateScale = isset($_POST['scale']) ? max(0.1, min(5.0, (float)$_POST['scale'])) : 1.0;
$offsetX = isset($_POST['offset_x']) ? (float)$_POST['offset_x'] : 0.0;
$offsetY = isset($_POST['offset_y']) ? (float)$_POST['offset_y'] : 0.0;
$personScale = isset($_POST['person_scale']) ? max(0.1, min(5.0, (float)$_POST['person_scale'])) : 1.0;
$personOffsetX = isset($_POST['person_offset_x']) ? (float)$_POST['person_offset_x'] : 0.0;
$personOffsetY = isset($_POST['person_offset_y']) ? (float)$_POST['person_offset_y'] : 0.0;

$serviceUrl = rtrim((string)($configRembg['service_url'] ?? 'http://127.0.0.1:8001'), '/') . '/process';
$postData = json_encode([
    'input' => $inputPath,
    'output' => $outputPath,
    'template' => ($template === 'transparent') ? 'transparent' : $templatePath,
    'engine' => $requestedEngine,
    'auto_fallback' => $autoFallback,
    'template_scale' => $templateScale,
    'offset_x' => $offsetX,
    'offset_y' => $offsetY,
    'person_scale' => $personScale,
    'person_offset_x' => $personOffsetX,
    'person_offset_y' => $personOffsetY,
], JSON_UNESCAPED_SLASHES);

$resultJson = null;
$returnCode = 1;

// 1. Try ultra-fast resident GPU microservice first (30ms - 80ms)
if (function_exists('curl_init')) {
    $ch = curl_init($serviceUrl);
    if ($ch) {
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
         curl_setopt($ch, CURLOPT_TIMEOUT_MS, $requestTimeoutMs);
         curl_setopt($ch, CURLOPT_CONNECTTIMEOUT_MS, $connectTimeoutMs);
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

// 2. Fallback to CLI GPU runner if daemon is not running
if ($returnCode !== 0) {
    $fallbackUsed = $requestedEngine !== 'birefnet';
    $fallbackReason = $fallbackUsed ? 'matting_service_unavailable' : null;
    // Attempt to awaken resident GPU service only if port 8001 is not already listening
    $daemonScript = realpath(__DIR__ . '/../bin/rembg_service.py');
    if ($daemonScript) {
        $fp = @fsockopen('127.0.0.1', 8001, $errno, $errstr, 0.1);
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

    $runnerPath = realpath(__DIR__ . '/../bin/rembg_runner.py');
    if (!$runnerPath) {
        echo json_encode(['error' => 'rembg runner script missing']);
        exit;
    }

    $cmd = sprintf(
        'python %s --input %s --output %s --engine %s%s',
        escapeshellarg($runnerPath),
        escapeshellarg($inputPath),
        escapeshellarg($outputPath),
        escapeshellarg($requestedEngine),
        $autoFallback ? '' : ' --no-fallback'
    );

    $configuredThreads = (int)($configRembg['cpu_threads'] ?? 4);
    if ($configuredThreads > 0) {
        $cmd .= ' --threads ' . $configuredThreads;
    }

    if ($template === 'transparent') {
        $cmd .= ' --template transparent';
    } elseif (!empty($templatePath)) {
        $cmd .= ' --template ' . escapeshellarg($templatePath);
    }
    $cmd .= sprintf(
        ' --scale %F --offset-x %F --offset-y %F --person-scale %F --person-offset-x %F --person-offset-y %F',
        $templateScale, $offsetX, $offsetY, $personScale, $personOffsetX, $personOffsetY
    );

    $descriptors = [
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w']
    ];

    $process = proc_open($cmd, $descriptors, $pipes, dirname($runnerPath));
    if (!is_resource($process)) {
        echo json_encode(['error' => 'Failed to start cutout process']);
        exit;
    }

    $stdout = stream_get_contents($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $returnCode = proc_close($process);

    $resultJson = json_decode($stdout, true);
}

if ($returnCode === 0 && $resultJson && !empty($resultJson['success']) && is_file($outputPath) && filesize($outputPath) > 0) {
    // Generate thumbnail if Photobooth has image processor or thumbs directory
    $thumbsDir = realpath(__DIR__ . '/../data/thumbs');
    if ($thumbsDir && file_exists($outputPath)) {
        $thumbPath = $thumbsDir . DIRECTORY_SEPARATOR . $outFilename;
        // Simple downscale for thumbnail
        try {
            if ($ext === 'png') {
                $im = @imagecreatefrompng($outputPath);
            } else {
                $im = @imagecreatefromjpeg($outputPath);
            }
            if ($im) {
                $w = imagesx($im);
                $h = imagesy($im);
                $nw = 500;
                $nh = intval($h * ($nw / $w));
                $thumb = imagecreatetruecolor($nw, $nh);
                if ($ext === 'png') {
                    imagealphablending($thumb, false);
                    imagesavealpha($thumb, true);
                }
                imagecopyresampled($thumb, $im, 0, 0, 0, 0, $nw, $nh, $w, $h);
                if ($ext === 'png') {
                    imagepng($thumb, $thumbPath);
                } else {
                    imagejpeg($thumb, $thumbPath, 85);
                }
                imagedestroy($thumb);
                imagedestroy($im);
            }
        } catch (\Throwable $t) {
            // Ignore thumb generation error
        }
    }

    $metadata = [
        'requested_engine' => $requestedEngine,
        'used_engine' => (string)($resultJson['used_engine'] ?? $resultJson['engine'] ?? $requestedEngine),
        'fallback' => $fallbackUsed || !empty($resultJson['fallback']),
    ];
    if (!empty($resultJson['fallback_reason'])) {
        $metadata['fallback_reason'] = (string)$resultJson['fallback_reason'];
    }
    if (isset($resultJson['time_ms']) && is_numeric($resultJson['time_ms'])) {
        $metadata['time_ms'] = (float)$resultJson['time_ms'];
    }

    echo json_encode([
        'success' => true,
        'filename' => $outFilename,
        'file' => $outFilename,
        'url' => ($action === 'apply' ? 'data/images/' : 'data/tmp/') . $outFilename,
        'original' => $filename,
        'matting' => $metadata,
    ], JSON_UNESCAPED_SLASHES);
} else {
    $errorMsg = ($resultJson && isset($resultJson['error'])) ? (string)$resultJson['error'] : ($stderr ?: 'Processing failed');
    $errorResponse = ['error' => $errorMsg, 'requested_engine' => $requestedEngine];
    if ($autoFallback) {
        $errorResponse['auto_fallback'] = true;
    }
    echo json_encode($errorResponse, JSON_UNESCAPED_SLASHES);
}
