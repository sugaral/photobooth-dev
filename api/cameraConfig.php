<?php

require_once __DIR__ . '/../lib/boot.php';

header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/../data/config/camera.json';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        $data = $_POST;
    }

    $id = trim((string)($data['id'] ?? $data['deviceId'] ?? ''));
    $label = trim((string)($data['label'] ?? $data['deviceLabel'] ?? ''));

    $payload = [
        'id' => $id,
        'label' => $label,
        'updated_at' => date('Y-m-d H:i:s'),
    ];

    @file_put_contents($configFile, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode([
        'success' => true,
        'camera' => $payload,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// GET
$current = [
    'id' => '',
    'label' => '',
];

if (file_exists($configFile)) {
    $content = @file_get_contents($configFile);
    $decoded = json_decode($content, true);
    if (is_array($decoded)) {
        $current = array_merge($current, $decoded);
    }
}

echo json_encode([
    'success' => true,
    'camera' => $current,
], JSON_UNESCAPED_UNICODE);
