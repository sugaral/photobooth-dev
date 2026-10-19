<?php

use Photobooth\Utility\PathUtility;

$defaultFilter = $config['filters']['defaults'] ?? 'plain';
$defFilterVal = is_object($defaultFilter) && isset($defaultFilter->value) ? $defaultFilter->value : (string)$defaultFilter;

$beautyEnabled = !isset($config['beauty']['enabled']) || !empty($config['beauty']['enabled']);
$beautyAuto = $beautyEnabled && (!isset($config['beauty']['auto_apply']) || !empty($config['beauty']['auto_apply']));

$bEye = ($beautyEnabled && $beautyAuto) ? (int)($config['beauty']['default_eye'] ?? 15) : 0;
$bSlim = ($beautyEnabled && $beautyAuto) ? (int)($config['beauty']['default_slim'] ?? 15) : 0;
$bSmooth = ($beautyEnabled && $beautyAuto) ? (int)($config['beauty']['default_smooth'] ?? 30) : 0;
$bWhite = ($beautyEnabled && $beautyAuto) ? (int)($config['beauty']['default_white'] ?? 25) : 0;
$bRosy = ($beautyEnabled && $beautyAuto) ? (int)($config['beauty']['default_rosy'] ?? 20) : 0;
$bClarity = ($beautyEnabled && $beautyAuto) ? (int)($config['beauty']['default_clarity'] ?? 15) : 0;

$isAllZero = ($bEye === 0 && $bSlim === 0 && $bSmooth === 0 && $bWhite === 0 && $bRosy === 0 && $bClarity === 0);
$activePreset = 'natural';
if (!$beautyEnabled || $isAllZero) {
    $activePreset = 'raw';
} elseif ($bSmooth === 45 && $bWhite === 30 && $bRosy === 45 && $bClarity === 10 && $bEye === 25 && $bSlim === 20) {
    $activePreset = 'rosy';
} elseif ($bSmooth === 40 && $bWhite === 45 && $bRosy === 10 && $bClarity === 30 && $bEye === 15 && $bSlim === 25) {
    $activePreset = 'cool';
} elseif ($bSmooth === 35 && $bWhite === 25 && $bRosy === 20 && $bClarity === 15 && $bEye === 15 && $bSlim === 15) {
    $activePreset = 'natural';
}

$filterPresets = [
    ['id' => 'plain', 'name' => '自然原图', 'tag' => 'RAW'],
    ['id' => 'grayscale', 'name' => '经典黑白', 'tag' => 'B&W'],
    ['id' => 'vintage', 'name' => '复古胶片', 'tag' => 'Film'],
    ['id' => 'antique', 'name' => '暖阳港风', 'tag' => 'Warm'],
    ['id' => 'cool', 'name' => '冷艳冷调', 'tag' => 'Cool'],
    ['id' => 'summer', 'name' => '夏日清透', 'tag' => 'Summer'],
    ['id' => 'washed', 'name' => '奶油日系', 'tag' => 'Cream'],
    ['id' => 'smooth', 'name' => '柔焦微光', 'tag' => 'Soft'],
    ['id' => 'pink', 'name' => '元气粉黛', 'tag' => 'Pink'],
    ['id' => 'blue', 'name' => '夜色幽蓝', 'tag' => 'Night'],
];

$aiTemplates = (new \Photobooth\Service\AiTemplateCatalogService())->all();

$classicTemplates = [
    [
        'id' => 'none',
        'title' => '实景原生 (不换背景)',
        'tag' => '相机原图',
        'thumb' => 'resources/img/templates/icon_natural.png',
    ],
    [
        'id' => 'studio_light',
        'title' => '极简影棚',
        'tag' => '柔和质感',
        'thumb' => 'resources/img/templates/studio_light.jpg',
    ],
    [
        'id' => 'id_white',
        'title' => '珍珠纯白',
        'tag' => '高级影棚',
        'thumb' => 'resources/img/templates/id_white.png',
    ],
    [
        'id' => 'id_blue',
        'title' => '商务雅蓝',
        'tag' => '商务证件',
        'thumb' => 'resources/img/templates/id_blue.png',
    ],
    [
        'id' => 'id_red',
        'title' => '喜庆红韵',
        'tag' => '元气节日',
        'thumb' => 'resources/img/templates/id_red.png',
    ],
    [
        'id' => 'beach_sunset',
        'title' => '日落海滩',
        'tag' => '海边晚霞',
        'thumb' => 'resources/img/templates/beach_sunset.jpg',
    ],
    [
        'id' => 'cyberpunk_neon',
        'title' => '赛博霓虹',
        'tag' => '未来光影',
        'thumb' => 'resources/img/templates/cyberpunk_neon.jpg',
    ],
    [
        'id' => 'cosmic_space',
        'title' => '梦幻星空',
        'tag' => '浩瀚银河',
        'thumb' => 'resources/img/templates/cosmic_space.jpg',
    ],
    [
        'id' => 'nature_forest',
        'title' => '绿野森林',
        'tag' => '自然清新',
        'thumb' => 'resources/img/templates/nature_forest.jpg',
    ],
];
?>

<!-- 摄影工作室独立页面 (Stage: Studio) -->
<div class="stage stage--studio rotarygroup" data-stage="studio" id="studioStage" style="display: none;">
    <!-- 左侧整页摄像头实时取景器 (Live Viewfinder Viewport) -->
    <div class="studio-viewport" id="studioViewport">
        <!-- 顶部取景 HUD 浮层 -->
        <div class="studio-viewport-topbar">
            <button type="button" class="studio-top-btn studio-btn--back" id="btnStudioBack" title="返回主界面重新选择模式">
                <i class="fa fa-arrow-left"></i>
                <span>返回首页</span>
            </button>

            <div class="studio-hud-center">
                <div class="studio-live-pill" id="studioLivePill">
                    <span class="studio-live-dot"></span>
                    <span>LIVE 实时取景</span>
                </div>
                <div class="studio-mode-pill" id="studioModePill">
                    <i class="fa fa-masks-theater"></i>
                    <span id="studioModePillText">AI 魔法变身照</span>
                </div>
                <div class="studio-beauty-pill" id="studioBeautyPill" style="display:none;">
                    <i class="fa fa-wand-magic-sparkles"></i>
                    <span id="studioBeautyPillText">美颜生效中</span>
                </div>
            </div>

            <div class="studio-hud-actions">
                <button type="button" class="studio-top-btn" id="btnStudioFlip" title="镜像翻转摄像头画面">
                    <i class="fa fa-arrows-left-right"></i>
                    <span>镜像</span>
                </button>
            </div>
        </div>

        <!-- 装饰性取景辅助线与焦点方框 -->
        <div class="studio-viewfinder-overlay" aria-hidden="true">
            <div class="studio-corner studio-corner--tl"></div>
            <div class="studio-corner studio-corner--tr"></div>
            <div class="studio-corner studio-corner--bl"></div>
            <div class="studio-corner studio-corner--br"></div>
        </div>

        <!-- 实时相纸版式规格辅助体型框线 (Physical Paper Layout Guides) -->
        <div class="studio-paper-guide" id="studioPaperGuide" style="display:none;" aria-hidden="true">
            <div class="studio-paper-guide-badge" id="studioPaperGuideBadge">
                <i class="fa fa-print"></i> <span id="studioPaperGuideText">6寸标准相纸 (4"×6")</span>
            </div>
            <div class="studio-guide-2x2" id="studioGuide2x2" style="display:none;">
                <div class="guide-cross-v"></div>
                <div class="guide-cross-h"></div>
                <div class="guide-cell-badge cb-1">1</div>
                <div class="guide-cell-badge cb-2">2</div>
                <div class="guide-cell-badge cb-3">3</div>
                <div class="guide-cell-badge cb-4">4</div>
            </div>
            <div class="studio-guide-strip" id="studioGuideStrip" style="display:none;">
                <div class="guide-strip-column">
                    <div class="strip-cell"><span>#1</span></div>
                    <div class="strip-cell"><span>#2</span></div>
                    <div class="strip-cell"><span>#3</span></div>
                    <div class="strip-cell"><span>#4</span></div>
                </div>
            </div>
        </div>

        <!-- 倒计时覆盖层 (在取景框中直接倒计时) -->
        <div class="studio-countdown-layer" id="studioCountdownLayer" style="display: none;">
            <div class="studio-countdown-number" id="studioCountdownNum">3</div>
            <div class="studio-countdown-tip" id="studioCountdownTip">📸 保持微笑，准备抓拍...</div>
        </div>

        <!-- 趣味拍照姿势灵感卡 (Pose Inspiration Card) -->
        <div class="studio-pose-card" id="studioPoseCard">
            <div class="studio-pose-card-header">
                <span class="pose-badge"><i class="fa fa-lightbulb"></i> 姿势灵感</span>
                <button type="button" class="pose-nav-btn" id="btnPosePrev" title="上一个姿势"><i class="fa fa-chevron-left"></i></button>
                <span class="pose-counter" id="lblPoseCounter">1/8</span>
                <button type="button" class="pose-nav-btn" id="btnPoseNext" title="下一个姿势"><i class="fa fa-chevron-right"></i></button>
                <button type="button" class="pose-toggle-btn" id="btnPoseToggle" title="收起/展开姿势卡"><i class="fa fa-chevron-down"></i></button>
            </div>
            <div class="studio-pose-card-body" id="studioPoseBody">
                <div class="pose-icon" id="lblPoseIcon">🐱</div>
                <div class="pose-info">
                    <strong class="pose-title" id="lblPoseTitle">猫咪萌爪爪</strong>
                    <p class="pose-desc" id="lblPoseDesc">双手半握拳放脸颊两侧，歪头微抿嘴笑</p>
                </div>
            </div>
        </div>
    </div>

    <!-- 右侧个性化创意设置工作台 (Creative Workbench) -->
    <div class="studio-workbench" id="studioWorkbench">
        <!-- 工作台顶部标头 -->
        <div class="workbench-header">
            <div class="workbench-header-icon" id="workbenchIcon">
                <i class="fa fa-wand-magic-sparkles"></i>
            </div>
            <div class="workbench-header-text">
                <h2 class="workbench-title" id="workbenchTitle">AI 魔法变身工作室</h2>
                <p class="workbench-subtitle" id="workbenchSubtitle">保留本人五官 · 实时滤镜与写真模板</p>
            </div>
        </div>

        <!-- 双标签页导航栏 (Two Tabs) -->
        <div class="workbench-tabs">
            <button type="button" class="wb-tab-btn active" id="tabBtnFilters" data-tab="filters">
                <i class="fa fa-palette"></i>
                <span>滤镜与美颜</span>
            </button>
            <button type="button" class="wb-tab-btn" id="tabBtnTemplates" data-tab="templates">
                <i class="fa fa-masks-theater"></i>
                <span id="tabTemplatesLabel">挑选模板</span>
            </button>
        </div>

        <!-- 标签页内容容器 -->
        <div class="workbench-body">
            <!-- ===================== 标签页 1：滤镜与美颜 ===================== -->
            <div class="wb-tab-pane active" id="paneFilters">
                <!-- 1. 美颜实时微调模块 -->
                <div class="wb-section wb-section--beauty <?= $beautyEnabled ? '' : 'is-disabled' ?>">
                    <div class="wb-section-header">
                        <div class="wb-section-title">
                            <i class="fa fa-wand-magic-sparkles"></i>
                            <span>AI 智能人像美颜微调</span>
                            <?php if (!$beautyEnabled): ?>
                                <span id="badgeBeautyDisabled" class="wb-beauty-disabled-badge"><i class="fa fa-ban"></i> 已停用</span>
                            <?php endif; ?>
                        </div>
                        <button type="button" class="wb-reset-btn" id="btnResetStudioBeauty" title="恢复默认微调参数" <?= $beautyEnabled ? '' : 'disabled' ?>>
                            <i class="fa fa-rotate-left"></i> 重置初修
                        </button>
                    </div>

                    <!-- 美颜风格快速预设胶囊 -->
                    <div class="wb-beauty-presets" id="studioBeautyPresets">
                        <button type="button" class="wb-preset-pill <?= $activePreset === 'natural' ? 'active' : '' ?>" data-preset="natural" <?= $beautyEnabled ? '' : 'disabled' ?>><i class="fa fa-wand-magic-sparkles"></i> 自然清透</button>
                        <button type="button" class="wb-preset-pill <?= $activePreset === 'rosy' ? 'active' : '' ?>" data-preset="rosy" <?= $beautyEnabled ? '' : 'disabled' ?>><i class="fa fa-heart"></i> 粉嫩元气</button>
                        <button type="button" class="wb-preset-pill <?= $activePreset === 'cool' ? 'active' : '' ?>" data-preset="cool" <?= $beautyEnabled ? '' : 'disabled' ?>><i class="fa fa-gem"></i> 高级冷白</button>
                        <button type="button" class="wb-preset-pill <?= $activePreset === 'raw' ? 'active' : '' ?>" data-preset="raw" <?= $beautyEnabled ? '' : 'disabled' ?>><i class="fa fa-camera"></i> 原生微修</button>
                    </div>

                    <div class="wb-beauty-grid">
                        <!-- 磨皮 -->
                        <div class="wb-beauty-card">
                            <div class="wb-slider-row">
                                <span class="wb-slider-label"><i class="fa fa-sparkles"></i> 自然磨皮</span>
                                <span class="wb-slider-val" id="valStudioSmooth"><?= $bSmooth ?>%</span>
                            </div>
                            <input type="range" min="0" max="100" value="<?= $bSmooth ?>" class="wb-range-slider" id="studioSmoothSlider" <?= $beautyEnabled ? '' : 'disabled' ?>>
                        </div>

                        <!-- 美白 -->
                        <div class="wb-beauty-card">
                            <div class="wb-slider-row">
                                <span class="wb-slider-label"><i class="fa fa-sun"></i> 晶透美白</span>
                                <span class="wb-slider-val" id="valStudioWhite"><?= $bWhite ?>%</span>
                            </div>
                            <input type="range" min="0" max="100" value="<?= $bWhite ?>" class="wb-range-slider" id="studioWhiteSlider" <?= $beautyEnabled ? '' : 'disabled' ?>>
                        </div>

                        <!-- 红润 -->
                        <div class="wb-beauty-card">
                            <div class="wb-slider-row">
                                <span class="wb-slider-label"><i class="fa fa-droplet"></i> 元气红润</span>
                                <span class="wb-slider-val" id="valStudioRosy"><?= $bRosy ?>%</span>
                            </div>
                            <input type="range" min="0" max="100" value="<?= $bRosy ?>" class="wb-range-slider" id="studioRosySlider" <?= $beautyEnabled ? '' : 'disabled' ?>>
                        </div>

                        <!-- 立体修容 -->
                        <div class="wb-beauty-card">
                            <div class="wb-slider-row">
                                <span class="wb-slider-label"><i class="fa fa-sliders"></i> 立体修容</span>
                                <span class="wb-slider-val" id="valStudioClarity"><?= $bClarity ?>%</span>
                            </div>
                            <input type="range" min="0" max="100" value="<?= $bClarity ?>" class="wb-range-slider" id="studioClaritySlider" <?= $beautyEnabled ? '' : 'disabled' ?>>
                        </div>

                        <!-- 大眼 -->
                        <div class="wb-beauty-card">
                            <div class="wb-slider-row">
                                <span class="wb-slider-label"><i class="fa fa-eye"></i> 灵动大眼</span>
                                <span class="wb-slider-val" id="valStudioEye"><?= $bEye ?>%</span>
                            </div>
                            <input type="range" min="0" max="100" value="<?= $bEye ?>" class="wb-range-slider" id="studioEyeSlider" <?= $beautyEnabled ? '' : 'disabled' ?>>
                        </div>

                        <!-- 瘦脸 -->
                        <div class="wb-beauty-card">
                            <div class="wb-slider-row">
                                <span class="wb-slider-label"><i class="fa fa-heart"></i> 精致小脸</span>
                                <span class="wb-slider-val" id="valStudioSlim"><?= $bSlim ?>%</span>
                            </div>
                            <input type="range" min="0" max="100" value="<?= $bSlim ?>" class="wb-range-slider" id="studioSlimSlider" <?= $beautyEnabled ? '' : 'disabled' ?>>
                        </div>
                    </div>
                </div>

                <!-- 2. 精选质感滤镜模块 (所见即所得实时预览) -->
                <div class="wb-section wb-section--filters">
                    <div class="wb-section-header">
                        <div class="wb-section-title">
                            <i class="fa fa-camera-rotate"></i>
                            <span>精选色调滤镜 (点击即时生效)</span>
                        </div>
                        <span class="wb-section-hint">左侧镜头实时所见即所得</span>
                    </div>

                    <div class="wb-filters-gallery" id="studioFiltersGallery">
                        <?php foreach ($filterPresets as $fp): ?>
                            <?php $isAct = ($fp['id'] === $defFilterVal); ?>
                            <div class="wb-filter-item <?= $isAct ? 'active' : '' ?>" data-filter="<?= $fp['id'] ?>" role="button" tabindex="0">
                                <div class="wb-filter-swatch wb-filter-swatch--<?= $fp['id'] ?>">
                                    <span class="wb-filter-tag"><?= $fp['tag'] ?></span>
                                    <div class="wb-filter-check"><i class="fa fa-check"></i></div>
                                </div>
                                <span class="wb-filter-name"><?= $fp['name'] ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- ===================== 标签页 2：挑选模板 ===================== -->
            <div class="wb-tab-pane" id="paneTemplates">
                <!-- AI 相机模板模式 -->
                <div class="wb-tpl-container" id="studioAiTplContainer">
                    <!-- 精简单排分类过滤器与上传写真按钮（彻底消除冗余重复框） -->
                    <div class="wb-tpl-toolbar wb-tpl-toolbar--unified">
                        <div class="ai-catalog-controls">
                            <label>性别<select id="aiSexFilter" class="ai-catalog-select"><option value="all">全部性别</option><option value="male">👔 男士专区 (Man)</option><option value="female">🌸 女士专区 (Woman)</option></select></label>
                            <label>风格/分类<select id="aiCategoryFilter" class="ai-catalog-select"><option value="all">全部风格</option><option value="man">👔 男士专区 (全部)</option><option value="woman">🌸 女士专区 (全部)</option><?php 
                                $catLabels = [
                                    'hanfu' => '🌸 汉服古风',
                                    'wedding' => '💍 浪漫婚纱',
                                    'cyberpunk' => '🤖 赛博机甲',
                                    'school' => '🎒 青春校园',
                                    'vintage' => '🎞️ 复古风华',
                                    'cosplay' => '🎭 Cosplay动漫',
                                    'business' => '👔 商务西装',
                                    'street' => '🛹 街头潮流',
                                    'agent' => '🕶️ 特工',
                                    'formal' => '✨ 高级礼服',
                                    'outdoor' => '🌲 户外旅行',
                                    'creative' => '🎨 文艺写真',
                                    'sport' => '⚽ 运动活力',
                                    'studio' => '📸 摄影棚拍',
                                    'custom' => '⭐ 我的上传'
                                ];
                                $activeCats = array_filter(array_unique(array_column($aiTemplates, 'category')), fn($c) => !in_array($c, ['man', 'woman'], true));
                                foreach ($activeCats as $category): ?><option value="<?=htmlspecialchars($category)?>"><?=htmlspecialchars($catLabels[$category] ?? $category)?></option><?php endforeach; ?></select></label>
                            <label>年龄段<select id="aiAgeFilter" class="ai-catalog-select"><option value="all">全部年龄</option><option value="18-29">青年 (18–29 岁)</option><option value="30-44">成熟 (30–44 岁)</option></select></label>
                            <span id="aiTemplateCount"><?=count($aiTemplates)?> 张模板</span>
                        </div>
                        <button type="button" class="wb-upload-btn" id="btnStudioUploadAiTemplate" title="上传您喜爱的任意写真图片作为换脸模板">
                            <i class="fa fa-cloud-arrow-up"></i>
                            <span>上传写真</span>
                        </button>
                        <input type="file" id="studioAiTemplateUploadInput" accept="image/jpeg,image/png,image/webp,image/jpg" style="display: none;" />
                    </div>

                    <!-- AI 模板网格卡片 -->
                    <div class="wb-tpl-grid" id="studioAiTplGrid">
                        <?php foreach ($aiTemplates as $idx => $tpl): ?>
                            <?php $isCustom = !empty($tpl['is_custom']) || (isset($tpl['category']) && $tpl['category'] === 'custom'); ?>
                            <div class="wb-tpl-card <?= $idx === 0 ? 'active' : '' ?> <?= $isCustom ? 'wb-tpl-card--custom' : '' ?>"
                                 data-id="<?= htmlspecialchars($tpl['id']) ?>"
                                 data-cat="<?= htmlspecialchars($tpl['category']) ?>"
                                 data-age="<?= htmlspecialchars($tpl['age_band'] ?? 'unspecified') ?>"
                                 data-sex="<?= $tpl['sex_code'] ?? 'unisex' ?>"
                                 data-title="<?= htmlspecialchars($tpl['title']) ?>"
                                 data-image="<?= htmlspecialchars($tpl['image']) ?>"
                                 <?= $isCustom ? 'data-custom="1"' : '' ?>
                                 role="button" tabindex="0">
                                <div class="wb-tpl-thumb-box">
                                    <img src="<?= $tpl['thumb'] ?>" alt="<?= htmlspecialchars($tpl['title']) ?>" class="wb-tpl-img" loading="lazy">
                                    <span class="wb-tpl-chip"><?= htmlspecialchars($tpl['tag']) ?></span>
                                    <div class="wb-tpl-check"><i class="fa fa-circle-check"></i></div>
                                    <?php if ($isCustom): ?>
                                        <button type="button" class="wb-tpl-del-btn" data-id="<?= htmlspecialchars($tpl['id']) ?>" title="删除该自定义模板">
                                             <i class="fa fa-trash-can"></i>
                                        </button>
                                    <?php endif; ?>
                                </div>
                                <div class="wb-tpl-meta">
                                    <div class="wb-tpl-title"><?= htmlspecialchars($tpl['title']) ?></div>
                                    <div class="wb-tpl-tags">
                                        <span class="tag-sex <?= ($tpl['sex_code'] ?? '') === 'male' ? 'tag-sex--male' : (($tpl['sex_code'] ?? '') === 'female' ? 'tag-sex--female' : '') ?>"><i class="fa <?= ($tpl['sex_code'] ?? '') === 'male' ? 'fa-mars' : (($tpl['sex_code'] ?? '') === 'female' ? 'fa-venus' : 'fa-user') ?>"></i> <?= htmlspecialchars($tpl['sex']) ?></span>
                                        <span class="tag-feat"><?= $isCustom ? '自定义' : '写真模板' ?></span>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <p id="aiTemplateEmpty" hidden>没有符合当前条件的模板，请调整分类。</p>
                </div>

                <!-- 经典大头照模板模式 -->
                <div class="wb-tpl-container" id="studioClassicTplContainer" style="display: none;">
                    <!-- 排版规格快捷选单 -->
                    <div class="wb-layout-bar">
                        <span class="wb-layout-label"><i class="fa fa-table-cells"></i> 相纸版式:</span>
                        <button type="button" class="wb-layout-chip active" id="btnStudioModeSingle" data-layout="single">
                            <i class="fa fa-camera"></i> 单张精修大头贴
                        </button>
                        <button type="button" class="wb-layout-chip" id="btnStudioModeBurst" data-layout="burst">
                            <i class="fa fa-table-cells-large"></i> 经典四格 (2x2)
                        </button>
                        <button type="button" class="wb-layout-chip" id="btnStudioModeLife4" data-layout="life4cuts">
                            <i class="fa fa-film"></i> 人生四格 (2x6双条)
                        </button>
                    </div>

                    <!-- 人生四格经典定制相框底色 -->
                    <div class="wb-frame-bar" id="studioFrameBar">
                        <span class="wb-layout-label"><i class="fa fa-palette"></i> 相框底色:</span>
                        <button type="button" class="wb-frame-chip active" data-color="#111827" data-name="曜石黑">
                            <span class="frame-dot" style="background:#111827;border:1px solid #4b5563;"></span> 曜石黑
                        </button>
                        <button type="button" class="wb-frame-chip" data-color="#F9FAFB" data-name="纯净白">
                            <span class="frame-dot" style="background:#F9FAFB;border:1px solid #d1d5db;"></span> 纯净白
                        </button>
                        <button type="button" class="wb-frame-chip" data-color="#64748B" data-name="高级灰">
                            <span class="frame-dot" style="background:#64748B;"></span> 高级灰
                        </button>
                        <button type="button" class="wb-frame-chip" data-color="#78350F" data-name="复古咖">
                            <span class="frame-dot" style="background:#78350F;"></span> 复古咖
                        </button>
                    </div>

                    <!-- 背景抠图模板工具栏 -->
                    <div class="wb-tpl-toolbar">
                        <span class="wb-tpl-toolbar-title"><i class="fa fa-scissors"></i> 发丝级抠图 · 纯色与艺术背景</span>
                        <button type="button" class="wb-upload-btn" id="btnStudioUploadBgTemplate" title="上传自定义贴纸或背景">
                            <i class="fa fa-cloud-arrow-up"></i>
                            <span>上传背景</span>
                        </button>
                        <input type="file" id="studioBgTemplateUploadInput" accept="image/jpeg,image/png,image/webp,image/jpg" style="display: none;" />
                    </div>

                    <!-- 经典背景模板网格 -->
                    <div class="wb-tpl-grid" id="studioClassicTplGrid">
                        <?php foreach ($classicTemplates as $cidx => $ctpl): ?>
                            <?php $isClassicAct = ($ctpl['id'] === 'none'); ?>
                            <div class="wb-classic-card <?= $isClassicAct ? 'active' : '' ?>"
                                 data-id="<?= $ctpl['id'] ?>"
                                 data-title="<?= htmlspecialchars($ctpl['title']) ?>"
                                 data-image="<?= $ctpl['thumb'] ?>"
                                 role="button" tabindex="0">
                                <div class="wb-classic-thumb-box">
                                    <img src="<?= $ctpl['thumb'] ?>" alt="<?= htmlspecialchars($ctpl['title']) ?>" class="wb-classic-img" loading="lazy">
                                    <div class="wb-tpl-check"><i class="fa fa-circle-check"></i></div>
                                </div>
                                <div class="wb-classic-name"><?= htmlspecialchars($ctpl['title']) ?></div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部固定动作栏 (Fixed Bottom Actions) -->
        <div class="workbench-footer">
            <div class="wb-footer-status">
                <div class="wb-selected-chip">
                    <img id="studioCurrentTplThumb" alt="已选目标" style="display:none;" onerror="this.style.display='none';">
                    <div class="wb-selected-texts">
                        <span class="wb-selected-label">当前选定：</span>
                        <strong class="wb-selected-name" id="studioCurrentTplName">请选择写真模板</strong>
                    </div>
                </div>
            </div>

            <div class="wb-footer-actions">
                <div class="wb-countdown-box">
                    <label for="studioCountdownSelect" class="wb-countdown-label">
                        <i class="fa fa-stopwatch"></i> 拍照倒计时
                    </label>
                    <select id="studioCountdownSelect" class="wb-countdown-select">
                        <option value="1">1 秒</option>
                        <option value="2">2 秒</option>
                        <option value="3" selected>3 秒 (标准)</option>
                        <option value="4">4 秒</option>
                        <option value="5">5 秒 (从容)</option>
                        <option value="6">6 秒</option>
                        <option value="7">7 秒</option>
                        <option value="8">8 秒 (多合影)</option>
                        <option value="9">9 秒</option>
                        <option value="10">10 秒 (大合影)</option>
                    </select>
                </div>
                <button type="button" class="wb-capture-btn" id="btnStudioDoneCapture">
                    <div class="wb-capture-btn-inner">
                        <i class="fa fa-camera-retro"></i>
                        <span class="wb-capture-text">完成 · 开始拍照</span>
                    </div>
                    <div class="wb-capture-btn-shine"></div>
                </button>
            </div>
        </div>
    </div>
</div>
