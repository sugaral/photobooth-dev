<?php

use Photobooth\Service\LanguageService;
use Photobooth\Utility\PathUtility;

$languageService = LanguageService::getInstance();
$previewFlipClass = $config['preview']['flip'];
$previewStyleClass = $config['preview']['style'];
$previewShowPictureFrame = $config['preview']['showFrame'] && !empty($config['picture']['frame']);
$extendPreviewAsPicture = $config['preview']['showFrame'] && $config['picture']['extend_by_frame'] && $config['preview']['extend_by_frame'];
$l = $t = $r = $b = 0;
$x = !empty($config['preview']['videoWidth']) ? $config['preview']['videoWidth'] : 1280;
$y = !empty($config['preview']['videoHeight']) ? $config['preview']['videoHeight'] : 720;
$comp = $prev_ratio = $x / $y;
$prev_l = $prev_t = 0;
$prev_h = $prev_w = 100;

if ($extendPreviewAsPicture) {
    $l = $config['picture']['frame_left_percentage'] / 100;
    $t = $config['picture']['frame_top_percentage'] / 100;
    $r = $config['picture']['frame_right_percentage'] / 100;
    $b = $config['picture']['frame_bottom_percentage'] / 100;

    $hori_ratio = 1 - ($l + $r);
    $vert_ratio = 1 - ($t + $b);

    $prev_ratio = ($hori_ratio * $x) / ($vert_ratio * $y);

    $prev_h = $vert_ratio * 100;
    $prev_w = $hori_ratio * 100;

    $prev_l = 100 * ($previewFlipClass === 'flip-vertical' ? $r : $l);
    $prev_t = 100 * ($previewFlipClass === 'flip-horizontal' ? $b : $t);
}

$composed_style = '
	top:' . $prev_t . '%;
	left:' . $prev_l . '%;
	height:' . $prev_h . '%;
	width:' . $prev_w . '%;
	aspect-ratio:' . $prev_ratio;

echo '<div class="preview">';
echo '<div id="preview-container" style="aspect-ratio: ' . $comp . '">';
echo '<div id="preview--video-container" style="position:relative;width:100%;height:100%;">';
echo '<video id="preview--video" style="' . $composed_style . '" class="' . $previewFlipClass . ' ' . $previewStyleClass . '" autoplay playsinline></video>';
echo '<video id="preview--face-beauty-video" style="' . $composed_style . '; position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; pointer-events:none; z-index:2; opacity:0; transition:opacity 0.2s ease, filter 0.15s ease;" class="' . $previewFlipClass . ' ' . $previewStyleClass . '" autoplay playsinline muted></video>';
echo '<div id="preview--ipcam" style="' . $composed_style . '" class="' . $previewFlipClass . ' ' . $previewStyleClass . '"></div>';
echo '<div id="preview--none">' . $languageService->translate('no_preview') . '</div>';

echo '
<!-- High-Performance GPU Beauty Filters Definition -->
<svg style="position:absolute; width:0; height:0; pointer-events:none; overflow:hidden;" aria-hidden="true">
  <defs>
    <!-- Commercial High-Pass Skin Smoothing & Soft Focus Filter -->
    <filter id="beautyPorcelainSkinFilter" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="softBlur" id="beautySvgBlur"></feGaussianBlur>
      <feColorMatrix in="softBlur" type="matrix" values="
        1.06 0    0    0  0.02
        0    1.04 0    0  0.02
        0    0    1.02 0  0.01
        0    0    0    1  0" result="warmGlow"></feColorMatrix>
      <feBlend in="SourceGraphic" in2="warmGlow" mode="soft-light" result="skinBlend"></feBlend>
      <feComposite in="SourceGraphic" in2="skinBlend" operator="arithmetic" k1="0" k2="0.40" k3="0.65" k4="0"></feComposite>
    </filter>

    <!-- Real-time 60FPS Big Eyes & Face Slimming Liquid Displacement Filter -->
    <filter id="beautyDisplacementFilter" x="-5%" y="-5%" width="110%" height="110%">
      <feImage id="beautyDisplaceFeImg" xlink:href="" href="" result="dispMap"></feImage>
      <feDisplacementMap in="SourceGraphic" in2="dispMap" scale="0" xChannelSelector="R" yChannelSelector="G" id="beautyFeDisplace"></feDisplacementMap>
    </filter>
  </defs>
</svg>
';

echo '</div>';
echo '</div></div>';

if ($previewShowPictureFrame) {
    echo '<img id="previewframe--picture" class="' . $previewFlipClass . '" src="' . PathUtility::getPublicPath($config['picture']['frame']) . '" alt="pictureFrame" />';
}

echo '</div>';
