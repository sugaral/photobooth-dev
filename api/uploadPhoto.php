<?php

/** @var array $config */

require_once __DIR__ . '/../lib/boot.php';

use Photobooth\Enum\FolderEnum;
use Photobooth\Image;
use Photobooth\Service\DatabaseManagerService;
use Photobooth\Service\LoggerService;
use Photobooth\Service\CompositeSaveService;

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

checkCsrfOrFail($_POST);

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

$journal = null;
$temporaryFiles = [];
try {
    // Reject oversized/invalid inputs before allocating a decoded GD image.
    $dimensions = @getimagesize($file['tmp_name']);
    if (!$dimensions || !in_array($dimensions[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
        throw new \InvalidArgumentException('图片内容格式无效');
    }
    if ($file['size'] > 32 * 1024 * 1024 || $dimensions[0] > 12000 || $dimensions[1] > 12000 || $dimensions[0] * $dimensions[1] > 24000000) {
        throw new \InvalidArgumentException('图片超过限制：最大 32 MB、2400 万像素、单边 12000 像素');
    }
    $imageHandler = new Image();
    $database = DatabaseManagerService::getInstance();

    $naming = $config['picture']['naming'] ?? 'dateformatted';
    $imageNewName = pathinfo(Image::createNewFilename($naming, '.jpg'), PATHINFO_FILENAME) . '_' . bin2hex(random_bytes(8)) . '.jpg';
    $saveId = (string)($_POST['composite_save_id'] ?? '');
    if ($saveId !== '') {
        // boot.php selects a private session directory outside the document root.
        $journalDirectory = realpath(session_save_path());
        $publicRoot = realpath(dirname(__DIR__));
        if (!$journalDirectory || str_starts_with(strtolower($journalDirectory . DIRECTORY_SEPARATOR), strtolower($publicRoot . DIRECTORY_SEPARATOR))) {
            throw new \RuntimeException('合成保存记录目录必须位于网站根目录之外');
        }
        $journal = new CompositeSaveService($journalDirectory . DIRECTORY_SEPARATOR . 'composite-' . hash('sha256', $publicRoot) . '.sqlite');
        $owner = hash('sha256', session_id());
        $record = $journal->begin($owner, $saveId, hash_file('sha256', $file['tmp_name']));
        $imageNewName = $record['filename'];
        if ($record['completed']) {
            if (!is_file(FolderEnum::IMAGES->absolute() . DIRECTORY_SEPARATOR . $imageNewName)) {
                throw new \DomainException('已保存成片已被删除，请重新编辑后保存');
            }
            $journal->complete($owner, $saveId);
            echo json_encode(['success' => true, 'file' => $imageNewName, 'replayed' => true]);
            exit;
        }
    }
    $filename_photo = FolderEnum::IMAGES->absolute() . DIRECTORY_SEPARATOR . $imageNewName;
    $filename_thumb = FolderEnum::THUMBS->absolute() . DIRECTORY_SEPARATOR . $imageNewName;
    $photoPart = tempnam(FolderEnum::IMAGES->absolute(), '.upload-');
    if ($photoPart) $temporaryFiles[] = $photoPart;
    $thumbPart = tempnam(FolderEnum::THUMBS->absolute(), '.upload-');
    if ($thumbPart) $temporaryFiles[] = $thumbPart;
    if (!$photoPart || !$thumbPart) throw new \RuntimeException('无法创建临时照片文件');

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
    if ($saveId === '' && ($width > $maxDimension || $height > $maxDimension)) {
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
        if (!$imageHandler->saveJpeg($thumbResource, $thumbPart)) throw new \RuntimeException('缩略图保存失败');
        imagedestroy($thumbResource);
    } else throw new \RuntimeException('缩略图生成失败');

    // Save main photo
    $imageHandler->jpegQuality = $config['jpeg_quality']['image'] ?? 100;
    if (!$imageHandler->saveJpeg($imageResource, $photoPart)) {
        throw new \Exception('Failed to save photo.');
    }
    imagedestroy($imageResource);
    if (!rename($thumbPart, $filename_thumb) || !rename($photoPart, $filename_photo)) {
        throw new \RuntimeException('无法发布成片，请重试');
    }

    // Set permissions
    $picture_permissions = $config['picture']['permissions'] ?? '0644';
    @chmod($filename_photo, (int)octdec($picture_permissions));

    // Append to DB if enabled
    if ($config['database']['enabled']) {
        $database->appendContentToDB($imageNewName);
    }
    if ($journal) $journal->complete($owner, $saveId);

    echo json_encode([
        'success' => true,
        'file' => $imageNewName,
        'url' => '../data/images/' . $imageNewName
    ]);
    exit;
} catch (\Throwable $e) {
    if ($journal) $journal->rollback();
    foreach ($temporaryFiles as $temporaryFile) {
        if (is_file($temporaryFile)) @unlink($temporaryFile);
    }
    http_response_code($e instanceof \DomainException ? 409 : ($e instanceof \InvalidArgumentException ? 422 : 500));
    $logger->error('uploadPhoto error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    exit;
}
