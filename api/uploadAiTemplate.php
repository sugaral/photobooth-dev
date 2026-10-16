<?php

require_once __DIR__ . '/../lib/boot.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

if (!isset($_FILES['template']) || $_FILES['template']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'No valid template file uploaded']);
    exit;
}

$file = $_FILES['template'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($extension, $allowedExtensions)) {
    echo json_encode(['error' => 'Unsupported image format. Allowed: JPG, PNG, WEBP']);
    exit;
}

// 目标目录：resources/img/templates_ai
$targetDir = realpath(__DIR__ . '/../resources/img/templates_ai');
if (!$targetDir) {
    $targetDir = __DIR__ . '/../resources/img/templates_ai';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
}

$rawTitle = pathinfo($file['name'], PATHINFO_FILENAME);
$cleanTitle = mb_substr(trim(preg_replace('/[^\p{L}\p{N}_\-\s]/u', '', $rawTitle)), 0, 20);
if (empty($cleanTitle)) {
    $cleanTitle = '自定义模板';
}

$newFilename = 'custom_' . time() . '_' . substr(md5(uniqid()), 0, 6) . '.' . $extension;
$targetPath = $targetDir . DIRECTORY_SEPARATOR . $newFilename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // 同步到运行端目录（如果存在）
    $runtimeDir = 'C:\\Users\\WS\\Desktop\\photobooth美颜版\\resources\\img\\templates_ai';
    if (is_dir($runtimeDir)) {
        @copy($targetPath, $runtimeDir . DIRECTORY_SEPARATOR . $newFilename);
    }

    echo json_encode([
        'success' => true,
        'id' => pathinfo($newFilename, PATHINFO_FILENAME),
        'title' => $cleanTitle,
        'category' => 'custom',
        'image' => 'resources/img/templates_ai/' . $newFilename,
        'url' => 'resources/img/templates_ai/' . $newFilename
    ]);
} else {
    echo json_encode(['error' => 'Failed to save custom template']);
}
