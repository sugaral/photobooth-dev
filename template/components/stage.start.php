<?php
use Photobooth\Utility\PathUtility;
use Photobooth\Utility\StartpageTextPosition;

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
            <?php
            if ($config['ui']['selfie_mode']) {
                include PathUtility::getAbsolutePath('template/components/selfieAction.php');
            } else {
                include PathUtility::getAbsolutePath('template/components/actionBtn.php');
            }
?>
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

                <!-- 2. 镜像翻转开关 -->
                <div class="settings-card">
                    <div class="settings-card-header">
                        <div class="settings-card-icon"><i class="fa fa-arrows-left-right"></i></div>
                        <div class="settings-card-info">
                            <span class="settings-card-label">画面镜像翻转 (Mirror)</span>
                            <span class="settings-card-desc">如照镜子般的自拍方向感体验</span>
                        </div>
                        <label class="settings-switch">
                            <input type="checkbox" id="settingCameraFlip" checked>
                            <span class="settings-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- 3. AI 抠图 CPU 并行核心数设置 -->
                <div class="settings-card">
                    <div class="settings-card-header">
                        <div class="settings-card-icon"><i class="fa fa-microchip"></i></div>
                        <div class="settings-card-info">
                            <span class="settings-card-label">AI 抠图 CPU 核心数 (CPU Cores)</span>
                            <span class="settings-card-desc">配置人像背景分离推理的 CPU 线程并发数（修改即时生效）</span>
                        </div>
                    </div>
                    <div class="settings-card-content">
                        <div class="settings-select-wrapper">
                            <select id="settingCpuThreadsSelect" class="settings-select">
                                <option value="1">1 核心 (超低占用 · 节能静音)</option>
                                <option value="2">2 核心 (轻度并发)</option>
                                <option value="4" selected>4 核心 (推荐平衡 · 默认)</option>
                                <option value="6">6 核心 (高速计算 · 推荐)</option>
                                <option value="8">8 核心 (极限性能 · P核全开)</option>
                                <option value="12">12 核心 (高负载并发)</option>
                                <option value="16">16 核心 (全物理核心并发)</option>
                            </select>
                            <i class="fa fa-chevron-down select-chevron"></i>
                        </div>
                        <div class="settings-camera-hint" id="settingCpuThreadsHint">
                            <i class="fa fa-circle-check" style="color: #10b981;"></i> 当前运行状态：4 核心并行计算 (即时生效)
                        </div>
                    </div>
                </div>

                <!-- 4. AI 智能人像美颜设置 -->
                <?php
                $beautyAuto = !empty($config['beauty']['auto_apply']);
                $bEye = (int)($config['beauty']['default_eye'] ?? 15);
                $bSlim = (int)($config['beauty']['default_slim'] ?? 15);
                $bSmooth = (int)($config['beauty']['default_smooth'] ?? 20);
                $bWhite = (int)($config['beauty']['default_white'] ?? 15);
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
                        <div class="settings-camera-hint" id="settingBeautyHint">
                            <i class="fa fa-circle-check" style="color: #10b981;"></i> 默认美颜参数已生效 · 新拍照片自动同步初修
                        </div>
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

    <?php include PathUtility::getAbsolutePath('template/components/github-corner.php'); ?>
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
