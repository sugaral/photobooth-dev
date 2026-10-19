<?php

require_once __DIR__ . '/../lib/boot.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$json = json_decode(file_get_contents('php://input'), true);
$data = $_POST ?: (is_array($json) ? $json : []);
checkCsrfOrFail($data);
session_write_close();
try {
    $id = $data['id'] ?? '';
    if (!is_string($id) || $id === '' || strlen($id) > 128) throw new RuntimeException('缺少有效的模板 ID');
    (new \Photobooth\Service\AiTemplateCatalogService())->deleteCustom($id);
    echo json_encode(['success' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => $error->getMessage()], JSON_UNESCAPED_UNICODE);
}
