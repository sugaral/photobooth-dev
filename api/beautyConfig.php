<?php

require_once __DIR__ . '/../lib/boot.php';

use Photobooth\Service\ConfigurationService;
use Photobooth\Utility\PathUtility;

header('Content-Type: application/json; charset=utf-8');

$beautyCfg = is_array($config['beauty'] ?? null) ? $config['beauty'] : [];

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// 1. GET: 获取当前默认美颜配置
if ($method === 'GET') {
    echo json_encode([
        'success' => true,
        'enabled' => isset($beautyCfg['enabled']) ? (bool)$beautyCfg['enabled'] : true,
        'auto_apply' => isset($beautyCfg['auto_apply']) ? (bool)$beautyCfg['auto_apply'] : true,
        'default_eye' => (int)($beautyCfg['default_eye'] ?? 15),
        'default_slim' => (int)($beautyCfg['default_slim'] ?? 15),
        'default_smooth' => (int)($beautyCfg['default_smooth'] ?? 20),
        'default_white' => (int)($beautyCfg['default_white'] ?? 15),
        'default_rosy' => (int)($beautyCfg['default_rosy'] ?? 20),
        'default_clarity' => (int)($beautyCfg['default_clarity'] ?? 15),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. POST: 更新默认美颜设置
if ($method === 'POST') {
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

    $enabled = isset($inputData['enabled']) ? filter_var($inputData['enabled'], FILTER_VALIDATE_BOOLEAN) : (isset($beautyCfg['enabled']) ? (bool)$beautyCfg['enabled'] : true);
    $autoApply = isset($inputData['auto_apply']) ? filter_var($inputData['auto_apply'], FILTER_VALIDATE_BOOLEAN) : (isset($beautyCfg['auto_apply']) ? (bool)$beautyCfg['auto_apply'] : true);
    $eye = isset($inputData['default_eye']) ? max(0, min(100, (int)$inputData['default_eye'])) : (int)($beautyCfg['default_eye'] ?? 15);
    $slim = isset($inputData['default_slim']) ? max(0, min(100, (int)$inputData['default_slim'])) : (int)($beautyCfg['default_slim'] ?? 15);
    $smooth = isset($inputData['default_smooth']) ? max(0, min(100, (int)$inputData['default_smooth'])) : (int)($beautyCfg['default_smooth'] ?? 20);
    $white = isset($inputData['default_white']) ? max(0, min(100, (int)$inputData['default_white'])) : (int)($beautyCfg['default_white'] ?? 15);
    $rosy = isset($inputData['default_rosy']) ? max(0, min(100, (int)$inputData['default_rosy'])) : (int)($beautyCfg['default_rosy'] ?? 20);
    $clarity = isset($inputData['default_clarity']) ? max(0, min(100, (int)$inputData['default_clarity'])) : (int)($beautyCfg['default_clarity'] ?? 15);

    $configUpdated = false;
    $configFile = PathUtility::getAbsolutePath('config/my.config.inc.php');
    if (file_exists($configFile)) {
        $userConfig = require $configFile;
        if (is_array($userConfig)) {
            if (!isset($userConfig['beauty']) || !is_array($userConfig['beauty'])) {
                $userConfig['beauty'] = [];
            }
            $userConfig['beauty']['enabled'] = $enabled;
            $userConfig['beauty']['auto_apply'] = $autoApply;
            $userConfig['beauty']['default_eye'] = $eye;
            $userConfig['beauty']['default_slim'] = $slim;
            $userConfig['beauty']['default_smooth'] = $smooth;
            $userConfig['beauty']['default_white'] = $white;
            $userConfig['beauty']['default_rosy'] = $rosy;
            $userConfig['beauty']['default_clarity'] = $clarity;

            try {
                $configService = ConfigurationService::getInstance();
                $configService->update($userConfig);
                $configUpdated = true;
            } catch (\Throwable $e) {
                // Fallback: direct update
                $content = "<?php\n\nreturn " . var_export($userConfig, true) . ";\n";
                @file_put_contents($configFile, $content);
                $configUpdated = true;
            }
        }
    }

    echo json_encode([
        'success' => $configUpdated,
        'message' => '默认美颜参数已更新并即时生效',
        'config' => [
            'enabled' => $enabled,
            'auto_apply' => $autoApply,
            'default_eye' => $eye,
            'default_slim' => $slim,
            'default_smooth' => $smooth,
            'default_white' => $white,
            'default_rosy' => $rosy,
            'default_clarity' => $clarity,
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
