<?php
use Photobooth\Utility\PathUtility;
use Photobooth\Utility\StartpageTextPosition;

$availableAiTemplates = (new \Photobooth\Service\AiTemplateCatalogService())->all();

$startpageTextPosition = StartpageTextPosition::resolve(
    $config['ui']['startpage_text_position'] ?? null,
    $config['logo']['position'] ?? null,
    $config['logo']['enabled'] ?? null
);
?>
<!-- Start Page -->
<div class="stage stage--start rotarygroup" data-stage="start">
    <!-- Flat Design Poster Background Shapes -->
    <div class="flat-background-decorations" aria-hidden="true">
        <div class="flat-shape flat-shape--circle-1"></div>
        <div class="flat-shape flat-shape--square-1"></div>
        <div class="flat-shape flat-shape--circle-2"></div>
    </div>

    <!-- Flat Top Bar -->
    <header class="flat-header">
        <div class="flat-brand">
            <div class="flat-logo-box">
                <i class="fa fa-camera"></i>
            </div>
            <div class="flat-brand-text">
                <span class="flat-title"><?= htmlspecialchars(!empty($config['start_screen']['title']) ? $config['start_screen']['title'] : 'PHOTOBOOTH') ?></span>
                <span class="flat-status">
                    <span class="flat-status-dot"></span>
                    <span>系统就绪</span>
                </span>
            </div>
        </div>
        <div class="flat-widgets">
            <button type="button" id="btnQuickSettings" class="flat-settings-btn" title="快捷设置">
                <i class="fa fa-gear"></i>
                <span class="settings-btn-text">设置</span>
            </button>
            <div class="flat-clock" id="modernAppClock">
                <i class="fa fa-clock"></i>
                <span class="clock-time">--:--</span>
            </div>
        </div>
    </header>

    <?php include PathUtility::getAbsolutePath('template/components/start.logo.php'); ?>
    <div class="stage-inner">
        <?php if ($config['event']['enabled'] || $config['start_screen']['title_visible'] || $config['start_screen']['subtitle_visible']): ?>
            <div class="stage-start__text stage-start__text--<?= $startpageTextPosition ?>">
                <div class="names<?= ($config['ui']['decore_lines']) ? ' names--decoration' : '' ?>">
                    <div class="names-inner">
                        <?php if ($config['event']['enabled']): ?>
                            <h1 class="event-text">
                                <?= $config['event']['textLeft'] ?>
                                <i class="fa <?= $config['event']['symbol'] ?>" aria-hidden="true"></i>
                                <?= $config['event']['textRight'] ?>
                            </h1>
                        <?php endif; ?>
                        <?php if ($config['start_screen']['title_visible']): ?>
                        <h1 class="start-text"><?= $config['start_screen']['title'] ?></h1>
                        <?php endif; ?>
                        <?php if ($config['start_screen']['subtitle_visible']): ?>
                        <h2 class="start-text"><?= $config['start_screen']['subtitle'] ?></h2>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        <?php endif; ?>
        <div class="stage-start__actions">
            <!-- 商用双模式选择大看板 (Dual Mode Portal) -->
            <div class="mode-portal">
                <div class="mode-portal__header">
                    <span class="mode-portal__tag"><i class="fa fa-wand-magic-sparkles"></i> 智能照相亭一体机 · 双重互娱体验</span>
                    <h2 class="mode-portal__title">请选择心仪的拍摄体验</h2>
                </div>

                <div class="mode-portal__cards">
                    <!-- 模式 A：经典美颜大头贴 -->
                    <div class="mode-card mode-card--classic" id="cardModeClassic" role="button" tabindex="0">
                        <div class="mode-card__badge mode-card__badge--pink">
                            <i class="fa fa-fire"></i> 爆款自拍馆
                        </div>
                        <div class="mode-card__icon-box">
                            <i class="fa fa-camera-retro"></i>
                        </div>
                        <div class="mode-card__body">
                            <h3 class="mode-card__heading">经典美颜大头贴</h3>
                            <p class="mode-card__sub">自然微调美颜 · 发丝级抠图换背景 · 拍立得四宫格</p>
                            <div class="mode-card__pills">
                                <span class="mode-pill"><i class="fa fa-wand-magic-sparkles"></i> 实时微调</span>
                                <span class="mode-pill"><i class="fa fa-scissors"></i> 发丝抠图</span>
                                <span class="mode-pill"><i class="fa fa-images"></i> 贴纸背景</span>
                            </div>
                        </div>
                        <div class="mode-card__footer">
                            <button type="button" class="mode-action-btn mode-action-btn--primary" id="btnClassicStart" title="点击开始经典美颜大头贴">
                                <i class="fa fa-camera"></i> 点击
                            </button>
                            <?php if ($config['rembg']['enabled'] ?? true): ?>
                            <button type="button" class="mode-action-btn mode-action-btn--secondary uploadBtn" id="btnClassicUpload" title="上传相册已有照片">
                                <i class="fa fa-cloud-arrow-up"></i> 上传照片
                            </button>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- 模式 B：AI 魔法变身照 -->
                    <div class="mode-card mode-card--ai" id="cardModeAi" role="button" tabindex="0">
                        <div class="mode-card__badge mode-card__badge--violet">
                            <i class="fa fa-bolt"></i> 自动硬件加速
                        </div>
                        <div class="mode-card__icon-box">
                            <i class="fa fa-masks-theater"></i>
                        </div>
                        <div class="mode-card__body">
                            <h3 class="mode-card__heading">AI 魔法变身照</h3>
                            <p class="mode-card__sub">挑选写真 · 正面拍摄 · 保留本人五官</p>
                            <!-- 模板例图微缩长廊 -->
                            <div class="mode-card__showcase">
                                <?php foreach (array_slice($availableAiTemplates, 0, 3) as $tpl): ?>
                                <div class="mode-showcase-item">
                                    <img src="<?= htmlspecialchars($tpl['thumb'], ENT_QUOTES, 'UTF-8') ?>" alt="<?= htmlspecialchars($tpl['title'], ENT_QUOTES, 'UTF-8') ?>">
                                    <span><?= htmlspecialchars($tpl['tag'] ?? '精选写真', ENT_QUOTES, 'UTF-8') ?></span>
                                </div>
                                <?php endforeach; ?>
                            </div>
                            <div class="mode-card__pills">
                                <span class="mode-pill"><i class="fa fa-shirt"></i> 写真风格</span>
                                <span class="mode-pill"><i class="fa fa-robot"></i> 自选模板</span>
                                <span class="mode-pill"><i class="fa fa-bolt-lightning"></i> 本人五官</span>
                            </div>
                        </div>
                        <div class="mode-card__footer">
                            <button type="button" class="mode-action-btn mode-action-btn--ai" id="btnEnterAiMode">
                                <i class="fa fa-wand-magic-sparkles"></i> 挑模板变身
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 底部辅助工具栏 (相册/自定义/视频/刷新/解锁) -->
                <div class="mode-portal__toolbar">
                    <?php if ($config['gallery']['enabled']): ?>
                    <button type="button" class="mode-tool-btn gallery-button" title="浏览历史照片">
                        <i class="<?= $config['icons']['gallery'] ?>"></i>
                        <span>历史相册</span>
                    </button>
                    <?php endif; ?>
                    <?php if ($config['custom']['enabled']): ?>
                    <button type="button" class="mode-tool-btn takeCustom" title="<?= htmlspecialchars($config['custom']['btn_text']) ?>">
                        <i class="<?= $config['icons']['take_custom'] ?>"></i>
                        <span><?= htmlspecialchars($config['custom']['btn_text']) ?></span>
                    </button>
                    <?php endif; ?>
                    <?php if ($config['video']['enabled']): ?>
                    <button type="button" class="mode-tool-btn takeVideo" title="录制视频">
                        <i class="<?= $config['icons']['take_video'] ?>"></i>
                        <span>录制视频</span>
                    </button>
                    <?php endif; ?>
                    <?php if ($config['button']['reload']): ?>
                    <button type="button" class="mode-tool-btn reload" title="重新加载系统">
                        <i class="<?= $config['icons']['refresh'] ?>"></i>
                        <span>刷新</span>
                    </button>
                    <?php endif; ?>
                    <?php if ($config['button']['show_cups']): ?>
                    <button type="button" class="mode-tool-btn cups-button" title="杯子比赛">
                        <i class="<?= $config['icons']['cups'] ?>"></i>
                        <span>比赛</span>
                    </button>
                    <?php endif; ?>
                    <?php if ($config['button']['show_printUnlock']): ?>
                    <button type="button" class="mode-tool-btn print-unlock-button <?= Photobooth\Service\PrintManagerService::getInstance()->isPrintLocked() ? '' : 'hidden' ?>" title="解锁打印">
                        <i class="<?= $config['icons']['print'] ?>"></i>
                        <span>解锁打印</span>
                    </button>
                    <?php endif; ?>
                </div>
            </div>
            
            <?php if ($config['rembg']['enabled'] ?? true): ?>
            <input type="file" id="uploadPhotoInput" accept="image/jpeg,image/png,image/webp,image/jpg" style="display:none;" />
            <?php endif; ?>
        </div>

    </div>
    <?php
    $screensaverMode = $config['screensaver']['mode'] ?? 'image';
$screensaverImageSource = $config['screensaver']['image_source'] ?? '';
$screensaverVideoSource = $config['screensaver']['video_source'] ?? '';

$screensaverSource = '';
if ($screensaverMode === 'image' && $screensaverImageSource) {
    $screensaverSource = PathUtility::getPublicPath($screensaverImageSource);
} elseif ($screensaverMode === 'video' && $screensaverVideoSource) {
    $screensaverSource = PathUtility::getPublicPath($screensaverVideoSource);
}
?>
    <div
        id="screensaver-overlay"
        class="screensaver-overlay"
        data-mode="<?= $screensaverMode ?>"
        data-source="<?= $screensaverSource ?>"
        style="display: none;"
    >
        <div id="screensaver-text-top" class="screensaver-overlay__text screensaver-overlay__text--top"></div>
        <div id="screensaver-text-center" class="screensaver-overlay__text screensaver-overlay__text--center"></div>
        <img id="screensaver-image" class="screensaver-overlay__image" alt="screensaver">
        <video id="screensaver-video" loop muted playsinline></video>
    </div>

    <!-- Quick Settings Modal (多摄像头选择与偏好设置) -->
    <div id="quickSettingsModal" class="quick-settings-modal" style="display: none;" aria-hidden="true">
        <div class="quick-settings-backdrop" id="quickSettingsBackdrop"></div>
        <div class="quick-settings-dialog">
            <div class="quick-settings-header">
                <div class="quick-settings-title">
                    <div class="settings-title-icon"><i class="fa fa-sliders"></i></div>
                    <div>
                        <div class="settings-title-text">照相亭快捷设置</div>
                        <div class="settings-subtitle-text">设备切换与取景偏好调整</div>
                    </div>
                </div>
                <button type="button" id="btnQuickSettingsClose" class="settings-close-btn" title="关闭设置">
                    <i class="fa fa-xmark"></i>
                </button>
            </div>

            <div class="quick-settings-body">
                <!-- 1. 摄像头选择 -->
                <div class="settings-card">
                    <div class="settings-card-header">
                        <div class="settings-card-icon"><i class="fa fa-video"></i></div>
                        <div class="settings-card-info">
                            <span class="settings-card-label">摄像头设备 (Camera)</span>
                            <span class="settings-card-desc">选择当前用于实时预览和拍照的视频输入设备</span>
                        </div>
                        <button type="button" id="btnRefreshCameras" class="settings-icon-btn" title="刷新摄像头列表">
                            <i class="fa fa-arrows-rotate"></i>
                        </button>
                    </div>
                    <div class="settings-card-content">
                        <div class="settings-select-wrapper">
                            <select id="settingCameraSelect" class="settings-select">
                                <option value="">正在检测可用摄像头...</option>
                            </select>
                            <i class="fa fa-chevron-down select-chevron"></i>
                        </div>
                        <div class="settings-camera-hint" id="settingCameraHint">
                            <i class="fa fa-circle-info"></i> 切换摄像头后实时取景画面将即时更新
                        </div>
                        <div class="settings-camera-preview-box">
                            <video id="settingCameraMiniVideo" autoplay playsinline muted style="display: none;"></video>
                            <div class="settings-camera-preview-placeholder">
                                <i class="fa fa-video"></i>
                                <span>实时画面取景预览</span>
                            </div>
                        </div>
                    </div>
                </div>


                <!-- 3. AI 抠图计算设备 (GPU / CPU) 设置 -->
                <?php
                $gpuMode = $config['rembg']['gpu_mode'] ?? 'auto';
                $isGpu = in_array($gpuMode, ['cuda', 'directml'], true);
                $cpuThreads = (int)($config['rembg']['cpu_threads'] ?? 8);
                ?>
                <div class="settings-card settings-card--device">
                    <div class="settings-card-header">
                        <div class="settings-card-icon" style="background: linear-gradient(135deg, #3b82f6, #10b981); color: #fff;">
                            <i class="fa fa-microchip"></i>
                        </div>
                        <div class="settings-card-info">
                            <span class="settings-card-label">AI 抠图计算设备 (Inference Device)</span>
                            <span class="settings-card-desc">选择人像发丝抠图的硬件加速引擎（即时生效）</span>
                        </div>
                    </div>
                    <div class="settings-card-content">
                        <div class="settings-select-wrapper settings-device-select-wrapper">
                            <select id="settingInferenceDevice" class="settings-select" aria-label="AI 推理设备">
                                <option value="auto" <?= $gpuMode === 'auto' ? 'selected' : '' ?>>自动选择（允许回退）</option>
                                <option value="cpu" <?= $gpuMode === 'cpu' ? 'selected' : '' ?>>CPU</option>
                                <option value="cuda" <?= $gpuMode === 'cuda' ? 'selected' : '' ?>>CUDA</option>
                                <option value="directml" <?= $gpuMode === 'directml' ? 'selected' : '' ?>>DirectML</option>
                            </select>
                            <i class="fa fa-chevron-down select-chevron"></i>
                        </div>
                        <div class="settings-select-wrapper settings-device-select-wrapper">
                            <span class="settings-device-select-label">抠图模型</span>
                            <select id="settingMattingEngine" class="settings-select" aria-label="AI 抠图模型">
                                <option value="birefnet" <?= ($config['rembg']['engine'] ?? 'birefnet') === 'birefnet' ? 'selected' : '' ?>>BiRefNet 人像发丝</option>
                                <option value="rmbg2" <?= ($config['rembg']['engine'] ?? '') === 'rmbg2' ? 'selected' : '' ?>>RMBG-2.0 通用主体</option>
                            </select>
                            <i class="fa fa-chevron-down select-chevron"></i>
                        </div>
                        
                        <!-- GPU Info Box -->
                        <div class="settings-gpu-info-box" id="settingsGpuInfoBox" style="<?= $isGpu ? '' : 'display:none;' ?>">
                            <div class="settings-gpu-status">
                                <i class="fa fa-circle-check" style="color: #10b981;"></i>
                                <span id="settingsGpuName">运行时设备状态读取中</span>
                            </div>
                            <div class="settings-gpu-tip">
                                <i class="fa fa-gauge-high"></i> DirectML 硬件张量与显存加速 · 耗时约 3 秒（提速超 2.7 倍）
                            </div>
                        </div>

                        <!-- CPU Threads Settings (Foldable, only shown when CPU is active) -->
                        <div class="settings-cpu-box" id="settingsCpuBox" style="<?= !$isGpu ? '' : 'display:none;' ?>">
                            <div class="settings-select-wrapper">
                                <select id="settingCpuThreadsSelect" class="settings-select">
                                    <option value="1" <?= $cpuThreads == 1 ? 'selected' : '' ?>>1 核心 (超低占用 · 节能静音)</option>
                                    <option value="2" <?= $cpuThreads == 2 ? 'selected' : '' ?>>2 核心 (轻度并发)</option>
                                    <option value="4" <?= $cpuThreads == 4 ? 'selected' : '' ?>>4 核心 (推荐平衡)</option>
                                    <option value="6" <?= $cpuThreads == 6 ? 'selected' : '' ?>>6 核心 (高速计算)</option>
                                    <option value="8" <?= $cpuThreads == 8 ? 'selected' : '' ?>>8 核心 (极限性能 · 推荐)</option>
                                    <option value="12" <?= $cpuThreads == 12 ? 'selected' : '' ?>>12 核心 (高负载并发)</option>
                                    <option value="16" <?= $cpuThreads == 16 ? 'selected' : '' ?>>16 核心 (全物理核心并发)</option>
                                </select>
                                <i class="fa fa-chevron-down select-chevron"></i>
                            </div>
                            <div class="settings-camera-hint" id="settingCpuThreadsHint">
                                <i class="fa fa-info-circle"></i> 纯 CPU 多核推理模式 · 单张耗时约 8~10 秒
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. AI 智能人像美颜设置 -->
                <?php
                $beautyEnabled = !isset($config['beauty']['enabled']) || !empty($config['beauty']['enabled']);
                $beautyAuto = $beautyEnabled && (!isset($config['beauty']['auto_apply']) || !empty($config['beauty']['auto_apply']));
                $bEye = (int)($config['beauty']['default_eye'] ?? 15);
                $bSlim = (int)($config['beauty']['default_slim'] ?? 15);
                $bSmooth = (int)($config['beauty']['default_smooth'] ?? 20);
                $bWhite = (int)($config['beauty']['default_white'] ?? 15);
                $bRosy = (int)($config['beauty']['default_rosy'] ?? 20);
                $bClarity = (int)($config['beauty']['default_clarity'] ?? 15);
                ?>
                <div class="settings-card settings-card--beauty">
                    <div class="settings-card-header">
                        <div class="settings-card-icon" style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: #fff;">
                            <i class="fa fa-wand-magic-sparkles"></i>
                        </div>
                        <div class="settings-card-info">
                            <span class="settings-card-label">拍照自动微量美颜 (Auto Beauty)</span>
                            <span class="settings-card-desc">拍摄及上传后默认赋予自然初修效果，合影中所有人脸自动同步</span>
                        </div>
                        <label class="settings-switch">
                            <input type="checkbox" id="settingBeautyAutoApply" <?= $beautyAuto ? 'checked' : '' ?>>
                            <span class="settings-slider"></span>
                        </label>
                    </div>
                    <div class="settings-card-content" id="settingBeautySlidersBox" style="<?= $beautyAuto ? '' : 'display:none;' ?>">
                        <div class="settings-beauty-row">
                            <div class="settings-beauty-label">
                                <span><i class="fa fa-eye"></i> 默认大眼强度</span>
                                <span class="settings-beauty-val" id="lblSettingBeautyEye"><?= $bEye ?>%</span>
                            </div>
                            <input type="range" id="settingBeautyEye" min="0" max="100" value="<?= $bEye ?>" class="settings-beauty-slider">
                        </div>
                        <div class="settings-beauty-row">
                            <div class="settings-beauty-label">
                                <span><i class="fa fa-heart"></i> 默认瘦脸强度</span>
                                <span class="settings-beauty-val" id="lblSettingBeautySlim"><?= $bSlim ?>%</span>
                            </div>
                            <input type="range" id="settingBeautySlim" min="0" max="100" value="<?= $bSlim ?>" class="settings-beauty-slider">
                        </div>
                        <div class="settings-beauty-row">
                            <div class="settings-beauty-label">
                                <span><i class="fa fa-sparkles"></i> 默认磨皮强度</span>
                                <span class="settings-beauty-val" id="lblSettingBeautySmooth"><?= $bSmooth ?>%</span>
                            </div>
                            <input type="range" id="settingBeautySmooth" min="0" max="100" value="<?= $bSmooth ?>" class="settings-beauty-slider">
                        </div>
                        <div class="settings-beauty-row">
                            <div class="settings-beauty-label">
                                <span><i class="fa fa-sun"></i> 默认美白强度</span>
                                <span class="settings-beauty-val" id="lblSettingBeautyWhite"><?= $bWhite ?>%</span>
                            </div>
                            <input type="range" id="settingBeautyWhite" min="0" max="100" value="<?= $bWhite ?>" class="settings-beauty-slider">
                        </div>
                        <div class="settings-beauty-row">
                            <div class="settings-beauty-label">
                                <span><i class="fa fa-droplet"></i> 默认红润强度</span>
                                <span class="settings-beauty-val" id="lblSettingBeautyRosy"><?= $bRosy ?>%</span>
                            </div>
                            <input type="range" id="settingBeautyRosy" min="0" max="100" value="<?= $bRosy ?>" class="settings-beauty-slider">
                        </div>
                        <div class="settings-beauty-row">
                            <div class="settings-beauty-label">
                                <span><i class="fa fa-sliders"></i> 默认立体修容</span>
                                <span class="settings-beauty-val" id="lblSettingBeautyClarity"><?= $bClarity ?>%</span>
                            </div>
                            <input type="range" id="settingBeautyClarity" min="0" max="100" value="<?= $bClarity ?>" class="settings-beauty-slider">
                        </div>
                    </div>
                    <div class="settings-camera-hint" id="settingBeautyHint" style="margin-top: 0.5rem; padding: 0.5rem 0.75rem;">
                        <?php if ($beautyAuto): ?>
                            <i class="fa fa-circle-check" style="color: #10b981;"></i> 默认美颜参数已生效 · 新拍照片自动同步初修
                        <?php else: ?>
                            <i class="fa fa-circle-info" style="color: #94a3b8;"></i> 已停用美颜 · 拍照将保留原始生动镜头画面
                        <?php endif; ?>
                    </div>
                </div>

            </div>

            <div class="quick-settings-footer">
                <button type="button" id="btnQuickSettingsDone" class="settings-btn settings-btn--primary">
                    <i class="fa fa-check"></i> 完成设置
                </button>
            </div>
        </div>
    </div>



    <!-- 连拍选片工作台与局部重拍 Modal (Stage 4.1 & 4.2) -->
    <div class="burst-workbench-modal rotarygroup" id="burstWorkbenchModal" style="display:none;" aria-hidden="true">
        <div class="burst-workbench-backdrop" id="burstWorkbenchBackdrop"></div>
        <div class="burst-workbench-dialog">
            <div class="burst-workbench-header">
                <div class="burst-header-title">
                    <span class="burst-title-tag"><i class="fa fa-film"></i> 人生四格 · 连拍选片工作台</span>
                    <h3 class="burst-title-main">挑选您满意的 4 张照片 · 支持单张即时重拍</h3>
                </div>
                <div class="burst-header-actions">
                    <span class="burst-selection-count" id="burstSelectedCount">已选 4 / 4 张</span>
                    <button type="button" class="burst-close-btn" id="btnBurstClose" title="关闭工作台">
                        <i class="fa fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- 6 张连拍工作区网格 -->
            <div class="burst-workbench-grid" id="burstWorkbenchGrid">
                <!-- 动态渲染 6 个连拍卡片 -->
            </div>

            <!-- 排版规格与主题配置栏 (Stage 4.3) -->
            <div class="burst-layout-bar">
                <div class="burst-option-group">
                    <span class="burst-option-label"><i class="fa fa-table-cells"></i> 相纸规格:</span>
                    <button type="button" class="burst-layout-btn active" data-layout="1x4_strip">
                        <i class="fa fa-grip-lines-vertical"></i> 1x4 韩式双长条 (带裁切虚线 ✂️)
                    </button>
                    <button type="button" class="burst-layout-btn" data-layout="2x2">
                        <i class="fa fa-table-cells-large"></i> 2x2 经典四宫格方形
                    </button>
                </div>

                <div class="burst-option-group">
                    <span class="burst-option-label"><i class="fa fa-palette"></i> 边框配色:</span>
                    <button type="button" class="burst-theme-pill active theme-white" data-theme="white">极简白</button>
                    <button type="button" class="burst-theme-pill theme-black" data-theme="black">复古黑</button>
                    <button type="button" class="burst-theme-pill theme-gray" data-theme="gray">高级灰</button>
                    <button type="button" class="burst-theme-pill theme-coffee" data-theme="coffee">复古咖</button>
                    <button type="button" class="burst-theme-pill theme-pink" data-theme="pink">元气粉</button>
                    <button type="button" class="burst-theme-pill theme-violet" data-theme="violet">电光紫</button>
                </div>
            </div>

            <!-- 底部生成与重拍动作栏 -->
            <div class="burst-workbench-footer">
                <button type="button" class="burst-btn-restart" id="btnBurstRestart">
                    <i class="fa fa-rotate-left"></i> 全部作废重新连拍
                </button>
                <button type="button" class="burst-btn-generate" id="btnGenerateCollage">
                    <i class="fa fa-wand-magic-sparkles"></i> 极速生成 300DPI 拼版相纸
                </button>
            </div>
        </div>
    </div>

    <!-- 商业支付开闸 Modal (Stage 5.3) -->
    <div class="pay-gate-modal rotarygroup" id="payGateModal" style="display:none;" aria-hidden="true">
        <div class="pay-gate-backdrop" id="payGateBackdrop"></div>
        <div class="pay-gate-dialog">
            <div class="pay-gate-header">
                <div class="pay-gate-title-box">
                    <span class="pay-gate-tag"><i class="fa fa-cash-register"></i> 商用无人值守 · 扫码开闸</span>
                    <h3 class="pay-gate-heading" id="payGateModeTitle">经典美颜大头贴</h3>
                </div>
                <button type="button" class="pay-gate-close" id="btnPayGateClose" title="返回首页">
                    <i class="fa fa-times"></i>
                </button>
            </div>

            <div class="pay-gate-body">
                <div class="pay-amount-box">
                    <span class="pay-currency">¥</span>
                    <span class="pay-amount" id="payGateAmount">19.90</span>
                    <span class="pay-amount-sub">/ 组</span>
                </div>

                <div class="pay-qr-container">
                    <div class="pay-qr-card wx">
                        <div class="pay-qr-badge"><i class="fa-brands fa-weixin"></i> 微信支付</div>
                        <img id="payQrWx" class="pay-qr-img" src="" alt="微信支付码" />
                    </div>
                    <div class="pay-qr-card ali">
                        <div class="pay-qr-badge"><i class="fa-brands fa-alipay"></i> 支付宝</div>
                        <img id="payQrAli" class="pay-qr-img" src="" alt="支付宝付款码" />
                    </div>
                </div>

                <div class="pay-countdown-box">
                    <i class="fa fa-clock"></i> 请在 <span id="payTimerVal">120</span> 秒内完成支付，支付成功将自动开闸启动
                </div>
            </div>

            <div class="pay-gate-footer">
                <button type="button" class="pay-mock-btn" id="btnPayMockSuccess" title="开发与演示模式快速开闸">
                    <i class="fa fa-bolt"></i> 模拟商户支付成功开闸 (Demo)
                </button>
            </div>
        </div>
    </div>
    <script>
        (function() {
            function updateClock() {
                var el = document.querySelector('#modernAppClock .clock-time');
                if (!el) return;
                var now = new Date();
                var h = String(now.getHours()).padStart(2, '0');
                var m = String(now.getMinutes()).padStart(2, '0');
                el.textContent = h + ':' + m;
            }
            updateClock();
            setInterval(updateClock, 1000);
        })();
    </script>
</div>
