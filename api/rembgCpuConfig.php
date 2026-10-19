<?php

require_once __DIR__ . '/../lib/boot.php';

use Photobooth\Service\ConfigurationService;
use Photobooth\Utility\PathUtility;

header('Content-Type: application/json; charset=utf-8');

$serviceBaseUrl = rtrim((string)($config['rembg']['service_url'] ?? 'http://127.0.0.1:8001'), '/');
$deviceEndpoint = $serviceBaseUrl . '/device';

// 1. GET: 获取当前配置与运行时计算设备与 CPU 线程数
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $configuredGpuMode = (string)($config['rembg']['gpu_mode'] ?? 'auto');
    if ($configuredGpuMode === 'gpu') $configuredGpuMode = 'auto';
    $configuredThreads = (int)($config['rembg']['cpu_threads'] ?? 8);
    $configuredEngine = (string)($config['rembg']['engine'] ?? 'birefnet');
    $liveDevice = $configuredGpuMode;
    $liveThreads = $configuredThreads;
    $isGpuActive = false;
    $sessionInitialized = false;
    $gpuName = '';
    $maxThreads = 24;
    $serviceOnline = false;

    // 探测 Python 服务运行时状态
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 0.8,
            'ignore_errors' => true,
        ]
    ]);
    $resp = @file_get_contents($deviceEndpoint, false, $ctx);
    if ($resp !== false) {
        $json = json_decode($resp, true);
        if (is_array($json) && ($json['status'] ?? '') === 'ok' && !empty($json['success'])) {
            $liveDevice = $json['device'] ?? $liveDevice;
            $liveThreads = (int)($json['threads'] ?? $liveThreads);
            $maxThreads = (int)($json['max_threads'] ?? $maxThreads);
            $gpuName = $json['gpu_name'] ?? $gpuName;
            $isGpuActive = !empty($json['is_gpu_active']);
            $sessionInitialized = !empty($json['session_initialized']);
            $serviceOnline = true;
        }
    }

    echo json_encode([
        'success' => true,
        'gpu_mode' => $configuredGpuMode,
        'threads' => $configuredThreads,
        'engine' => $configuredEngine,
        'live_device' => $liveDevice,
        'is_gpu_active' => $isGpuActive,
        'session_initialized' => $sessionInitialized,
        'gpu_name' => $gpuName,
        'live_threads' => $liveThreads,
        'max_threads' => $maxThreads,
        'service_online' => $serviceOnline,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. POST: 更新计算设备(GPU/CPU)与核心数并即时生效
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputData = [];
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $decoded = json_decode($rawInput, true);
        if (is_array($decoded)) {
            $inputData = $decoded;
        }
    }
    if (empty($inputData)) {
        $inputData = $_POST;
    }

    $rawGpuMode = $inputData['gpu_mode'] ?? $inputData['device'] ?? null;
    $gpuMode = null;
    if ($rawGpuMode !== null) {
        $gpuMode = strtolower(trim((string)$rawGpuMode));
        if ($gpuMode === 'gpu') $gpuMode = 'auto';
        if (!in_array($gpuMode, ['auto', 'cpu', 'cuda', 'directml'], true)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'error' => '不支持的推理设备']);
            exit;
        }
    }

    $threads = isset($inputData['threads']) ? (int)$inputData['threads'] : null;
    if ($threads !== null) {
        $threads = max(1, min(32, $threads));
    }
    $engine = isset($inputData['engine']) ? strtolower(trim((string)$inputData['engine'])) : null;
    if ($engine !== null && !in_array($engine, ['birefnet', 'rmbg2'], true)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'error' => '不支持的抠图模型']);
        exit;
    }

    // 2.1 写入持久化配置文件 config/my.config.inc.php
    $configUpdated = false;
    $previousConfig = null;
    try {
        $configFile = PathUtility::getAbsolutePath('config/my.config.inc.php');
        if (file_exists($configFile)) {
            $userConfig = require $configFile;
            if (is_array($userConfig)) {
                $previousConfig = $userConfig;
                if (!isset($userConfig['rembg']) || !is_array($userConfig['rembg'])) {
                    $userConfig['rembg'] = [];
                }
                if ($gpuMode !== null) {
                    $userConfig['rembg']['gpu_mode'] = $gpuMode;
                }
                if ($threads !== null) {
                    $userConfig['rembg']['cpu_threads'] = $threads;
                }
                if ($engine !== null) {
                    $userConfig['rembg']['engine'] = $engine;
                }
                $configService = ConfigurationService::getInstance();
                $configService->update($userConfig);
                $configUpdated = true;
            }
        }
    } catch (\Throwable $e) {
        $configFile = PathUtility::getAbsolutePath('config/my.config.inc.php');
        if (file_exists($configFile)) {
            $content = file_get_contents($configFile);
            if ($gpuMode !== null) {
                if (preg_match("/(['\"]gpu_mode['\"]\s*=>\s*)['\"][^'\"]*['\"]/", $content)) {
                    $content = preg_replace("/(['\"]gpu_mode['\"]\s*=>\s*)['\"][^'\"]*['\"]/", "\${1}'{$gpuMode}'", $content);
                } else {
                    $content = preg_replace("/(['\"]rembg['\"]\s*=>\s*\[)/", "\${1}\n        'gpu_mode' => '{$gpuMode}',", $content);
                }
            }
            if ($threads !== null) {
                if (preg_match("/(['\"]cpu_threads['\"]\s*=>\s*)\d+/", $content)) {
                    $content = preg_replace("/(['\"]cpu_threads['\"]\s*=>\s*)\d+/", "\${1}{$threads}", $content);
                } else {
                    $content = preg_replace("/(['\"]rembg['\"]\s*=>\s*\[)/", "\${1}\n        'cpu_threads' => {$threads},", $content);
                }
            }
            if ($engine !== null) {
                if (preg_match("/(['\"]engine['\"]\s*=>\s*)['\"][^'\"]*['\"]/", $content)) {
                    $content = preg_replace("/(['\"]engine['\"]\s*=>\s*)['\"][^'\"]*['\"]/", "\${1}'{$engine}'", $content);
                } else {
                    $content = preg_replace("/(['\"]rembg['\"]\s*=>\s*\[)/", "\${1}\n        'engine' => '{$engine}',", $content);
                }
            }
            @file_put_contents($configFile, $content);
            $configUpdated = true;
        }
    }

    // 2.2 即时热更新 Python AI 微服务（0延迟生效，无需重启进程）
    $serviceUpdated = false;
    $serviceMessage = '';
    $postPayloadArr = [];
    if ($gpuMode !== null) {
        $postPayloadArr['device'] = $gpuMode;
    }
    if ($threads !== null) {
        $postPayloadArr['threads'] = $threads;
    }

    $postPayload = json_encode($postPayloadArr);
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\nContent-Length: " . strlen($postPayload) . "\r\n",
            'content' => $postPayload,
            'timeout' => 3.0,
            'ignore_errors' => true,
        ]
    ]);
    $resp = @file_get_contents($deviceEndpoint, false, $ctx);
    if ($resp !== false) {
        $json = json_decode($resp, true);
        if (is_array($json) && !empty($json['success'])) {
            $serviceUpdated = true;
            $serviceMessage = $json['message'] ?? '';
        }
    }

    if (!$serviceMessage) {
        if (in_array($gpuMode, ['cuda', 'directml'], true)) {
            $serviceMessage = '所选 GPU provider 当前不可用，未切换设备';
        } elseif ($threads !== null) {
            $serviceMessage = "AI抠图已即时切换为 CPU {$threads} 核心并行计算";
        } else {
            $serviceMessage = 'AI抠图配置已更新';
        }
    }

    // An explicit GPU selection is valid only when the resident service
    // acknowledges the provider. Restore the previous file if the runtime
    // rejected it, so the next restart cannot silently use another device.
    if (in_array($gpuMode, ['cuda', 'directml'], true) && !$serviceUpdated) {
        if (is_array($previousConfig)) {
            try {
                ConfigurationService::getInstance()->update($previousConfig);
                $configUpdated = false;
            } catch (\Throwable $e) {
                // Keep the original error response; no alternate device is used.
            }
        }
        http_response_code(422);
    }

    $applied = $serviceUpdated || ($gpuMode === null && $configUpdated);
    echo json_encode([
        'success' => $applied,
        'gpu_mode' => $gpuMode,
        'threads' => $threads,
        'engine' => $engine,
        'config_updated' => $configUpdated,
        'service_updated' => $serviceUpdated,
        'applied' => $applied,
        'message' => $serviceMessage,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
