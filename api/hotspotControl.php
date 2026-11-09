<?php

/** @var array $config */

use Photobooth\Utility\HotspotUtility;

require_once __DIR__ . '/../lib/boot.php';

header('Content-Type: application/json; charset=utf-8');

$action = isset($_GET['action']) ? trim((string)$_GET['action']) : 'start';

if ($action === 'start') {
    $started = HotspotUtility::ensureStarted($config);
    echo json_encode([
        'success' => true,
        'action' => 'start',
        'triggered' => $started,
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
}

if ($action === 'status') {
    echo json_encode([
        'success' => true,
        'action' => 'status',
        'is_windows' => PHP_OS_FAMILY === 'Windows',
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
}

http_response_code(400);
echo json_encode([
    'success' => false,
    'error' => 'Unknown action: ' . $action,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
exit();
