<?php

require_once '../lib/boot.php';

use Photobooth\Service\LanguageService;

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

$targetDir = realpath(__DIR__ . '/../data/templates');
if (!$targetDir) {
    $targetDir = __DIR__ . '/../data/templates';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
}

$cleanName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
$newFilename = 'custom_' . time() . '_' . substr(md5(uniqid()), 0, 6) . '.' . $extension;
$targetPath = $targetDir . DIRECTORY_SEPARATOR . $newFilename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    echo json_encode([
        'success' => true,
        'filename' => $newFilename,
        'path' => 'data/templates/' . $newFilename,
        'name' => $cleanName,
        'url' => '../data/templates/' . $newFilename
    ]);
} else {
    echo json_encode(['error' => 'Failed to save template']);
}
