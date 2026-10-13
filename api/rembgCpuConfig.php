<?php

require_once '../lib/boot.php';

use Photobooth\Service\ConfigurationService;
use Photobooth\Utility\PathUtility;

header('Content-Type: application/json; charset=utf-8');

$serviceBaseUrl = rtrim((string)($config['rembg']['service_url'] ?? 'http://127.0.0.1:8001'), '/');
$threadsEndpoint = $serviceBaseUrl . '/threads';

// 1. GET: 获取当前配置与运行时 CPU 线程数
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $configuredThreads = (int)($config['rembg']['cpu_threads'] ?? 4);
    $liveThreads = $configuredThreads;
    $maxThreads = 24;
    $serviceOnline = false;

    // 尝试探测 Python 服务运行时状态
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 0.8,
            'ignore_errors' => true,
        ]
    ]);
    $resp = @file_get_contents($threadsEndpoint, false, $ctx);
    if ($resp !== false) {
        $json = json_decode($resp, true);
        if (is_array($json) && isset($json['threads'])) {
            $liveThreads = (int)$json['threads'];
            $maxThreads = (int)($json['max_threads'] ?? $maxThreads);
            $serviceOnline = true;
        }
    }

    echo json_encode([
        'success' => true,
        'threads' => $configuredThreads,
        'live_threads' => $liveThreads,
        'max_threads' => $maxThreads,
        'service_online' => $serviceOnline,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. POST: 更新核心数并即时生效
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

    $threads = isset($inputData['threads']) ? (int)$inputData['threads'] : 4;
    if ($threads < 1) {
        $threads = 1;
    }
    if ($threads > 32) {
        $threads = 32;
    }

    // 2.1 写入持久化配置文件 config/my.config.inc.php
    $configUpdated = false;
    try {
        $configFile = PathUtility::getAbsolutePath('config/my.config.inc.php');
        if (file_exists($configFile)) {
            $userConfig = require $configFile;
            if (is_array($userConfig)) {
                if (!isset($userConfig['rembg']) || !is_array($userConfig['rembg'])) {
                    $userConfig['rembg'] = [];
                }
                $userConfig['rembg']['cpu_threads'] = $threads;
                $configService = ConfigurationService::getInstance();
                $configService->update($userConfig);
                $configUpdated = true;
            }
        }
    } catch (\Throwable $e) {
        // 如果经由 ConfigurationService 校验更新出现异常，进行安全回退文件替换
        $configFile = PathUtility::getAbsolutePath('config/my.config.inc.php');
        if (file_exists($configFile)) {
            $content = file_get_contents($configFile);
            if (preg_match("/(['\"]cpu_threads['\"]\s*=>\s*)\d+/", $content)) {
                $content = preg_replace("/(['\"]cpu_threads['\"]\s*=>\s*)\d+/", "\${1}{$threads}", $content);
            } else {
                $content = preg_replace("/(['\"]rembg['\"]\s*=>\s*\[)/", "\${1}\n        'cpu_threads' => {$threads},", $content);
            }
            @file_put_contents($configFile, $content);
            $configUpdated = true;
        }
    }

    // 2.2 即时热更新 Python AI 微服务（0延迟生效，无需重启进程）
    $serviceUpdated = false;
    $serviceMessage = '';
    $postPayload = json_encode(['threads' => $threads]);
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\nContent-Length: " . strlen($postPayload) . "\r\n",
            'content' => $postPayload,
            'timeout' => 2.0,
            'ignore_errors' => true,
        ]
    ]);
    $resp = @file_get_contents($threadsEndpoint, false, $ctx);
    if ($resp !== false) {
        $json = json_decode($resp, true);
        if (is_array($json) && !empty($json['success'])) {
            $serviceUpdated = true;
            $serviceMessage = $json['message'] ?? "AI 推理核心数已更新为 {$threads} 核";
        }
    }

    echo json_encode([
        'success' => true,
        'threads' => $threads,
        'config_updated' => $configUpdated,
        'service_updated' => $serviceUpdated,
        'message' => $serviceMessage ?: "AI抠图已即时切换为 {$threads} 核心并行计算",
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
