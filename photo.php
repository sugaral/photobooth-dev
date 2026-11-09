<?php

/** @var array $config */

use Photobooth\Enum\FolderEnum;
use Photobooth\Utility\HotspotUtility;

require_once __DIR__ . '/lib/boot.php';

HotspotUtility::ensureStarted($config);

$image = (isset($_GET['image']) && $_GET['image'] !== '') ? basename((string) $_GET['image']) : '';
$valid = $image !== '' && preg_match('/^[A-Za-z0-9._-]+$/', $image);
$isVideo = $valid && in_array(strtolower(pathinfo($image, PATHINFO_EXTENSION)), ['mp4', 'webm', 'mov'], true);
$exists = $valid && is_file(FolderEnum::IMAGES->absolute() . DIRECTORY_SEPARATOR . $image);

$inlineUrl = 'api/download.php?image=' . rawurlencode($image) . '&inline=1';
$downloadUrl = 'api/download.php?image=' . rawurlencode($image);
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>照片领取 - 智能照相亭</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
        font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
        background: #FFFDF5;
        color: #1a1a1a;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px 16px 40px;
    }
    .brand {
        margin: 8px 0 18px;
        text-align: center;
    }
    .brand-title {
        display: inline-block;
        font-size: 22px;
        font-weight: 900;
        letter-spacing: 2px;
        background: #FFD93D;
        border: 2.5px solid #1a1a1a;
        box-shadow: 4px 4px 0 #1a1a1a;
        padding: 8px 20px;
        transform: rotate(-1.5deg);
    }
    .brand-sub { margin-top: 10px; font-size: 13px; color: #666; letter-spacing: 1px; }
    .card {
        width: 100%;
        max-width: 420px;
        background: #fff;
        border: 2.5px solid #1a1a1a;
        box-shadow: 6px 6px 0 #1a1a1a;
        padding: 14px;
    }
    .card img, .card video {
        display: block;
        width: 100%;
        height: auto;
        border: 2px solid #1a1a1a;
        background: #f3f0e6;
    }
    .actions { width: 100%; max-width: 420px; margin-top: 20px; }
    .btn-download {
        display: block;
        width: 100%;
        text-align: center;
        text-decoration: none;
        font-size: 18px;
        font-weight: 800;
        color: #1a1a1a;
        background: #FF6B6B;
        border: 2.5px solid #1a1a1a;
        box-shadow: 5px 5px 0 #1a1a1a;
        padding: 15px 0;
        letter-spacing: 2px;
    }
    .btn-download:active { transform: translate(3px, 3px); box-shadow: 2px 2px 0 #1a1a1a; }
    .tip {
        margin-top: 16px;
        font-size: 13px;
        line-height: 1.8;
        color: #555;
        background: #fff;
        border: 2px dashed #1a1a1a;
        padding: 10px 14px;
        width: 100%;
        max-width: 420px;
    }
    .error-box {
        margin-top: 60px;
        background: #fff;
        border: 2.5px solid #1a1a1a;
        box-shadow: 6px 6px 0 #1a1a1a;
        padding: 30px 24px;
        text-align: center;
        max-width: 420px;
    }
    .error-box .code { font-size: 40px; font-weight: 900; color: #FF6B6B; }
    .error-box p { margin-top: 10px; font-size: 14px; color: #555; }
</style>
</head>
<body>
<?php if ($exists): ?>
    <div class="brand">
        <div class="brand-title">照片领取</div>
        <div class="brand-sub">智能照相亭 · 记录美好瞬间</div>
    </div>
    <div class="card">
        <?php if ($isVideo): ?>
            <video src="<?= htmlspecialchars($inlineUrl) ?>" controls playsinline></video>
        <?php else: ?>
            <img src="<?= htmlspecialchars($inlineUrl) ?>" alt="您的照片">
        <?php endif; ?>
    </div>
    <div class="actions">
        <a class="btn-download" href="<?= htmlspecialchars($downloadUrl) ?>">保存到手机</a>
    </div>
    <div class="tip">
        若点击按钮没有反应（如微信内置浏览器），可直接<b>长按上方图片</b>，选择“保存图片”。
    </div>
<?php else: ?>
    <div class="error-box">
        <div class="code">404</div>
        <p>照片不存在或已被删除。<br>请回到照相亭重新扫码。</p>
    </div>
<?php endif; ?>
</body>
</html>
