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
        <button type="button" class="resizer-btn resizer-action" id="btnPersonReset" title="居中重置"><i class="fa fa-undo"></i> 居中重置</button>
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
        <button type="button" class="resizer-btn resizer-action" id="btnBgScaleReset" title="重置"><i class="fa fa-undo"></i> 重置</button>
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

// Left Sidebar for Results Action Buttons with 3 Structured Zones
echo '<aside class="result-sidebar buttonbar buttonbar--sidebar" id="resultSidebar">';

// 1. 创作修图区 (Editing & Dressing Zone)
echo '<div class="sidebar-section sidebar-section--edit">';
echo '<div class="sidebar-section-title"><i class="fa fa-wand-magic-sparkles"></i> 创作修图</div>';
echo '<div class="sidebar-section-buttons">';
echo '<button type="button" class="button rotaryfocus classic-result-action" id="btnClassicToggleFilters" title="选择成片滤镜"><span class="button--icon fa fa-sliders"></span><span class="button--label">成片滤镜</span></button>';
echo '<button type="button" class="button rotaryfocus classic-result-action" id="btnClassicToggleFrame" title="添加或移除潮流边框"><span class="button--icon fa fa-border-all"></span><span class="button--label">边框</span></button>';
echo '<button type="button" class="button rotaryfocus classic-result-action" id="btnClassicAddSignature" title="添加手写签名"><span class="button--icon fa fa-signature"></span><span class="button--label">手写签名</span></button>';
echo '<button type="button" class="button rotaryfocus classic-result-action" id="btnClassicInsertText" title="添加艺术文本"><span class="button--icon fa fa-font"></span><span class="button--label">插入文本</span></button>';
echo '<button type="button" class="button rotaryfocus classic-result-action" id="btnClassicOpenStickers" title="添加潮流贴纸"><span class="button--icon fa fa-icons"></span><span class="button--label">贴纸</span></button>';
echo '</div>'; // .sidebar-section-buttons
echo '</div>'; // .sidebar-section--edit

// 2. 出片交付区 (Delivery Zone: Primary Print & Proofing)
echo '<div class="sidebar-section sidebar-section--delivery">';
echo '<div class="sidebar-section-title"><i class="fa fa-circle-check"></i> 出片交付</div>';
echo '<div class="sidebar-section-buttons">';
if ($config['print']['from_result']) {
    echo ComponentUtility::renderButton('print', $config['icons']['print'], 'printbtn primary-delivery-btn');
}
echo '<button type="button" class="button rotaryfocus classic-result-action" id="btnCommercialPrintPreview" title="业务冲印成片预览"><span class="button--icon fa fa-eye"></span><span class="button--label">冲印预览</span></button>';
if ($config['ui']['result_buttons']) {
    if ($config['mail']['enabled']) {
        echo ComponentUtility::renderButton('mail', $config['icons']['mail'], 'mailbtn');
    }
}
echo '</div>'; // .sidebar-section-buttons
echo '</div>'; // .sidebar-section--delivery

// 3. 重拍与辅助区 (Retake & Utility Zone)
echo '<div class="sidebar-section sidebar-section--utility">';
echo '<div class="sidebar-section-title"><i class="fa fa-camera-rotate"></i> 快捷辅助</div>';
echo '<div class="sidebar-section-buttons">';
if ($config['ui']['result_buttons'] && !$config['button']['force_buzzer']) {
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
if ($config['ui']['result_buttons'] && $config['gallery']['enabled']) {
    echo ComponentUtility::renderButton('gallery', $config['icons']['gallery'], 'gallerybtn');
}
if ($config['button']['homescreen']) {
    echo ComponentUtility::renderButton('home', $config['icons']['home'], 'homebtn');
}
if ($config['picture']['allow_delete']) {
    echo ComponentUtility::renderButton('delete', $config['icons']['delete'], 'deletebtn');
}
echo '</div>'; // .sidebar-section-buttons
echo '</div>'; // .sidebar-section--utility

echo '</aside>';
echo '
<div class="classic-paper-spec-badge" id="classicPaperSpecBadge">
    <div class="paper-spec-content">
        <i class="fa fa-print"></i>
        <span class="paper-spec-title" id="lblResultPaperTitle">6寸标准相纸 (4" × 6")</span>
        <span class="paper-spec-divider">·</span>
        <span class="paper-spec-sub" id="lblResultPaperDetail">300 DPI 富士晶彩冲印 · 1800×1200px</span>
    </div>
    <button type="button" class="paper-spec-proof-btn" id="btnHeaderPrintProof">
        <i class="fa fa-eye"></i> 业务冲印预览
    </button>
</div>
';
echo '</div>'; // .stage-inner

// Photo overlays & interactive floating components directly under .stage--result
echo '<img id="classicFrameOverlay" class="classic-frame-overlay" src="resources/img/frames/frame.png" alt="" aria-hidden="true" style="display:none;" />';
echo '<div class="sticker-canvas-overlay" id="stickerCanvasOverlay" style="display:none;"></div>';
echo '</div>'; // .stage--result

// Filter Selection Drawer (Outside stage--result for root viewport positioning)
echo '
<div class="editor-drawer classic-filter-drawer rotarygroup" id="classicFilterQuickBar" style="display:none;" aria-hidden="true">
    <div class="editor-drawer-heading">
        <h2><i class="fa fa-sliders"></i> 滤镜 · 36 款</h2>
        <button type="button" id="btnClassicFilterClose" class="rotaryfocus" aria-label="关闭滤镜">×</button>
    </div>
    <div class="editor-filter-grid"></div>
</div>
';

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
            <i class="fa fa-undo"></i>
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

    </div>
    
    <div class="beauty-drawer-footer">
        <button type="button" class="beauty-btn-footer beauty-btn-reset" id="btnBeautyReset">
            <i class="fa fa-undo"></i>
            <span>重置为默认</span>
        </button>
        <button type="button" class="beauty-btn-footer beauty-btn-done" id="btnBeautyDone">
            <i class="fa fa-check"></i>
            <span>完成保存</span>
        </button>
    </div>
</div>

<!-- Classic Photobooth Stickers Drawer -->
<div class="sticker-drawer rotarygroup" id="stickerModal" style="display:none;" aria-hidden="true">
    <div class="sticker-drawer-header">
        <div class="sticker-drawer-title">
            <i class="fa fa-icons"></i>
            <span>潮流大头贴装扮</span>
        </div>
        <button type="button" class="sticker-drawer-close-btn rotaryfocus" id="btnStickerClose" title="关闭">
            <i class="fa fa-times"></i>
        </button>
    </div>
    <div class="sticker-drawer-tabs">
        <button type="button" class="sticker-tab-pill active" data-category="cute">
            <i class="fa fa-face-smile"></i> 萌趣表情
        </button>
        <button type="button" class="sticker-tab-pill" data-category="props">
            <i class="fa fa-hat-wizard"></i> 潮流配饰
        </button>
        <button type="button" class="sticker-tab-pill" data-category="text">
            <i class="fa fa-stamp"></i> 印章文字
        </button>
    </div>
    <div class="sticker-drawer-body">
        <div class="sticker-grid" id="stickerGridCute">
            <button type="button" class="sticker-item" data-type="emoji" data-content="❤️"><span>❤️</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="✨"><span>✨</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="🐱"><span>🐱</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="🌸"><span>🌸</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="🍓"><span>🍓</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="🐶"><span>🐶</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="🎀"><span>🎀</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="🍑"><span>🍑</span></button>
        </div>
        <div class="sticker-grid" id="stickerGridProps" style="display:none;">
            <button type="button" class="sticker-item" data-type="emoji" data-content="🕶️"><span>🕶️</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="👑"><span>👑</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="👒"><span>👒</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="🐰"><span>🐰</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="🦋"><span>🦋</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="🎈"><span>🎈</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="🎂"><span>🎂</span></button>
            <button type="button" class="sticker-item" data-type="emoji" data-content="🎧"><span>🎧</span></button>
        </div>
        <div class="sticker-grid" id="stickerGridText" style="display:none;">
            <button type="button" class="sticker-item sticker-item--stamp" data-type="stamp" data-content="人生四格"><span>人生四格</span></button>
            <button type="button" class="sticker-item sticker-item--stamp" data-type="stamp" data-content="HAPPY DAY"><span>HAPPY DAY</span></button>
            <button type="button" class="sticker-item sticker-item--stamp" data-type="stamp" data-content="BESTIE"><span>BESTIE</span></button>
            <button type="button" class="sticker-item sticker-item--stamp" data-type="stamp" data-content="VIBES"><span>VIBES</span></button>
            <button type="button" class="sticker-item sticker-item--stamp" data-type="stamp" data-content="MEMORIES"><span>MEMORIES</span></button>
            <button type="button" class="sticker-item sticker-item--stamp" data-type="stamp" data-content="SWEET"><span>SWEET</span></button>
        </div>
    </div>
    <div class="sticker-drawer-footer">
        <button type="button" class="sticker-footer-btn sticker-btn-clear" id="btnStickerClear">
            <i class="fa fa-trash-can"></i> <span>清空贴纸</span>
        </button>
        <button type="button" class="sticker-footer-btn sticker-btn-done" id="btnStickerSave">
            <i class="fa fa-check"></i> <span>完成装扮</span>
        </button>
    </div>
</div>

<!-- In-page Touch Signature Modal (Replaces window.prompt) -->
<div class="signature-drawer rotarygroup" id="signatureModal" style="display:none;" aria-hidden="true">
    <div class="signature-drawer-header">
        <div class="signature-drawer-title">
            <i class="fa fa-signature"></i>
            <span>添加个性签名与寄语</span>
        </div>
        <button type="button" class="signature-drawer-close-btn rotaryfocus" id="btnSignatureClose" title="关闭">
            <i class="fa fa-times"></i>
        </button>
    </div>
    <div class="signature-drawer-body"></div>
    <div class="signature-drawer-footer">
        <button type="button" class="signature-footer-btn signature-btn-cancel" id="btnSignatureCancel">
            <i class="fa fa-times"></i> <span>取消</span>
        </button>
        <button type="button" class="signature-footer-btn signature-btn-confirm" id="btnSignatureConfirm">
            <i class="fa fa-check"></i> <span>添加到照片</span>
        </button>
    </div>
</div>

<!-- In-page Touch Artistic Text Modal -->
<div class="signature-drawer rotarygroup text-drawer" id="textModal" style="display:none;" aria-hidden="true">
    <div class="signature-drawer-header">
        <div class="signature-drawer-title">
            <i class="fa fa-font"></i>
            <span>插入艺术文本 · 56 款特效字体</span>
        </div>
        <button type="button" class="signature-drawer-close-btn rotaryfocus" id="btnTextClose" title="关闭">
            <i class="fa fa-times"></i>
        </button>
    </div>
    <div class="text-drawer-body">
        <!-- Text Input Row -->
        <div class="text-input-group" style="margin-bottom:12px;">
            <label style="font-size:13px;font-weight:bold;color:#334155;margin-bottom:4px;display:block;"><i class="fa fa-pen-to-square"></i> 输入文字内容:</label>
            <input type="text" id="textDrawerInput" value="Happy Photobooth ✨" placeholder="输入要印在照片上的文字..." style="width:100%;box-sizing:border-box;padding:10px 14px;border:1.5px solid #cbd5e1;border-radius:12px;font-size:16px;outline:none;background:#f8fafc;color:#0f172a;" />
        </div>

        <!-- Color Row -->
        <div class="text-color-group" style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:13px;font-weight:bold;color:#334155;"><i class="fa fa-palette"></i> 字体颜色:</span>
                <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#64748b;cursor:pointer;">
                    自定义 <input type="color" id="textColorPicker" value="#ffffff" style="width:26px;height:26px;border:none;border-radius:6px;cursor:pointer;background:none;padding:0;" />
                </label>
            </div>
            <div class="text-color-swatches" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                <button type="button" class="text-swatch active" data-color="#ffffff" style="background:#ffffff;border:2px solid #7555cd;width:26px;height:26px;border-radius:50%;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.2);" title="纯白"></button>
                <button type="button" class="text-swatch" data-color="#111827" style="background:#111827;border:2px solid transparent;width:26px;height:26px;border-radius:50%;cursor:pointer;" title="曜石黑"></button>
                <button type="button" class="text-swatch" data-color="#ff007f" style="background:#ff007f;border:2px solid transparent;width:26px;height:26px;border-radius:50%;cursor:pointer;box-shadow:0 0 6px #ff007f;" title="荧光粉"></button>
                <button type="button" class="text-swatch" data-color="#00f5ff" style="background:#00f5ff;border:2px solid transparent;width:26px;height:26px;border-radius:50%;cursor:pointer;box-shadow:0 0 6px #00f5ff;" title="霓虹青"></button>
                <button type="button" class="text-swatch" data-color="#ffe600" style="background:#ffe600;border:2px solid transparent;width:26px;height:26px;border-radius:50%;cursor:pointer;box-shadow:0 0 6px #ffe600;" title="亮黄"></button>
                <button type="button" class="text-swatch" data-color="#ef4444" style="background:#ef4444;border:2px solid transparent;width:26px;height:26px;border-radius:50%;cursor:pointer;" title="中国红"></button>
                <button type="button" class="text-swatch" data-color="#8b5cf6" style="background:#8b5cf6;border:2px solid transparent;width:26px;height:26px;border-radius:50%;cursor:pointer;" title="梦幻紫"></button>
                <button type="button" class="text-swatch" data-color="#eab308" style="background:#eab308;border:2px solid transparent;width:26px;height:26px;border-radius:50%;cursor:pointer;" title="香槟金"></button>
                <button type="button" class="text-swatch" data-color="#10b981" style="background:#10b981;border:2px solid transparent;width:26px;height:26px;border-radius:50%;cursor:pointer;" title="薄荷绿"></button>
            </div>
        </div>

        <!-- Font Categories Filter -->
        <div class="text-font-cat-row" style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:13px;font-weight:bold;color:#334155;"><i class="fa fa-font"></i> 选择字体样式 (实时预览):</span>
                <span id="fontCountBadge" style="font-size:11px;color:#64748b;background:#e2e8f0;padding:2px 6px;border-radius:8px;">56 款特效字体</span>
            </div>
            <div class="text-font-tabs" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;">
                <button type="button" class="text-font-tab active" data-cat="all" style="padding:4px 10px;font-size:12px;border-radius:9999px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;white-space:nowrap;">全部 (56)</button>
                <button type="button" class="text-font-tab" data-cat="script" style="padding:4px 10px;font-size:12px;border-radius:9999px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;white-space:nowrap;">艺术手写 (15)</button>
                <button type="button" class="text-font-tab" data-cat="retro" style="padding:4px 10px;font-size:12px;border-radius:9999px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;white-space:nowrap;">潮流复古 (14)</button>
                <button type="button" class="text-font-tab" data-cat="cyber" style="padding:4px 10px;font-size:12px;border-radius:9999px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;white-space:nowrap;">赛博像素 (9)</button>
                <button type="button" class="text-font-tab" data-cat="cute" style="padding:4px 10px;font-size:12px;border-radius:9999px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;white-space:nowrap;">可爱涂鸦 (18)</button>
            </div>
        </div>

        <!-- Search Font -->
        <div style="margin-bottom:8px;">
            <input type="text" id="fontSearchInput" placeholder="🔍 快速搜索字体名称或风格..." style="width:100%;box-sizing:border-box;padding:6px 10px;font-size:12px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;outline:none;" />
        </div>

        <!-- Font List with Rich Visual Previews -->
        <div class="text-font-list" id="textFontList" style="overflow-y:auto;border:1px solid #e2e8f0;border-radius:12px;padding:6px;background:#f8fafc;display:flex;flex-direction:column;gap:6px;">
            <!-- Generated dynamically with live font rendering -->
        </div>
    </div>
    <div class="signature-drawer-footer" style="margin-top:14px;display:flex;gap:10px;justify-content:flex-end;">
        <button type="button" class="signature-footer-btn signature-btn-cancel" id="btnTextCancel" style="padding:8px 16px;border-radius:10px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font-weight:600;color:#64748b;">
            <i class="fa fa-times"></i> 取消
        </button>
        <button type="button" class="signature-footer-btn signature-btn-confirm" id="btnTextAddOnPhoto" style="padding:8px 20px;border-radius:10px;border:none;background:#7555cd;color:#fff;cursor:pointer;font-weight:700;box-shadow:0 4px 12px rgba(117,85,205,0.35);">
            <i class="fa fa-plus"></i> <span id="btnTextActionLabel">插入文字到照片</span>
        </button>
    </div>
</div>

<!-- 业务打印效果预览模态框 (Commercial Print Proofing Modal) -->
<div class="commercial-print-modal rotarygroup" id="commercialPrintModal" style="display:none;" aria-hidden="true">
    <div class="commercial-print-backdrop" id="commercialPrintBackdrop"></div>
    <div class="commercial-print-dialog">
        <div class="commercial-print-header">
            <div class="print-header-title">
                <i class="fa fa-print"></i>
                <div>
                    <h3>业务打印成片效果预览</h3>
                    <p>专业相纸质感模拟 · 3mm 出血裁切线检测 · 工业冲印交付规格</p>
                </div>
            </div>
            <button type="button" class="commercial-print-close-btn" id="btnCommercialPrintClose" title="关闭预览">
                <i class="fa fa-times"></i>
            </button>
        </div>
        
        <div class="commercial-print-body">
            <!-- 左侧：真实相纸排版渲染与装裱打样 -->
            <div class="commercial-print-stage">
                <div class="print-paper-mockup print-paper-finish--glossy" id="printPaperMockup">
                    <!-- 出血参考线 (3mm Bleed Reference Line) -->
                    <div class="print-bleed-guide" id="printBleedGuide">
                        <span class="bleed-label">3mm 工业冲印出血裁切线</span>
                    </div>
                    <!-- 真实照片成片内容 -->
                    <div class="print-photo-container" id="printPhotoContainer">
                        <img id="printProofPhotoImg" src="" alt="业务冲印成片打样" />
                    </div>
                    <!-- 相纸底部品牌微标水印 (富士/DNP 冲印标) -->
                    <div class="print-paper-watermark" id="printPaperWatermark">
                        <span>FUJIFILM Quality DryLab Print · Commercial Kiosk Edition</span>
                    </div>
                </div>
            </div>

            <!-- 右侧：冲印质感切换与工业参数 -->
            <div class="commercial-print-controls">
                <!-- 相纸规格 -->
                <div class="print-control-section">
                    <span class="pcontrol-label"><i class="fa fa-ruler-combined"></i> 交付版式规格:</span>
                    <div class="pcontrol-spec-card">
                        <strong id="printSpecName">6寸标准相纸 (4" × 6")</strong>
                        <span id="printSpecDimension">102mm × 152mm (300 DPI 印刷级)</span>
                        <span id="printSpecResolution">有效像素: 1800 × 1200 px</span>
                    </div>
                </div>

                <!-- 相纸材质模拟 -->
                <div class="print-control-section">
                    <span class="pcontrol-label"><i class="fa fa-layer-group"></i> 相纸表面质感:</span>
                    <div class="print-finish-selector">
                        <button type="button" class="finish-chip active" data-finish="glossy">
                            <i class="fa fa-sun"></i> 富士晶彩光面
                        </button>
                        <button type="button" class="finish-chip" data-finish="matte">
                            <i class="fa fa-cloud"></i> 柯达尊爵绒面
                        </button>
                        <button type="button" class="finish-chip" data-finish="pearl">
                            <i class="fa fa-gem"></i> 艺术细砂珍珠面
                        </button>
                    </div>
                </div>

                <!-- 视口与辅助线 -->
                <div class="print-control-section">
                    <span class="pcontrol-label"><i class="fa fa-crop-simple"></i> 印前校准辅助:</span>
                    <div class="print-toggle-row">
                        <label class="print-toggle-label">
                            <input type="checkbox" id="chkShowBleed" checked>
                            <span>显示 3mm 出血裁切线 (工业冲印标准)</span>
                        </label>
                    </div>
                    <div class="print-toggle-row">
                        <label class="print-toggle-label">
                            <input type="checkbox" id="chkShowWatermark" checked>
                            <span>底部装裱微标 (相纸真实边框)</span>
                        </label>
                    </div>
                </div>

                <!-- 打印机设备状态 -->
                <div class="print-control-section">
                    <span class="pcontrol-label"><i class="fa fa-microchip"></i> 冲印硬件就绪状态:</span>
                    <div class="printer-status-box">
                        <div class="pstatus-dot dot-online"></div>
                        <div class="pstatus-info">
                            <strong>工业级热升华 / 干式相纸打印机</strong>
                            <span>DNP / FUJIFILM · 自动色温补偿就绪</span>
                        </div>
                    </div>
                </div>

                <!-- 底部操作按钮 -->
                <div class="print-action-row">
                    <button type="button" class="print-modal-btn print-btn-confirm" id="btnModalTriggerPrint">
                        <i class="fa fa-print"></i> 立即送入打印机
                    </button>
                    <button type="button" class="print-modal-btn print-btn-back" id="btnModalBackEdit">
                        <i class="fa fa-arrow-left"></i> 返回继续修图
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
';
