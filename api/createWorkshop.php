<?php

declare(strict_types=1);

require_once __DIR__ . '/../lib/boot.php';

use Photobooth\Enum\FolderEnum;
use Photobooth\Image;
use Photobooth\Service\CaptureSourceService;
use Photobooth\Service\DatabaseManagerService;
use Photobooth\Service\WorkshopService;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}
checkCsrfOrFail($_POST);

$output = $thumbnail = null;
$backgroundFiles = [];
try {
    $layoutId = $_POST['layout'] ?? '';
    $tokens = $_POST['tokens'] ?? [];
    if (!is_string($layoutId) || !is_array($tokens) || !array_is_list($tokens)) {
        throw new InvalidArgumentException('拍摄数据无效，请重新拍摄');
    }
    $layout = WorkshopService::layout($layoutId);
    if (count($tokens) !== count($layout['cells'])) {
        throw new InvalidArgumentException('照片数量与模板不符，请完成全部拍摄');
    }
    foreach ($tokens as $token) {
        if (!is_string($token) || !preg_match('/^[a-f0-9]{48}$/D', $token)) {
            throw new InvalidArgumentException('拍摄凭证无效，请重新拍摄');
        }
    }
    if (count(array_unique($tokens)) !== count($tokens)) {
        throw new InvalidArgumentException('每个位置需要一张独立拍摄的照片');
    }
    $template = $_POST['template'] ?? '';
    if (!is_string($template)) throw new InvalidArgumentException('背景模板无效');
    $templatePath = WorkshopService::resolveBackground($template);
    // A retry after a lost response must return the same saved photograph.
    $frameHash = isset($layout['background']) ? hash_file('sha256', dirname(__DIR__) . '/' . $layout['background']) : '';
    $key = hash('sha256', json_encode($layout, JSON_THROW_ON_ERROR) . ':' . $frameHash . ':' . implode(':', $tokens) . ':' . ($templatePath ? hash_file('sha256', $templatePath) : ''));
    $cached = $_SESSION['workshop_exports'][$key] ?? null;
    if ($cached && is_file(FolderEnum::IMAGES->absolute() . '/' . $cached['file'])) {
        echo json_encode($cached, JSON_UNESCAPED_UNICODE);
        exit;
    }
    $captures = new CaptureSourceService();
    $sources = array_map(fn (string $token) => $captures->resolve($token, $_SESSION), $tokens);
    if ($templatePath !== null) {
        set_time_limit(600);
        foreach ($sources as $index => $source) {
            $processed = FolderEnum::TEMP->absolute() . '/workshop_bg_' . bin2hex(random_bytes(12)) . '.jpg';
            $backgroundFiles[] = $processed;
            WorkshopService::applyBackground($source, $templatePath, $processed, $config['rembg'] ?? []);
            $sources[$index] = $processed;
        }
    }
    $file = 'workshop_' . date('Ymd_His') . '_' . bin2hex(random_bytes(6)) . '.jpg';
    $output = FolderEnum::IMAGES->absolute() . '/' . $file;
    $thumbnail = FolderEnum::THUMBS->absolute() . '/' . $file;
    (new WorkshopService())->compose($layoutId, $sources, $output);
    $imageHandler = new Image();
    $fullImage = $imageHandler->createFromImage($output);
    if (!$fullImage instanceof \GdImage) {
        throw new RuntimeException('读取成片失败，请重试');
    }
    try {
        $thumbImage = $imageHandler->resizeImage($fullImage, (int)$config['picture']['thumb_size']);
        if (!$thumbImage instanceof \GdImage || !$imageHandler->saveJpeg($thumbImage, $thumbnail)) {
            throw new RuntimeException('生成缩略图失败，请重试');
        }
    } finally {
        if (isset($thumbImage) && $thumbImage instanceof \GdImage && $thumbImage !== $fullImage) imagedestroy($thumbImage);
        imagedestroy($fullImage);
    }
    if ($config['database']['enabled']) {
        DatabaseManagerService::getInstance()->appendContentToDB($file);
    }
    $response = [
        'success' => true, 'file' => $file, 'images' => [$file],
        'image' => FolderEnum::IMAGES->public() . '/' . $file,
        'layout' => $layoutId, 'width' => $layout['width'], 'height' => $layout['height'], 'dpi' => $layout['dpi'],
    ];
    $exports = $_SESSION['workshop_exports'] ?? [];
    $exports[$key] = $response;
    $_SESSION['workshop_exports'] = array_slice($exports, -20, null, true);
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    foreach ([$output, $thumbnail] as $path) {
        if ($path && is_file($path)) {
            unlink($path);
        }
    }
    http_response_code($error instanceof InvalidArgumentException ? 400 : 422);
    echo json_encode(['success' => false, 'error' => $error->getMessage()], JSON_UNESCAPED_UNICODE);
} finally {
    foreach ($backgroundFiles as $path) {
        if (is_file($path)) unlink($path);
    }
}
