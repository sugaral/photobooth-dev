<?php

require_once __DIR__ . '/../lib/boot.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$jsonData = json_decode($rawInput, true);

$targetFile = '';
if (isset($_POST['file']) && !empty($_POST['file'])) {
    $targetFile = $_POST['file'];
} elseif (isset($_POST['template']) && !empty($_POST['template'])) {
    $targetFile = $_POST['template'];
} elseif (isset($_POST['path']) && !empty($_POST['path'])) {
    $targetFile = $_POST['path'];
} elseif (is_array($jsonData)) {
    $targetFile = $jsonData['file'] ?? ($jsonData['template'] ?? ($jsonData['path'] ?? ''));
}

$filename = basename(trim($targetFile));

if (empty($filename)) {
    http_response_code(400);
    echo json_encode(['error' => 'No template specified']);
    exit;
}

// Strict security: only allow deletion of custom template files
if (!preg_match('/^custom_[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i', $filename)) {
    http_response_code(403);
    echo json_encode(['error' => 'Only custom user-uploaded templates can be deleted']);
    exit;
}

$targetDir = realpath(__DIR__ . '/../data/templates');
if (!$targetDir || !is_dir($targetDir)) {
    http_response_code(404);
    echo json_encode(['error' => 'Templates directory not found']);
    exit;
}

$filePath = $targetDir . DIRECTORY_SEPARATOR . $filename;
$realFilePath = realpath($filePath);

// Check path traversal and directory containment
if (!$realFilePath || !file_exists($realFilePath) || strpos($realFilePath, $targetDir) !== 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Template file not found or already deleted']);
    exit;
}

if (@unlink($realFilePath)) {
    echo json_encode([
        'success' => true,
        'message' => 'Template deleted successfully',
        'file' => $filename
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete template file']);
}
