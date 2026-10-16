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
                            <button type="button" class="mode-action-btn mode-action-btn--primary" id="btnClassicBurst" title="连拍 6 张照片并在选片台自由组合四格">
                                <i class="fa fa-film"></i> 连拍四格 (6选4)
                            </button>
                            <button type="button" class="mode-action-btn mode-action-btn--secondary takePic" id="btnClassicStart" data-command="takePic" title="单张快速美颜拍摄">
                                <i class="fa fa-camera"></i> 单张自拍
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
                            <i class="fa fa-bolt"></i> RTX 5060 极速加速
                        </div>
                        <div class="mode-card__icon-box">
                            <i class="fa fa-masks-theater"></i>
                        </div>
                        <div class="mode-card__body">
                            <h3 class="mode-card__heading">AI 魔法变身照</h3>
                            <p class="mode-card__sub">盛唐汉服 · 未来机甲 · 赛博朋克 · 一秒穿越换脸</p>
                            <!-- 模板例图微缩长廊 -->
                            <div class="mode-card__showcase">
                                <div class="mode-showcase-item">
                                    <img src="resources/img/templates_ai/hanfu_female_01.jpg" alt="古风汉服" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'60\' fill=\'%23fecdd3\'><rect width=\'100%\' height=\'100%\'/></svg>'">
                                    <span>盛唐华服</span>
                                </div>
                                <div class="mode-showcase-item">
                                    <img src="resources/img/templates_ai/mecha_01.jpg" alt="量子机甲" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'60\' fill=\'%23bae6fd\'><rect width=\'100%\' height=\'100%\'/></svg>'">
                                    <span>量子机甲</span>
                                </div>
                                <div class="mode-showcase-item">
                                    <img src="resources/img/templates_ai/cyber_01.jpg" alt="赛博霓虹" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'60\' fill=\'%23ddd6fe\'><rect width=\'100%\' height=\'100%\'/></svg>'">
                                    <span>赛博霓虹</span>
                                </div>
                            </div>
                            <div class="mode-card__pills">
                                <span class="mode-pill"><i class="fa fa-shirt"></i> 古风华服</span>
                                <span class="mode-pill"><i class="fa fa-robot"></i> 未来科幻</span>
                                <span class="mode-pill"><i class="fa fa-bolt-lightning"></i> 极速换脸</span>
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
                $gpuMode = $config['rembg']['gpu_mode'] ?? 'gpu';
                $isGpu = ($gpuMode === 'gpu');
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
                        <!-- GPU / CPU Segmented Switcher -->
                        <div class="settings-device-segmented">
                            <button type="button" class="settings-device-pill <?= $isGpu ? 'active' : '' ?>" id="btnDeviceGpu" data-device="gpu">
                                <i class="fa fa-bolt"></i> GPU 硬件加速 (极速)
                            </button>
                            <button type="button" class="settings-device-pill <?= !$isGpu ? 'active' : '' ?>" id="btnDeviceCpu" data-device="cpu">
                                <i class="fa fa-server"></i> CPU 纯多核 (节能)
                            </button>
                        </div>
                        
                        <!-- GPU Info Box -->
                        <div class="settings-gpu-info-box" id="settingsGpuInfoBox" style="<?= $isGpu ? '' : 'display:none;' ?>">
                            <div class="settings-gpu-status">
                                <i class="fa fa-circle-check" style="color: #10b981;"></i>
                                <span id="settingsGpuName">已绑定独立显卡：NVIDIA GeForce RTX 5060 Laptop GPU</span>
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

    <!-- AI 魔法变身照 · 挑选模板弹窗 (Stage 1 AI Portal Gateway) -->
    <div id="aiTemplateModal" class="ai-template-modal" style="display: none;" aria-hidden="true">
        <div class="ai-template-backdrop" id="aiTemplateBackdrop"></div>
        <div class="ai-template-dialog">
            <div class="ai-template-header">
                <div class="ai-template-title-wrap">
                    <div class="ai-template-icon"><i class="fa fa-masks-theater"></i></div>
                    <div>
                        <div class="ai-template-title">AI 魔法变身照 · 挑选心动模板</div>
                        <div class="ai-template-subtitle">先选一款精美形象，再端正拍照完成极速穿越</div>
                    </div>
                </div>
                <button type="button" id="btnAiTemplateClose" class="ai-close-btn" title="返回首页">
                    <i class="fa fa-xmark"></i>
                </button>
            </div>

            <!-- 分类标签过滤器与上传入口 -->
            <div class="ai-category-tabs">
                <button type="button" class="ai-cat-tab active" data-category="all">全部精选</button>
                <button type="button" class="ai-cat-tab" data-category="hanfu">🌸 盛唐汉服</button>
                <button type="button" class="ai-cat-tab" data-category="cyberpunk">🤖 赛博未来</button>
                <button type="button" class="ai-cat-tab" data-category="vintage">🎞️ 港风胶片</button>
                <button type="button" class="ai-cat-tab" data-category="business">👔 商务形象</button>
                <button type="button" class="ai-cat-tab" data-category="custom">⭐ 自定义模板</button>
                <button type="button" class="ai-cat-tab ai-cat-tab--upload" id="btnUploadAiTemplate" title="上传您喜爱的任意人物或写真作为换脸模板">
                    <i class="fa fa-cloud-arrow-up"></i> 上传自定义模板
                </button>
                <input type="file" id="aiTemplateUploadInput" accept="image/jpeg,image/png,image/webp,image/jpg" style="display: none;" />
            </div>

            <!-- 模板展示网格 -->
            <div class="ai-template-grid" id="aiTemplateGrid">
                <!-- 1. 盛唐汉服 -->
                <div class="ai-template-card active" data-id="hanfu_female_01" data-category="hanfu" data-title="盛唐绮梦 · 汉服仙子" data-image="resources/img/templates_ai/hanfu_female_01.jpg">
                    <div class="ai-tpl-badge">人气推荐</div>
                    <div class="ai-tpl-thumb-wrap">
                        <img class="ai-tpl-thumb" src="resources/img/templates_ai/hanfu_female_01.jpg" alt="盛唐绮梦 · 汉服仙子" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ai-tpl-preview ai-tpl-preview--hanfu1" style="display: none;">
                            <i class="fa fa-fan"></i>
                            <span class="ai-tpl-preview-tag">盛唐华服</span>
                        </div>
                    </div>
                    <div class="ai-tpl-info">
                        <div class="ai-tpl-name">盛唐绮梦 · 汉服仙子</div>
                        <div class="ai-tpl-tags"><span>女性</span><span>华丽刺绣</span></div>
                    </div>
                    <div class="ai-tpl-selected-check"><i class="fa fa-circle-check"></i></div>
                </div>

                <!-- 2. 古风书生 -->
                <div class="ai-template-card" data-id="hanfu_male_01" data-category="hanfu" data-title="青衫折扇 · 古风书生" data-image="resources/img/templates_ai/hanfu_male_01.jpg">
                    <div class="ai-tpl-thumb-wrap">
                        <img class="ai-tpl-thumb" src="resources/img/templates_ai/hanfu_male_01.jpg" alt="青衫折扇 · 古风书生" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ai-tpl-preview ai-tpl-preview--hanfu2" style="display: none;">
                            <i class="fa fa-feather-pointed"></i>
                            <span class="ai-tpl-preview-tag">儒雅古韵</span>
                        </div>
                    </div>
                    <div class="ai-tpl-info">
                        <div class="ai-tpl-name">青衫折扇 · 古风书生</div>
                        <div class="ai-tpl-tags"><span>男性</span><span>儒雅文质</span></div>
                    </div>
                    <div class="ai-tpl-selected-check"><i class="fa fa-circle-check"></i></div>
                </div>

                <!-- 3. 量子机甲 -->
                <div class="ai-template-card" data-id="mecha_01" data-category="cyberpunk" data-title="未来战警 · 量子机甲" data-image="resources/img/templates_ai/mecha_01.jpg">
                    <div class="ai-tpl-badge ai-tpl-badge--cyan">酷炫机甲</div>
                    <div class="ai-tpl-thumb-wrap">
                        <img class="ai-tpl-thumb" src="resources/img/templates_ai/mecha_01.jpg" alt="未来战警 · 量子机甲" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ai-tpl-preview ai-tpl-preview--mecha" style="display: none;">
                            <i class="fa fa-robot"></i>
                            <span class="ai-tpl-preview-tag">重装科技</span>
                        </div>
                    </div>
                    <div class="ai-tpl-info">
                        <div class="ai-tpl-name">未来战警 · 量子机甲</div>
                        <div class="ai-tpl-tags"><span>通用</span><span>重型机甲</span></div>
                    </div>
                    <div class="ai-tpl-selected-check"><i class="fa fa-circle-check"></i></div>
                </div>

                <!-- 4. 赛博黑客 -->
                <div class="ai-template-card" data-id="cyber_01" data-category="cyberpunk" data-title="霓虹夜市 · 赛博黑客" data-image="resources/img/templates_ai/cyber_01.jpg">
                    <div class="ai-tpl-thumb-wrap">
                        <img class="ai-tpl-thumb" src="resources/img/templates_ai/cyber_01.jpg" alt="霓虹夜市 · 赛博黑客" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ai-tpl-preview ai-tpl-preview--cyber" style="display: none;">
                            <i class="fa fa-microchip"></i>
                            <span class="ai-tpl-preview-tag">赛博光影</span>
                        </div>
                    </div>
                    <div class="ai-tpl-info">
                        <div class="ai-tpl-name">霓虹夜市 · 赛博黑客</div>
                        <div class="ai-tpl-tags"><span>通用</span><span>霓虹夜色</span></div>
                    </div>
                    <div class="ai-tpl-selected-check"><i class="fa fa-circle-check"></i></div>
                </div>

                <!-- 5. 港风胶片 -->
                <div class="ai-template-card" data-id="vintage_01" data-category="vintage" data-title="旺角雨夜 · 港风胶片" data-image="resources/img/templates_ai/vintage_01.jpg">
                    <div class="ai-tpl-thumb-wrap">
                        <img class="ai-tpl-thumb" src="resources/img/templates_ai/vintage_01.jpg" alt="旺角雨夜 · 港风胶片" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ai-tpl-preview ai-tpl-preview--vintage" style="display: none;">
                            <i class="fa fa-film"></i>
                            <span class="ai-tpl-preview-tag">复古光影</span>
                        </div>
                    </div>
                    <div class="ai-tpl-info">
                        <div class="ai-tpl-name">旺角雨夜 · 港风胶片</div>
                        <div class="ai-tpl-tags"><span>通用</span><span>浓郁胶片</span></div>
                    </div>
                    <div class="ai-tpl-selected-check"><i class="fa fa-circle-check"></i></div>
                </div>

                <!-- 6. 商务形象 -->
                <div class="ai-template-card" data-id="business_01" data-category="business" data-title="精英名片 · 高管肖像" data-image="resources/img/templates_ai/business_01.jpg">
                    <div class="ai-tpl-thumb-wrap">
                        <img class="ai-tpl-thumb" src="resources/img/templates_ai/business_01.jpg" alt="精英名片 · 高管肖像" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ai-tpl-preview ai-tpl-preview--business" style="display: none;">
                            <i class="fa fa-user-tie"></i>
                            <span class="ai-tpl-preview-tag">高级棚拍</span>
                        </div>
                    </div>
                    <div class="ai-tpl-info">
                        <div class="ai-tpl-name">精英名片 · 高管肖像</div>
                        <div class="ai-tpl-tags"><span>通用</span><span>棚拍影棚</span></div>
                    </div>
                    <div class="ai-tpl-selected-check"><i class="fa fa-circle-check"></i></div>
                </div>
            </div>

            <!-- 底部确认栏 -->
            <div class="ai-template-footer">
                <div class="ai-selected-preview-wrap">
                    <img id="aiCurrentTemplateThumb" class="ai-selected-mini-thumb" src="resources/img/templates_ai/hanfu_female_01.jpg" alt="已选模板" onerror="this.style.display='none';">
                    <div class="ai-selected-preview-text">
                        <div>已选模板：<strong id="aiCurrentTemplateName">盛唐绮梦 · 汉服仙子</strong></div>
                        <span class="ai-hint-tag"><i class="fa fa-circle-info"></i> 建议拍照时正视镜头、面部无大面积遮挡</span>
                    </div>
                </div>
                <div class="ai-footer-buttons">
                    <button type="button" id="btnAiTemplateBack" class="ai-btn ai-btn--cancel">
                        <i class="fa fa-arrow-left"></i> 返回选择模式
                    </button>
                    <button type="button" id="btnAiTemplateConfirm" class="ai-btn ai-btn--primary">
                        <i class="fa fa-camera"></i> 确认模板并去拍照
                    </button>
                </div>
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
