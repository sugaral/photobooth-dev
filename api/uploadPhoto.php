<?php

/** @var array $config */

require_once __DIR__ . '/../lib/boot.php';

use Photobooth\Enum\FolderEnum;
use Photobooth\Image;
use Photobooth\Service\DatabaseManagerService;
use Photobooth\Service\LoggerService;

header('Content-Type: application/json');

$logger = LoggerService::getInstance()->getLogger('main');
$logger->debug(basename($_SERVER['PHP_SELF']));

// Ensure ample memory and execution time for high-resolution cameras & phone uploads
@ini_set('memory_limit', '512M');
@set_time_limit(120);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

if (!isset($_FILES['photo'])) {
    echo json_encode(['success' => false, 'error' => '未接收到上传的图片文件']);
    exit;
}

if ($_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    $uploadErrors = [
        UPLOAD_ERR_INI_SIZE   => '上传图片超过服务器大小限制 (upload_max_filesize)',
        UPLOAD_ERR_FORM_SIZE  => '上传图片超过表单大小限制 (MAX_FILE_SIZE)',
        UPLOAD_ERR_PARTIAL    => '图片文件传输中断，仅部分上传',
        UPLOAD_ERR_NO_FILE    => '未选择上传文件',
        UPLOAD_ERR_NO_TMP_DIR => '服务器缺少临时上传目录',
        UPLOAD_ERR_CANT_WRITE => '写入磁盘失败，请检查服务器磁盘空间与权限',
        UPLOAD_ERR_EXTENSION  => '上传被 PHP 扩展程序拦截',
    ];
    $code = $_FILES['photo']['error'];
    $errText = $uploadErrors[$code] ?? ('文件上传异常，错误码: ' . $code);
    $logger->error('uploadPhoto file error: ' . $errText);
    echo json_encode(['success' => false, 'error' => $errText]);
    exit;
}

$file = $_FILES['photo'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($extension, $allowedExtensions)) {
    echo json_encode(['success' => false, 'error' => '不支持的图片格式，仅支持 JPG, PNG, WEBP']);
    exit;
}

try {
    $imageHandler = new Image();
    $database = DatabaseManagerService::getInstance();

    $naming = $config['picture']['naming'] ?? 'dateformatted';
    $imageNewName = Image::createNewFilename($naming, '.jpg');
    $filename_photo = FolderEnum::IMAGES->absolute() . DIRECTORY_SEPARATOR . $imageNewName;
    $filename_thumb = FolderEnum::THUMBS->absolute() . DIRECTORY_SEPARATOR . $imageNewName;

    // Load uploaded image into GD
    $imageResource = $imageHandler->createFromImage($file['tmp_name']);
    if (!$imageResource instanceof \GdImage) {
        throw new \Exception('无法解析上传的图片，请确保文件是完整有效的图像。');
    }

    // EXIF orientation fix if available
    if (function_exists('exif_read_data') && ($extension === 'jpg' || $extension === 'jpeg')) {
        $exif = @exif_read_data($file['tmp_name']);
        if (!empty($exif['Orientation'])) {
            switch ($exif['Orientation']) {
                case 3: // 180°
                    $imageResource = imagerotate($imageResource, 180, 0);
                    break;
                case 6: // -90° (270°)
                    $imageResource = imagerotate($imageResource, -90, 0);
                    break;
                case 8: // +90°
                    $imageResource = imagerotate($imageResource, 90, 0);
                    break;
            }
        }
    }

    $width = imagesx($imageResource);
    $height = imagesy($imageResource);

    // If image exceeds 4K max dimension (e.g. 28MP Pexels photo 4314x6471), downscale smoothly
    // to preserve studio quality while keeping subsequent AI matting and filter effects ultra-fast
    $maxDimension = 3840;
    if ($width > $maxDimension || $height > $maxDimension) {
        $scale = min($maxDimension / $width, $maxDimension / $height);
        $targetWidth = (int)round($width * $scale);
        $targetHeight = (int)round($height * $scale);

        $resizedResource = imagecreatetruecolor($targetWidth, $targetHeight);
        imagecopyresampled($resizedResource, $imageResource, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
        imagedestroy($imageResource);
        $imageResource = $resizedResource;
        $width = $targetWidth;
        $height = $targetHeight;
    }

    // If source is PNG or WebP with possible transparency, blend onto white background
    if ($extension === 'png' || $extension === 'webp') {
        $flatResource = imagecreatetruecolor($width, $height);
        $white = imagecolorallocate($flatResource, 255, 255, 255);
        imagefilledrectangle($flatResource, 0, 0, $width, $height, $white);
        imagecopy($flatResource, $imageResource, 0, 0, 0, 0, $width, $height);
        imagedestroy($imageResource);
        $imageResource = $flatResource;
    }

    // Create thumbnail
    $thumb_size = intval(substr($config['picture']['thumb_size'] ?? '360px', 0, -2)) ?: 360;
    $thumbResource = $imageHandler->resizeImage($imageResource, $thumb_size);
    if ($thumbResource instanceof \GdImage) {
        $imageHandler->jpegQuality = $config['jpeg_quality']['thumb'] ?? 60;
        $imageHandler->saveJpeg($thumbResource, $filename_thumb);
        imagedestroy($thumbResource);
    }

    // Save main photo
    $imageHandler->jpegQuality = $config['jpeg_quality']['image'] ?? 100;
    if (!$imageHandler->saveJpeg($imageResource, $filename_photo)) {
        throw new \Exception('Failed to save photo.');
    }
    imagedestroy($imageResource);

    // Set permissions
    $picture_permissions = $config['picture']['permissions'] ?? '0644';
    @chmod($filename_photo, (int)octdec($picture_permissions));

    // Append to DB if enabled
    if ($config['database']['enabled']) {
        $database->appendContentToDB($imageNewName);
    }

    echo json_encode([
        'success' => true,
        'file' => $imageNewName,
        'url' => '../data/images/' . $imageNewName
    ]);
    exit;
} catch (\Throwable $e) {
    $logger->error('uploadPhoto error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    exit;
}
