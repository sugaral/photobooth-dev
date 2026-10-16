<?php

require_once __DIR__ . '/../lib/boot.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);
$id = $_POST['id'] ?? $data['id'] ?? '';

if (empty($id)) {
    echo json_encode(['error' => '缺少模板 ID'], JSON_UNESCAPED_UNICODE);
    exit;
}

$jsonFile = __DIR__ . '/../data/ai_templates_custom.json';
if (!file_exists($jsonFile)) {
    echo json_encode(['success' => true]);
    exit;
}

$customList = json_decode(file_get_contents($jsonFile), true) ?: [];
$newList = [];
$deletedFile = null;

foreach ($customList as $item) {
    if ($item['id'] === $id) {
        $deletedFile = $item['thumb'] ?? $item['image'] ?? null;
    } else {
        $newList[] = $item;
    }
}

file_put_contents($jsonFile, json_encode($newList, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

if ($deletedFile) {
    $fullPath = realpath(__DIR__ . '/../' . $deletedFile);
    if ($fullPath && file_exists($fullPath)) {
        @unlink($fullPath);
    }
}

// 同步到发布目录
$runtimeJson = 'C:\\Users\\WS\\Desktop\\photobooth美颜版\\data\\ai_templates_custom.json';
if (file_exists(dirname($runtimeJson))) {
    @copy($jsonFile, $runtimeJson);
}

echo json_encode(['success' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
