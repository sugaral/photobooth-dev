<?php

require_once __DIR__ . '/../lib/boot.php';
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}
checkCsrfOrFail($_POST);
session_write_close();
$targetPath = null;
try {
    $file = $_FILES['template'] ?? null;
    if (!$file || $file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
        throw new RuntimeException('请选择有效的模板图片');
    }
    if ($file['size'] > 12 * 1024 * 1024) throw new RuntimeException('模板图片不能超过 12 MB');
    $info = @getimagesize($file['tmp_name']);
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!$info || !isset($types[$mime]) || ($info['mime'] ?? '') !== $mime) throw new RuntimeException('仅支持真实的 JPG、PNG、WEBP 图片');
    if (min($info[0], $info[1]) < 512 || max($info[0], $info[1]) > 8192 || $info[0] * $info[1] > 24000000) {
        throw new RuntimeException('图片短边至少 512 像素，最长边不超过 8192 像素，总像素不超过 2400 万');
    }
    $root = dirname(__DIR__);
    $directory = $root . '/resources/img/templates_ai/custom';
    if (!is_dir($directory) && !mkdir($directory, 0755, true)) throw new RuntimeException('无法创建模板目录');
    $id = 'custom_' . bin2hex(random_bytes(12));
    $relative = 'resources/img/templates_ai/custom/' . $id . '.' . $types[$mime];
    $targetPath = $root . '/' . $relative;
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) throw new RuntimeException('保存模板失败');
    $command = 'python -X utf8 ' . escapeshellarg($root . '/bin/validate_ai_template.py') . ' ' . escapeshellarg($targetPath);
    exec($command, $lines, $code);
    $result = json_decode(implode("\n", $lines), true);
    if ($code !== 0 || empty($result['success'])) throw new RuntimeException($result['error'] ?? '模板人脸质检失败，请检查模型服务');
    $title = mb_substr(trim(preg_replace('/[^\p{L}\p{N}_\-\s]/u', '', pathinfo($file['name'], PATHINFO_FILENAME))), 0, 40) ?: '我的写真';
    $row = ['id' => $id, 'title' => $title, 'category' => 'custom', 'sex' => '自定义', 'sex_code' => 'unisex',
        'age_band' => 'unspecified', 'tag' => '我的写真', 'image' => $relative, 'thumb' => $relative,
        'sha256' => hash_file('sha256', $targetPath), 'quality' => $result['quality'], 'created_at' => date(DATE_ATOM)];
    (new \Photobooth\Service\AiTemplateCatalogService($root))->addCustom($row);
    $targetPath = null;
    echo json_encode($row + ['success' => true, 'path' => $relative, 'message' => '模板已通过人脸质检并添加'], JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    if ($targetPath && is_file($targetPath)) unlink($targetPath);
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => $error->getMessage()], JSON_UNESCAPED_UNICODE);
}
