<?php

require_once __DIR__ . '/../lib/boot.php';

use Photobooth\Enum\FolderEnum;
use Photobooth\Image;
use Photobooth\Utility\PathUtility;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$imagesRaw = $_POST['images'] ?? [];
if (is_string($imagesRaw)) {
    $imagesRaw = json_decode($imagesRaw, true) ?: explode(',', $imagesRaw);
}
$images = array_map('trim', (array)$imagesRaw);
$images = array_values(array_filter($images));

if (count($images) < 4) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '请至少选择 4 张照片进行四格排版']);
    exit;
}
$selectedImages = array_slice($images, 0, 4);

$layout = $_POST['layout'] ?? '2x2'; // '2x2' | '1x4_strip'
$theme = $_POST['theme'] ?? 'white'; // 'white' | 'black' | 'pink' | 'violet'
$subtitle = trim($_POST['title'] ?? 'PHOTOBOOTH MEMORY · 自拍纪念');

$imagesDir = realpath(FolderEnum::IMAGES->absolute()) ?: FolderEnum::IMAGES->absolute();
$tmpDir = realpath(FolderEnum::TEMP->absolute()) ?: FolderEnum::TEMP->absolute();
$thumbsDir = realpath(FolderEnum::THUMBS->absolute()) ?: FolderEnum::THUMBS->absolute();

// 1. 验证 4 张源照片
$resolvedPaths = [];
foreach ($selectedImages as $imgName) {
    $clean = basename($imgName);
    if (strpos($clean, '?') !== false) {
        $clean = explode('?', $clean)[0];
    }
    $p = $imagesDir . DIRECTORY_SEPARATOR . $clean;
    if (!file_exists($p)) {
        $p = $tmpDir . DIRECTORY_SEPARATOR . $clean;
    }
    if (!file_exists($p)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => '未找到照片文件: ' . $clean]);
        exit;
    }
    $resolvedPaths[] = $p;
}

// 2. 创建 300 DPI 工业级相纸画布 (4x6 英寸 = 1200 x 1800 像素)
$canvasW = 1200;
$canvasH = 1800;
$canvas = imagecreatetruecolor($canvasW, $canvasH);
imagealphablending($canvas, true);
imagesavealpha($canvas, true);

// 3. 配色方案
$themeColors = [
    'white' => ['bg' => [255, 255, 255], 'fg' => [30, 41, 59], 'sub' => [100, 116, 139], 'line' => [203, 213, 225]],
    'black' => ['bg' => [17, 24, 39], 'fg' => [248, 250, 252], 'sub' => [148, 163, 184], 'line' => [51, 65, 85]],
    'gray' => ['bg' => [100, 116, 139], 'fg' => [255, 255, 255], 'sub' => [226, 232, 240], 'line' => [148, 163, 184]],
    'coffee' => ['bg' => [120, 53, 15], 'fg' => [254, 243, 199], 'sub' => [253, 230, 138], 'line' => [146, 64, 14]],
    'pink' => ['bg' => [253, 242, 248], 'fg' => [157, 23, 77], 'sub' => [219, 39, 119], 'line' => [244, 114, 182]],
    'violet' => ['bg' => [30, 27, 75], 'fg' => [238, 242, 255], 'sub' => [165, 180, 252], 'line' => [99, 102, 241]],
];

if (preg_match('/^#?([a-f0-9]{6})$/i', $theme, $m)) {
    $hex = $m[1];
    $r = hexdec(substr($hex, 0, 2));
    $g = hexdec(substr($hex, 2, 2));
    $b = hexdec(substr($hex, 4, 2));
    $isDark = ($r * 0.299 + $g * 0.587 + $b * 0.114) < 128;
    $col = [
        'bg' => [$r, $g, $b],
        'fg' => $isDark ? [248, 250, 252] : [30, 41, 59],
        'sub' => $isDark ? [148, 163, 184] : [100, 116, 139],
        'line' => $isDark ? [min(255, $r + 30), min(255, $g + 30), min(255, $b + 30)] : [max(0, $r - 30), max(0, $g - 30), max(0, $b - 30)]
    ];
} else {
    $col = $themeColors[$theme] ?? $themeColors['white'];
}

$bgColor = imagecolorallocate($canvas, $col['bg'][0], $col['bg'][1], $col['bg'][2]);
$fgColor = imagecolorallocate($canvas, $col['fg'][0], $col['fg'][1], $col['fg'][2]);
$subColor = imagecolorallocate($canvas, $col['sub'][0], $col['sub'][1], $col['sub'][2]);
$lineColor = imagecolorallocate($canvas, $col['line'][0], $col['line'][1], $col['line'][2]);

imagefilledrectangle($canvas, 0, 0, $canvasW, $canvasH, $bgColor);

// 辅助载入图片函数
function loadGdImage($path) {
    $info = @getimagesize($path);
    if (!$info) return false;
    switch ($info[2]) {
        case IMAGETYPE_JPEG: return @imagecreatefromjpeg($path);
        case IMAGETYPE_PNG: return @imagecreatefrompng($path);
        case IMAGETYPE_WEBP: return @imagecreatefromwebp($path);
        default: return false;
    }
}

// 辅助居中裁剪缩放绘制
function drawImageFit($dst, $src, $dx, $dy, $dw, $dh) {
    if (!$src) return;
    $sw = imagesx($src);
    $sh = imagesy($src);
    $targetAspect = $dw / $dh;
    $srcAspect = $sw / $sh;

    if ($srcAspect > $targetAspect) {
        $cropW = (int)($sh * $targetAspect);
        $cropH = $sh;
        $cropX = (int)(($sw - $cropW) / 2);
        $cropY = 0;
    } else {
        $cropW = $sw;
        $cropH = (int)($sw / $targetAspect);
        $cropX = 0;
        $cropY = (int)(($sh - $cropH) / 2);
    }
    imagecopyresampled($dst, $src, $dx, $dy, $cropX, $cropY, $dw, $dh, $cropW, $cropH);
}

$dateText = date('Y.m.d · H:i');

if ($layout === '1x4_strip') {
    // ----------------------------------------------------
    // 布局 B：韩式人生四格双长条 (1200x1800 包含左右各一条 600x1800)
    // ----------------------------------------------------
    $stripW = 600;
    $stripH = 1800;

    $photoW = 510;
    $photoH = 340;
    $spacing = 24;
    $topMargin = 70;

    // 左右两条分别绘制
    for ($strip = 0; $strip < 2; $strip++) {
        $offsetX = $strip * $stripW;
        $photoX = $offsetX + (int)(($stripW - $photoW) / 2);

        for ($i = 0; $i < 4; $i++) {
            $photoY = $topMargin + $i * ($photoH + $spacing);
            $im = loadGdImage($resolvedPaths[$i]);
            if ($im) {
                drawImageFit($canvas, $im, $photoX, $photoY, $photoW, $photoH);
                imagedestroy($im);
            }
            // 描边装饰
            imagerectangle($canvas, $photoX - 1, $photoY - 1, $photoX + $photoW, $photoY + $photoH, $lineColor);
        }

        // 底部韩式品牌标语与时间戳
        $textY = $topMargin + 4 * ($photoH + $spacing) + 40;
        imagestring($canvas, 5, $offsetX + (int)(($stripW - strlen($subtitle) * 9) / 2), $textY, $subtitle, $fgColor);
        imagestring($canvas, 4, $offsetX + (int)(($stripW - strlen($dateText) * 8) / 2), $textY + 30, $dateText, $subColor);
        imagestring($canvas, 3, $offsetX + (int)(($stripW - 14 * 7) / 2), $textY + 65, "LIFE FOUR CUTS", $subColor);
    }

    // 中央裁切虚线 (Cut Guide Line)
    $dashLine = imagecolorallocate($canvas, 160, 174, 192);
    for ($y = 20; $y < $canvasH - 20; $y += 24) {
        imageline($canvas, 600, $y, 600, $y + 12, $dashLine);
    }
    // 裁切图标提示文字
    imagestring($canvas, 3, 588, 25, "v", $dashLine);
    imagestring($canvas, 2, 584, 50, "CUT", $dashLine);
    imagestring($canvas, 3, 588, $canvasH - 45, "^", $dashLine);

} else {
    // ----------------------------------------------------
    // 布局 A：经典 2x2 四宫格方形排版 (1200x1800)
    // ----------------------------------------------------
    $topMargin = 120;
    $spacingX = 36;
    $spacingY = 36;
    $photoW = 524;
    $photoH = 680;

    $startX = 58;

    $positions = [
        [$startX, $topMargin],
        [$startX + $photoW + $spacingX, $topMargin],
        [$startX, $topMargin + $photoH + $spacingY],
        [$startX + $photoW + $spacingX, $topMargin + $photoH + $spacingY],
    ];

    for ($i = 0; $i < 4; $i++) {
        $pos = $positions[$i];
        $im = loadGdImage($resolvedPaths[$i]);
        if ($im) {
            drawImageFit($canvas, $im, $pos[0], $pos[1], $photoW, $photoH);
            imagedestroy($im);
        }
        imagerectangle($canvas, $pos[0] - 1, $pos[1] - 1, $pos[0] + $photoW, $pos[1] + $photoH, $lineColor);
    }

    // 顶部与底部胶片拍立得文字
    imagestring($canvas, 5, (int)(($canvasW - strlen($subtitle) * 9) / 2), 55, $subtitle, $fgColor);
    $botY = $topMargin + 2 * $photoH + $spacingY + 55;
    imagestring($canvas, 4, (int)(($canvasW - strlen($dateText) * 8) / 2), $botY, $dateText, $subColor);
    imagestring($canvas, 3, (int)(($canvasW - 24 * 7) / 2), $botY + 30, "CLASSIC PHOTO STUDIO 300DPI", $subColor);
}

// 4. 保存 300DPI 输出照片
$outFilename = 'collage_' . date('Ymd_His') . '_' . substr(md5(uniqid()), 0, 6) . '.jpg';
$outPath = $imagesDir . DIRECTORY_SEPARATOR . $outFilename;
$outThumb = $thumbsDir . DIRECTORY_SEPARATOR . $outFilename;

imagejpeg($canvas, $outPath, 98);
imagedestroy($canvas);

// 生成缩略图
try {
    if (class_exists(Image::class)) {
        Image::createThumbnail($outPath, $outThumb);
    }
} catch (\Throwable $t) {
    // 容错
}

echo json_encode([
    'success' => true,
    'file' => $outFilename,
    'image' => PathUtility::getPublicPath('data/images/' . $outFilename),
    'thumb' => PathUtility::getPublicPath('data/thumbs/' . $outFilename),
    'layout' => $layout,
    'theme' => $theme,
    'message' => '四宫格 300DPI 极速排版生成成功！'
], JSON_UNESCAPED_UNICODE);
