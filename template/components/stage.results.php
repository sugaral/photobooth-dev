<?php

use Photobooth\Utility\ComponentUtility;

echo '<div class="stage stage--result rotarygroup" data-stage="result">';

// Dynamic Visual Cutout & Background Separation Layer
echo '
<div class="stage-cutout-viewport" id="stageCutoutViewport" style="display:none;">
    <div class="stage-cutout-bg" id="stageCutoutBg"></div>
    <div class="stage-cutout-person" id="stageCutoutPerson">
        <img id="stagePersonImg" src="" alt="Person Cutout" />
    </div>
    <canvas class="stage-contour-canvas" id="stageContourCanvas"></canvas>
    
    <!-- Cutout Person Interactive Resizer & Selection Controls -->
    <div class="stage-person-transform-box" id="stagePersonTransformBox" style="display:none;">
        <div class="person-transform-outline"></div>
        <div class="person-transform-handle handle-tl" data-handle="tl"></div>
        <div class="person-transform-handle handle-tr" data-handle="tr"></div>
        <div class="person-transform-handle handle-bl" data-handle="bl"></div>
        <div class="person-transform-handle handle-br" data-handle="br"></div>
        <div class="person-transform-tip"><i class="fa fa-arrows-up-down-left-right"></i> 拖拽调整人像位置 · 四角缩放</div>
    </div>
    <div class="stage-person-resizer-bar" id="stagePersonResizerBar" style="display:none;">
        <span class="resizer-label"><i class="fa fa-user"></i> 人像比例:</span>
        <button type="button" class="resizer-btn" id="btnPersonScaleMinus" title="缩小人像"><i class="fa fa-minus"></i></button>
        <span class="resizer-val" id="lblPersonScaleVal">100%</span>
        <button type="button" class="resizer-btn" id="btnPersonScalePlus" title="放大人像"><i class="fa fa-plus"></i></button>
        <button type="button" class="resizer-btn resizer-action" id="btnPersonReset" title="居中重置"><i class="fa fa-rotate-left"></i> 居中重置</button>
    </div>

    <!-- Custom Template Interactive Resizer & Transform Controls -->
    <div class="stage-transform-box" id="stageTransformBox" style="display:none;">
        <div class="transform-outline"></div>
        <div class="transform-handle handle-tl" data-handle="tl"></div>
        <div class="transform-handle handle-tr" data-handle="tr"></div>
        <div class="transform-handle handle-bl" data-handle="bl"></div>
        <div class="transform-handle handle-br" data-handle="br"></div>
        <div class="transform-move-tip"><i class="fa fa-arrows-up-down-left-right"></i> 拖动调整背景位置 · 四角缩放</div>
    </div>
    <div class="stage-bg-resizer-bar" id="stageBgResizerBar" style="display:none;">
        <span class="resizer-label"><i class="fa fa-expand"></i> 模板尺寸:</span>
        <button type="button" class="resizer-btn" id="btnBgScaleMinus" title="缩小"><i class="fa fa-minus"></i></button>
        <span class="resizer-val" id="lblBgScaleVal">100%</span>
        <button type="button" class="resizer-btn" id="btnBgScalePlus" title="放大"><i class="fa fa-plus"></i></button>
        <button type="button" class="resizer-btn resizer-action" id="btnBgScaleFit" title="铺满"><i class="fa fa-maximize"></i> 铺满</button>
        <button type="button" class="resizer-btn resizer-action" id="btnBgScaleReset" title="重置"><i class="fa fa-rotate-left"></i> 重置</button>
    </div>
</div>

<!-- AI Matting Loading Feedback Overlay -->
<div class="stage-matting-loader" id="stageMattingLoader" style="display:none;" aria-live="polite">
    <div class="stage-matting-loader-backdrop"></div>
    <div class="stage-matting-loader-card">
        <div class="stage-matting-spinner">
            <i class="fa fa-circle-notch fa-spin"></i>
        </div>
        <div class="stage-matting-title">AI 智能人像抠图中...</div>
        <div class="stage-matting-desc">正在精确分离人像与发丝轮廓，请稍候</div>
        <div class="stage-matting-engine-pill" id="stageMattingEnginePill">
            <i class="fa fa-microchip"></i>
            <span id="stageMattingEngineHint">AI 人像发丝级精细抠图进行中...</span>
        </div>
    </div>
</div>
';

echo '<div class="stage-inner">';

// AI FaceSwap Floating Comparison & Control Bar
echo '
<div class="ai-result-control-bar" id="aiResultControlBar" style="display:none;">
    <div class="ai-result-pill">
        <i class="fa fa-wand-magic-sparkles"></i>
        <span id="aiResultTemplateName">AI 魔法变身照已生成</span>
    </div>
    <button type="button" class="ai-compare-btn rotaryfocus" id="btnAiCompareSnap" title="按住或点击查看拍摄原图">
        <i class="fa fa-eye"></i>
        <span>查看原拍对比</span>
    </button>
    <button type="button" class="ai-switch-tpl-btn rotaryfocus" id="btnAiChangeTemplate" title="更换变身模板">
        <i class="fa fa-palette"></i>
        <span>更换模板</span>
    </button>
</div>
';

// Left Sidebar for Results Action Buttons
echo '<aside class="result-sidebar buttonbar buttonbar--sidebar" id="resultSidebar">';

if ($config['button']['homescreen']) {
    echo ComponentUtility::renderButton('home', $config['icons']['home'], 'homebtn');
}

if ($config['ui']['result_buttons']) {
    if (!$config['button']['force_buzzer']) {
        if ($config['picture']['enabled']) {
            echo ComponentUtility::renderButton('newPhoto', $config['icons']['take_picture'], 'newpic');
        }
        if ($config['custom']['enabled']) {
            echo ComponentUtility::renderButton('newCustom', $config['icons']['take_custom'], 'newcustom');
        }
        if ($config['video']['enabled']) {
            echo ComponentUtility::renderButton('newVideo', $config['icons']['take_video'], 'newvideo');
        }
    }
}

// Commercial Photobooth: Background selection is done pre-capture; hide post-capture manual cutout button
// if (!empty($config['rembg']['enabled'])) {
//     echo ComponentUtility::renderButton('rembg', $config['icons']['rembg'], 'rembgbtn');
// }

// AI Beauty Retouch Button
if (!empty($config['beauty']['enabled'])) {
    echo ComponentUtility::renderButton('beauty', $config['icons']['beauty'] ?? 'fa fa-wand-magic-sparkles', 'beautybtn');
}

if ($config['ui']['result_buttons']) {
    if ($config['qr']['enabled']) {
        echo ComponentUtility::renderButton('qr', $config['icons']['qr'], 'qrbtn');
    }
    if ($config['gallery']['enabled']) {
        echo ComponentUtility::renderButton('gallery', $config['icons']['gallery'], 'gallerybtn');
    }
    if ($config['mail']['enabled']) {
        echo ComponentUtility::renderButton('mail', $config['icons']['mail'], 'mailbtn');
    }
}

if ($config['print']['from_result']) {
    echo ComponentUtility::renderButton('print', $config['icons']['print'], 'printbtn');
}
if ($config['filters']['enabled']) {
    echo ComponentUtility::renderButton('selectFilter', $config['icons']['filter'], 'imageFilter');
}
if ($config['picture']['allow_delete']) {
    echo ComponentUtility::renderButton('delete', $config['icons']['delete'], 'deletebtn');
}

echo '</aside>';
echo '</div>'; // .stage-inner
echo '</div>'; // .stage--result

// Right-side Drawer for AI Cutout & Background Selection (Outside stage--result for root viewport positioning)
echo '
<div class="rembg-drawer rotarygroup" id="rembgModal" style="display:none;" aria-hidden="true">
    <div class="rembg-drawer-header">
        <div class="rembg-drawer-title">
            <i class="fa fa-wand-magic-sparkles"></i>
            <span>更换背景模板</span>
        </div>
        <button type="button" class="rembg-drawer-close-btn rotaryfocus" id="btnRembgClose" title="关闭">
            <i class="fa fa-times"></i>
        </button>
    </div>
    <div class="rembg-drawer-toolbar">
        <label class="rembg-upload-btn" id="lblUploadTemplate" for="rembgTemplateUpload">
            <i class="fa fa-cloud-arrow-up"></i>
            <span>上传自定义背景</span>
            <input type="file" id="rembgTemplateUpload" accept="image/png,image/jpeg,image/webp" style="display:none;">
        </label>
        <span id="rembgSelectedName" class="rembg-selected-name" style="display:none;">透明背景 (PNG)</span>
    </div>
    
    <!-- Vertically scrollable background image list -->
    <div class="rembg-scrollable-list" id="rembgTemplateGrid">
        <!-- Dynamically populated background cards -->
    </div>
    
    <div class="rembg-drawer-footer">
        <button type="button" class="rembg-btn-footer rembg-btn-revert" id="btnRembgRevert">
            <i class="fa fa-rotate-left"></i>
            <span>还原原图</span>
        </button>
        <button type="button" class="rembg-btn-footer rembg-btn-done" id="btnRembgDone">
            <i class="fa fa-check"></i>
            <span>完成</span>
        </button>
    </div>
</div>

<!-- AI Beauty Retouch Drawer (微调大眼、瘦脸、磨皮、美白) -->
<div class="beauty-drawer rotarygroup" id="beautyModal" aria-hidden="true">
    <div class="beauty-drawer-header">
        <div class="beauty-drawer-title">
            <i class="fa fa-wand-magic-sparkles"></i>
            <span>AI 人像美颜微调</span>
        </div>
        <button type="button" class="beauty-drawer-close-btn rotaryfocus" id="btnBeautyClose" title="关闭">
            <i class="fa fa-times"></i>
        </button>
    </div>
    <div class="beauty-drawer-body">
        <div class="beauty-sync-badge">
            <i class="fa fa-users"></i>
            <span>合影所有人脸自动同步修饰</span>
        </div>

        <!-- 1. 自然大眼 -->
        <div class="beauty-control-group">
            <div class="beauty-control-header">
                <span class="beauty-control-title"><i class="fa fa-eye"></i> 自然大眼</span>
                <span class="beauty-control-val" id="lblBeautyEye">15%</span>
            </div>
            <div class="beauty-slider-wrap">
                <input type="range" id="sliderBeautyEye" min="0" max="100" value="15" class="beauty-slider">
            </div>
        </div>

        <!-- 2. 精致瘦脸 -->
        <div class="beauty-control-group">
            <div class="beauty-control-header">
                <span class="beauty-control-title"><i class="fa fa-heart"></i> 精致瘦脸</span>
                <span class="beauty-control-val" id="lblBeautySlim">15%</span>
            </div>
            <div class="beauty-slider-wrap">
                <input type="range" id="sliderBeautySlim" min="0" max="100" value="15" class="beauty-slider">
            </div>
        </div>

        <!-- 3. 质感磨皮 -->
        <div class="beauty-control-group">
            <div class="beauty-control-header">
                <span class="beauty-control-title"><i class="fa fa-sparkles"></i> 质感磨皮</span>
                <span class="beauty-control-val" id="lblBeautySmooth">20%</span>
            </div>
            <div class="beauty-slider-wrap">
                <input type="range" id="sliderBeautySmooth" min="0" max="100" value="20" class="beauty-slider">
            </div>
        </div>

        <!-- 4. 透亮美白 -->
        <div class="beauty-control-group">
            <div class="beauty-control-header">
                <span class="beauty-control-title"><i class="fa fa-sun"></i> 透亮美白</span>
                <span class="beauty-control-val" id="lblBeautyWhite">15%</span>
            </div>
            <div class="beauty-slider-wrap">
                <input type="range" id="sliderBeautyWhite" min="0" max="100" value="15" class="beauty-slider">
            </div>
        </div>

        <!-- Compare Button: 按住对比原图 -->
        <div class="beauty-compare-wrap">
            <button type="button" class="beauty-compare-btn" id="btnBeautyCompare">
                <i class="fa fa-eye"></i> 按住对比原图
            </button>
        </div>
    </div>
    
    <div class="beauty-drawer-footer">
        <button type="button" class="beauty-btn-footer beauty-btn-reset" id="btnBeautyReset">
            <i class="fa fa-rotate-left"></i>
            <span>重置为默认</span>
        </button>
        <button type="button" class="beauty-btn-footer beauty-btn-done" id="btnBeautyDone">
            <i class="fa fa-check"></i>
            <span>完成保存</span>
        </button>
    </div>
</div>
';
