/* eslint n/no-unsupported-features/node-builtins: "off" */
/* globals initPhotoSwipeFromDOM initRemoteBuzzerFromDOM processChromaImage remoteBuzzerClient rotaryController globalGalleryHandle photoboothTools photoboothPreview virtualKeyboard csrf */

/* global createScreensaver */
const photoBooth = (function () {
    const PhotoStyle = {
            PHOTO: 'photo',
            COLLAGE: 'collage',
            CHROMA: 'chroma',
            VIDEO: 'video',
            CUSTOM: 'custom'
        },
        CameraDisplayMode = {
            INIT: 1,
            BACKGROUND: 2,
            COUNTDOWN: 3,
            TEST: 4
        },
        PreviewMode = {
            NONE: 'none',
            DEVICE: 'device_cam',
            URL: 'url'
        },
        PreviewStyle = {
            FILL: 'fill',
            CONTAIN: 'contain',
            COVER: 'cover',
            NONE: 'none',
            SCALE_DOWN: 'scale-down'
        },
        CollageFrameMode = {
            OFF: 'off',
            ALWAYS: 'always',
            ONCE: 'once'
        };

    const api = {},
        startPage = $('.stage[data-stage="start"]'),
        loader = $('.stage[data-stage="loader"]'),
        loaderButtonBar = loader.find('.buttonbar'),
        loaderMessage = loader.find('.stage-message'),
        loaderImage = loader.find('.stage-image'),
        resultPage = $('.stage[data-stage="result"]'),
        studioPage = $('.stage[data-stage="studio"]'),
        screensaverOverlay = $('#screensaver-overlay'),
        screensaverVideo = $('#screensaver-video'),
        screensaverImage = $('#screensaver-image'),
        screensaverTextTop = $('#screensaver-text-top'),
        screensaverTextCenter = $('#screensaver-text-center'),
        screensaverTextBottom = $('#screensaver-text-bottom'),
        previewIpcam = $('#preview--ipcam'),
        previewVideo = $('#preview--video'),
        previewFramePicture = $('#previewframe--picture'),
        videoBackground = $('#video-background'),
        videoSensor = $('#video--sensor'),
        buttonDelete = $('[data-command="deletebtn"]'),
        buttonPrint = $('[data-command="printbtn"]'),
        gallery = $('#gallery'),
        filternav = $('#filternav'),
        galimages = $('#galimages'),
        videoAnimation = $('#videoAnimation'),
        resultVideo = $('#resultVideo'),
        resultVideoQR = $('#resultVideoQR'),
        usesBackgroundPreview =
            config.preview.asBackground &&
            config.preview.mode === PreviewMode.DEVICE.valueOf() &&
            ((config.commands.preview && !config.preview.bsm) || !config.commands.preview),
        timeToLive = parseInt(config.picture.time_to_live, 10) * 1000,
        retryTimeout = config.picture.retry_timeout * 1000,
        notificationTimeout = config.ui.notification_timeout * 1000,
        screensaverMode = config.screensaver.mode,
        screensaverEnabled =
            config.screensaver.enabled &&
            config.screensaver.timeout_minutes > 0 &&
            (screensaverMode === 'gallery' ||
                screensaverMode === 'folder' ||
                (screensaverMode === 'video' ? !!config.screensaver.video_source : !!config.screensaver.image_source)),
        screensaverTimeoutMs = (config.screensaver.timeout_minutes || 0) * 60000,
        screensaverSwitchMs = (config.screensaver.switch_seconds || 60) * 1000,
        urlSafe = (src) => (src ? encodeURI(src) : '');

    let timeOut,
        chromaFile = '',
        imgFilter = config.filters.defaults,
        isProcessingEffects = false,
        command,
        startTime,
        endTime,
        totalTime;

    api.takingPic = false;
    api.chromaimage = '';
    api.filename = '';
    api.photoStyle = '';

    api.isTimeOutPending = function () {
        return typeof timeOut !== 'undefined';
    };

    api.clearTimeOut = function () {
        clearTimeout(timeOut);
        photoboothTools.console.log('Timeout for auto reload cleared via clearTimeOut.');
    };

    api.resetTimeOut = function () {
        if (timeToLive === 0) {
            return;
        }
        clearTimeout(timeOut);

        photoboothTools.console.log('Timeout for auto reload cleared.');

        if (!api.takingPic) {
            photoboothTools.console.logDev('Timeout for auto reload set to ' + timeToLive + ' milliseconds.');
            timeOut = setTimeout(function () {
                photoboothTools.reloadPage();
            }, timeToLive);
        }
    };

    api.reset = function () {
        loader.css('--stage-background', 'var(--background-countdown-color)');
        loader.removeClass('stage--active');
        loaderButtonBar.empty();
        loaderMessage.empty();
        loaderMessage.removeClass('stage-message--error');
        resultPage.removeAttr('style data-img');
        resultPage.removeClass('stage--active');
        studioPage.removeClass('stage--active');
        $('body').removeClass('mode--studio');
        gallery.removeClass('gallery--open');
        gallery.find('.gallery__inner').hide();
        previewVideo.hide();
        previewFramePicture.hide();
        previewVideo.css('z-index', 0);
        videoSensor.hide();
        previewIpcam.hide();

        photoboothTools.overlay.close();
        photoboothTools.modal.close();

        if (typeof window.rembgReset === 'function') {
            window.rembgReset();
        } else {
            $('#rembgModal').removeClass('active sidenav--open').hide();
            $('#stageCutoutViewport').hide();
            $('#stagePersonTransformBox, #stagePersonResizerBar, #stageTransformBox, #stageBgResizerBar').hide();
            resultPage.removeClass('cutout-mode-active').removeAttr('data-original-img');
        }

        if (typeof window.beautyReset === 'function') {
            window.beautyReset();
        } else {
            $('#beautyModal').removeClass('active sidenav--open').hide();
        }

        window.burstModeActive = false;
        $('#aiTemplateModal').hide();
        $('#aiPoseGuide').hide();
        $('#aiShuttleOverlay').hide();
        $('#aiResultControlBar').hide();
        $('#burstWorkbenchModal').hide();
    };

    api.init = function () {
        api.reset();
        startPage.addClass('stage--active');
        if (usesBackgroundPreview) {
            photoboothPreview.startVideo(CameraDisplayMode.BACKGROUND);
            photoboothTools.console.logDev('Preview: core: start video (BACKGROUND) from api.init.');
        } else if (config.commands.preview && !config.preview.bsm) {
            photoboothTools.console.logDev('Preview: core: start video (INIT) from api.init.');
            photoboothPreview.startVideo(CameraDisplayMode.INIT);
        }

        initRemoteBuzzerFromDOM();
        rotaryController.focusSet(startPage);

        initPhotoSwipeFromDOM('#galimages');

        api.screensaver.resetTimer();

        initQuickSettings();

        const params = new URLSearchParams(window.location.search);
        if (params.has('screensaverPreview')) {
            api.screensaver.show(true);
        }
    };

    api.screensaver = createScreensaver({
        config,
        environment,
        startPage,
        overlay: screensaverOverlay,
        videoEl: screensaverVideo,
        imageEl: screensaverImage,
        textTop: screensaverTextTop,
        textCenter: screensaverTextCenter,
        textBottom: screensaverTextBottom,
        screensaverEnabled,
        screensaverMode,
        screensaverTimeoutMs,
        screensaverSwitchMs,
        urlSafe,
        photoboothTools
    });

    const initQuickSettings = function () {
        const modal = $('#quickSettingsModal');
        if (!modal.length) return;

        const btnOpen = $('#btnQuickSettings');
        const btnClose = $('#btnQuickSettingsClose, #btnQuickSettingsDone, #quickSettingsBackdrop');
        const selectCamera = $('#settingCameraSelect');
        const btnRefresh = $('#btnRefreshCameras');
        const hintText = $('#settingCameraHint');
        const miniVideo = document.getElementById('settingCameraMiniVideo');
        const placeholder = $('.settings-camera-preview-placeholder');

        // 同步活动视频流到设置面板的迷你取景框
        function syncMiniVideo() {
            if (miniVideo && window.photoboothPreview && window.photoboothPreview.stream) {
                try {
                    miniVideo.srcObject = window.photoboothPreview.stream;
                    $(miniVideo).show();
                    placeholder.hide();
                } catch (e) {
                    photoboothTools.console.log('Error attaching stream to mini preview: ', e);
                }
            }
        }

        // 1. 加载与刷新摄像头设备列表
        function refreshCameraList() {
            selectCamera.prop('disabled', true);
            selectCamera.empty().append($('<option>').val('').text('正在检测可用摄像头...'));
            hintText.html('<i class="fa fa-spinner fa-spin"></i> 正在读取系统摄像头设备...');

            if (!window.photoboothPreview || typeof window.photoboothPreview.getAvailableCameras !== 'function') {
                selectCamera.empty().append($('<option>').val('').text('暂不支持检测摄像头'));
                hintText.html('<i class="fa fa-triangle-exclamation"></i> 预览模块未就绪');
                selectCamera.prop('disabled', false);
                return;
            }

            window.photoboothPreview.getAvailableCameras(function (cameras) {
                selectCamera.prop('disabled', false);
                if (!cameras || !cameras.length) {
                    selectCamera.empty().append($('<option>').val('').text('未检测到可用摄像头'));
                    hintText.html('<i class="fa fa-triangle-exclamation" style="color: #ef4444;"></i> 未检测到视频输入设备，请检查摄像头连接');
                    return;
                }

                const pref = (window.photoboothPreview.getPreferredCamera && window.photoboothPreview.getPreferredCamera()) || {
                    id: localStorage.getItem('photobooth_preferred_camera_id') || localStorage.getItem('photobooth_preferred_camera') || '',
                    label: localStorage.getItem('photobooth_preferred_camera_label') || ''
                };

                selectCamera.empty();
                let matchedIndex = -1;

                cameras.forEach(function (cam, index) {
                    const label = cam.label || ('摄像头 ' + (index + 1));
                    const opt = $('<option>').val(cam.deviceId).text(label).data('label', label);

                    // 优先按 ID 精确匹配，若 ID 不符则按设备名称模糊匹配
                    if (pref.id && cam.deviceId === pref.id) {
                        matchedIndex = index;
                    } else if (matchedIndex === -1 && pref.label && label.toLowerCase().indexOf(pref.label.toLowerCase()) !== -1) {
                        matchedIndex = index;
                    }
                    selectCamera.append(opt);
                });

                if (matchedIndex >= 0) {
                    selectCamera.val(cameras[matchedIndex].deviceId);
                } else if (cameras.length > 0) {
                    selectCamera.val(cameras[0].deviceId);
                }

                syncMiniVideo();
                hintText.html('<i class="fa fa-circle-check" style="color: #10b981;"></i> 共检测到 ' + cameras.length + ' 个摄像头设备');
            });
        }

        // 2. 切换摄像头
        selectCamera.on('change', function () {
            const selectedId = $(this).val();
            const selectedLabel = $(this).find('option:selected').data('label') || $(this).find('option:selected').text();
            if (!selectedId) return;

            hintText.html('<i class="fa fa-spinner fa-spin"></i> 正在切换至 [' + selectedLabel + ']...');
            selectCamera.prop('disabled', true);

            if (window.photoboothPreview && typeof window.photoboothPreview.switchCamera === 'function') {
                window.photoboothPreview.switchCamera(selectedId, selectedLabel, function (success) {
                    selectCamera.prop('disabled', false);
                    if (success) {
                        syncMiniVideo();
                        hintText.html('<i class="fa fa-circle-check" style="color: #10b981;"></i> 已切换为 [' + selectedLabel + ']');
                    } else {
                        hintText.html('<i class="fa fa-circle-exclamation" style="color: #ef4444;"></i> 切换受限，已锁定配置并重试连接');
                    }
                });
            }
        });

        btnRefresh.on('click', function (e) {
            e.preventDefault();
            refreshCameraList();
        });

        // 4. AI 抠图计算设备 (GPU / CPU) 与核心数设置 (即时生效)
        const btnDeviceGpu = $('#btnDeviceGpu');
        const btnDeviceCpu = $('#btnDeviceCpu');
        const gpuInfoBox = $('#settingsGpuInfoBox');
        const cpuBox = $('#settingsCpuBox');
        const gpuNameEl = $('#settingsGpuName');
        const selectCpu = $('#settingCpuThreadsSelect');
        const cpuHint = $('#settingCpuThreadsHint');

        function loadDeviceConfig() {
            if (!btnDeviceGpu.length && !selectCpu.length) return;
            $.ajax({
                url: 'api/rembgCpuConfig.php',
                type: 'GET',
                dataType: 'json',
                cache: false,
                success: function (res) {
                    if (res && res.success) {
                        const isGpu = (res.gpu_mode === 'gpu');
                        if (isGpu) {
                            btnDeviceGpu.addClass('active');
                            btnDeviceCpu.removeClass('active');
                            gpuInfoBox.show();
                            cpuBox.hide();
                        } else {
                            btnDeviceCpu.addClass('active');
                            btnDeviceGpu.removeClass('active');
                            gpuInfoBox.hide();
                            cpuBox.show();
                        }
                        if (res.gpu_name) {
                            gpuNameEl.text('已绑定独立显卡：' + res.gpu_name);
                        }
                        const threads = res.live_threads || res.threads || 8;
                        selectCpu.val(String(threads));
                        cpuHint.html('<i class="fa fa-info-circle"></i> 纯 CPU 多核推理模式 · ' + threads + ' 核心并行计算');
                    }
                },
                error: function () {
                    const fallbackThreads = (config.rembg && config.rembg.cpu_threads) ? config.rembg.cpu_threads : 8;
                    selectCpu.val(String(fallbackThreads));
                }
            });
        }

        if (btnDeviceGpu.length) {
            btnDeviceGpu.on('click', function () {
                if ($(this).hasClass('active')) return;
                btnDeviceGpu.addClass('active');
                btnDeviceCpu.removeClass('active');
                gpuInfoBox.stop(true, true).slideDown(150);
                cpuBox.stop(true, true).slideUp(150);

                $.ajax({
                    url: 'api/rembgCpuConfig.php',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ gpu_mode: 'gpu' }),
                    dataType: 'json',
                    success: function (res) {
                        if (res && res.success) {
                            if (config.rembg) config.rembg.gpu_mode = 'gpu';
                        }
                    }
                });
            });

            btnDeviceCpu.on('click', function () {
                if ($(this).hasClass('active')) return;
                btnDeviceCpu.addClass('active');
                btnDeviceGpu.removeClass('active');
                gpuInfoBox.stop(true, true).slideUp(150);
                cpuBox.stop(true, true).slideDown(150);

                const currentThreads = parseInt(selectCpu.val(), 10) || 8;
                $.ajax({
                    url: 'api/rembgCpuConfig.php',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ gpu_mode: 'cpu', threads: currentThreads }),
                    dataType: 'json',
                    success: function (res) {
                        if (res && res.success) {
                            if (config.rembg) {
                                config.rembg.gpu_mode = 'cpu';
                                config.rembg.cpu_threads = currentThreads;
                            }
                        }
                    }
                });
            });
        }

        if (selectCpu.length) {
            loadDeviceConfig();
            selectCpu.on('change', function () {
                const newThreads = parseInt($(this).val(), 10) || 8;
                cpuHint.html('<i class="fa fa-spinner fa-spin"></i> 正在即时应用核心配置...');
                selectCpu.prop('disabled', true);

                $.ajax({
                    url: 'api/rembgCpuConfig.php',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ gpu_mode: 'cpu', threads: newThreads }),
                    dataType: 'json',
                    success: function (res) {
                        selectCpu.prop('disabled', false);
                        if (res && res.success) {
                            if (config.rembg) {
                                config.rembg.cpu_threads = newThreads;
                            }
                            cpuHint.html('<i class="fa fa-circle-check" style="color: #10b981; font-weight: bold;"></i> ' + (res.message || ('已即时生效为 ' + newThreads + ' 核心并行计算')));
                        } else {
                            cpuHint.html('<i class="fa fa-circle-exclamation" style="color: #ef4444;"></i> 设置失败：' + (res.error || '未知错误'));
                        }
                    },
                    error: function () {
                        selectCpu.prop('disabled', false);
                        cpuHint.html('<i class="fa fa-circle-exclamation" style="color: #ef4444;"></i> 网络请求失败，请检查服务状态');
                    }
                });
            });
        }

        // 5. 打开 / 关闭模态框
        function openModal() {
            modal.fadeIn(180).attr('aria-hidden', 'false');
            if (window.photoboothPreview && !window.photoboothPreview.stream && typeof window.photoboothPreview.initializeMedia === 'function') {
                window.photoboothPreview.initializeMedia(function () {
                    syncMiniVideo();
                });
            } else {
                syncMiniVideo();
            }
            refreshCameraList();
            loadDeviceConfig();
        }

        function closeModal() {
            modal.fadeOut(150).attr('aria-hidden', 'true');
        }

        btnOpen.on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openModal();
        });

        btnClose.on('click', function (e) {
            e.preventDefault();
            closeModal();
        });

        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && modal.is(':visible')) {
                closeModal();
            }
        });
    };

    const updateFilterPreviews = function () {
        if (!resultPage.attr('data-original-img')) {
            resultPage.attr('data-original-img', resultPage.attr('data-img'));
        }
        const baseFile = resultPage.attr('data-original-img') || resultPage.attr('data-img') || api.filename;
        if (!baseFile || baseFile === 'undefined') return;
        const imagesFolder = (typeof environment !== 'undefined' && environment.publicFolders && environment.publicFolders.images)
            ? environment.publicFolders.images
            : '/data/images';
        const imgUrl = imagesFolder + '/' + baseFile + '?v=' + Date.now();
        $('.filter-preview-img').each(function () {
            if ($(this).attr('src') !== imgUrl) {
                $(this).attr('src', imgUrl);
            }
        });
    };

    api.navbar = {
        open: function () {
            if ($('#rembgModal').hasClass('sidenav--open')) {
                $('#rembgModal').removeClass('active sidenav--open').hide();
            }
            if ($('#beautyModal').hasClass('sidenav--open')) {
                $('#beautyModal').removeClass('active sidenav--open').hide();
            }
            updateFilterPreviews();
            filternav.addClass('sidenav--open');
            rotaryController.focusSet(filternav);
        },
        close: function () {
            filternav.removeClass('sidenav--open');
        },
        toggle: function () {
            if (!filternav.hasClass('sidenav--open')) {
                if ($('#rembgModal').hasClass('sidenav--open')) {
                    $('#rembgModal').removeClass('active sidenav--open').hide();
                }
                if ($('#beautyModal').hasClass('sidenav--open')) {
                    $('#beautyModal').removeClass('active sidenav--open').hide();
                }
                updateFilterPreviews();
            }
            filternav.toggleClass('sidenav--open');

            if (filternav.hasClass('sidenav--open')) {
                rotaryController.focusSet(filternav);
            }
        }
    };

    const setFiltersEnabled = (enabled) => {
        isProcessingEffects = !enabled;
        filternav.css('pointer-events', enabled ? '' : 'none');
        filternav.toggleClass('filters--disabled', !enabled);
    };

    api.stopPreviewAndCaptureFromVideo = () => {
        if (config.preview.camTakesPic) {
            const vid = previewVideo.get(0);
            const canvas = videoSensor.get(0);
            if (vid && vid.videoWidth > 0 && vid.videoHeight > 0) {
                canvas.width = vid.videoWidth;
                canvas.height = vid.videoHeight;
                canvas.getContext('2d').drawImage(vid, 0, 0);
            } else if (canvas && (canvas.width <= 0 || canvas.height <= 0)) {
                canvas.width = 1280;
                canvas.height = 720;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(0, 0, 1280, 720);
            }
        }
        if (!config.commands.preview_kill || config.preview.camTakesPic) {
            photoboothTools.console.logDev('Preview: core: stopping preview from stopPreviewAndCaptureFromVideo.');
            photoboothPreview.stopPreview();
        }
    };

    api.countdown = {
        element: null,
        audioElement: null,
        create: () => {
            if (api.countdown.element === null) {
                const element = document.createElement('div');
                element.classList.add('countdown');
                document.body.append(element);
                api.countdown.element = element;
            }

            if (api.countdown.audioElement === null) {
                const audioElement = document.createElement('audio');
                document.body.append(audioElement);
                api.countdown.audioElement = audioElement;
            }
        },
        destroy: () => {
            if (api.countdown.element !== null) {
                api.countdown.element.remove();
                api.countdown.element = null;
            }
            if (api.countdown.audioElement !== null) {
                api.countdown.audioElement.remove();
                api.countdown.audioElement = null;
            }
        },
        start: (seconds) => {
            photoboothTools.console.log('Countdown started. Set to ' + seconds + ' seconds.');
            api.countdown.create();

            return new Promise((resolve) => {
                const stop =
                    parseInt(config.preview.stop_time, 10) > seconds ? 0 : parseInt(config.preview.stop_time, 10);
                photoboothTools.console.logDev('Preview: core: stop at ' + stop);
                const startTime = performance.now();
                const targetTime = startTime + seconds * 1000;
                let lastSecondShown = null;

                const tick = () => {
                    const now = performance.now();
                    const remainingSeconds = Math.ceil((targetTime - now) / 1000);

                    // Only update when we moved to the next integer second
                    if (remainingSeconds !== lastSecondShown) {
                        lastSecondShown = remainingSeconds;
                        photoboothTools.console.logDev('Preview: core: countdown seconds ' + remainingSeconds);
                        api.countdown.element.innerHTML = '';
                        if (remainingSeconds > 0) {
                            // dont show the 0 as countdown number
                            const numberElement = document.createElement('div');
                            numberElement.classList.add('countdown-number');
                            numberElement.textContent = Number(remainingSeconds).toString();
                            api.countdown.element.appendChild(numberElement);
                        }
                        if (config.sound.enabled && config.sound.countdown_enabled) {
                            const soundfile = photoboothTools.getSound(
                                'counter-' + Number(remainingSeconds).toString()
                            );
                            if (soundfile !== null) {
                                api.countdown.audioElement.src = soundfile;
                                api.countdown.audioElement.play().catch((error) => {
                                    photoboothTools.console.log('Error with audio.play: ' + error);
                                });
                            }
                        }

                        // stop second hit
                        if (remainingSeconds === stop && !config.preview.camTakesPic) {
                            photoboothTools.console.logDev('Preview: core: stopping preview at countdown.');
                            photoboothPreview.stopPreview();
                        }

                        // after 1 is faded out, on second 0
                        if (remainingSeconds <= 0) {
                            photoboothTools.console.log('Countdown finished.');
                            api.countdown.destroy();
                            resolve();

                            return;
                        }
                    }

                    if (remainingSeconds > 0) {
                        if (typeof window.requestAnimationFrame === 'function') {
                            window.requestAnimationFrame(tick);
                        } else {
                            setTimeout(tick, 50);
                        }
                    }
                };

                tick();
            });
        }
    };

    api.cheese = {
        element: null,
        audioElement: null,
        create: () => {
            if (api.cheese.audioElement === null) {
                const audioElement = document.createElement('audio');
                document.body.append(audioElement);
                api.cheese.audioElement = audioElement;
            }

            if (api.cheese.element === null) {
                const element = document.createElement('div');
                element.classList.add('cheese');

                if (config.ui.shutter_cheese_img != null && config.ui.shutter_cheese_img !== '') {
                    const image = document.createElement('img');
                    image.src = config.ui.shutter_cheese_img;
                    const imageElement = document.createElement('div');
                    imageElement.classList.add('cheese-image');
                    imageElement.appendChild(image);
                    element.appendChild(imageElement);
                } else if (api.photoStyle === PhotoStyle.VIDEO) {
                    const labelElement = document.createElement('div');
                    labelElement.classList.add('cheese-label');
                    labelElement.textContent = config.video.cheese;
                    element.appendChild(labelElement);
                } else {
                    const labelElement = document.createElement('div');
                    labelElement.classList.add('cheese-label');
                    labelElement.textContent = photoboothTools.getTranslation('cheese');
                    element.appendChild(labelElement);
                }

                document.body.append(element);
                api.cheese.element = element;
            }
        },
        destroy: () => {
            if (api.cheese.audioElement !== null) {
                api.cheese.audioElement.remove();
                api.cheese.audioElement = null;
            }
            if (api.cheese.element !== null) {
                api.cheese.element.remove();
                api.cheese.element = null;
            }
        },
        start: () => {
            photoboothTools.console.log('Cheese: Start');
            api.cheese.create();

            return new Promise((resolve) => {
                if (config.sound.enabled && config.sound.cheese_enabled) {
                    const soundfile = photoboothTools.getSound('cheese');
                    if (soundfile !== null) {
                        api.cheese.audioElement.src = soundfile;
                        api.cheese.audioElement.play().catch((error) => {
                            photoboothTools.console.log('Error with audio.play: ' + error);
                        });
                    }
                }
                setTimeout(() => {
                    photoboothTools.console.log('Cheese: End');
                    resolve();
                }, config.picture.cheese_time);
            });
        }
    };

    api.shutter = {
        element: null,
        create: () => {
            if (api.shutter.element === null) {
                const flash = document.createElement('div');
                flash.classList.add('shutter-flash');
                const aperture = document.createElement('div');
                aperture.classList.add('shutter-aperture');
                const element = document.createElement('div');
                element.classList.add('shutter');
                element.appendChild(flash);
                element.appendChild(aperture);
                document.body.append(element);
                api.shutter.element = element;
            }
        },
        destroy: () => {
            if (api.shutter.element !== null) {
                api.shutter.element.remove();
                api.shutter.element = null;
            }
        },
        start: () => {
            api.shutter.create();

            return new Promise((resolve) => {
                photoboothTools.console.log('Shutter: Start');
                const flash = api.shutter.element.querySelector('.shutter-flash');
                flash.style.transition = 'opacity 0.5s';
                const flashAnimation = flash.animate([{}, { opacity: 1 }], {
                    duration: 500,
                    fill: 'forwards'
                });
                flashAnimation.onfinish = () => {
                    resolve();
                };
            });
        },
        stop: () => {
            api.shutter.create();

            return new Promise((resolve) => {
                photoboothTools.console.log('Shutter: Stop');
                const aperture = api.shutter.element.querySelector('.shutter-aperture');
                aperture.style.transition = 'width 0.5s, padding-bottom 0.5s';
                const apertureAnimation = aperture.animate(
                    [
                        {},
                        {
                            width: 0,
                            paddingBottom: 0
                        }
                    ],
                    {
                        duration: 500,
                        fill: 'forwards'
                    }
                );
                apertureAnimation.onfinish = () => {
                    api.shutter.destroy();
                    resolve();
                };
            });
        }
    };

    api.clearLoaderImage = () => {
        loaderImage.css({ display: 'none', 'background-image': '' });
        loaderImage.removeAttr('data-img');
    };

    api.shellCommand = function (cmd, file = '') {
        command = {
            mode: cmd,
            filename: file
        };
        photoboothTools.console.log('Run', cmd);

        photoboothTools
            .ajaxWithCsrf({
                url: environment.publicFolders.api + '/shellCommand.php',
                method: 'POST',
                data: command
            })
            .done(function (result) {
                photoboothTools.console.log(cmd, 'result: ', result);
            })
            .fail(function (xhr, status, errorThrown) {
                if (photoboothTools.isCsrfErrorResponse(xhr)) {
                    photoboothTools.handleCsrfMismatch(environment.publicFolders.api + '/shellCommand.php');
                    return;
                }
                photoboothTools.console.log(cmd, 'result: ', errorThrown);
            });
    };

    api.thrill = async (photoStyle, retry = 0) => {
        if (api.takingPic) {
            photoboothTools.console.logDev('ERROR: Taking picture in progress already!');

            return;
        }

        if (config.selfie_mode) {
            photoboothTools.console.logDev('ERROR: Taking picture unsupported on selfie mode!');

            return;
        }

        const savedMode = window.photoboothMode || 'classic';
        window.sessionPhotoboothMode = savedMode;

        try {
            api.navbar.close();
            api.reset();
            window.photoboothMode = savedMode;
            api.closeGallery();
            api.clearLoaderImage();

            remoteBuzzerClient.inProgress(photoStyle);
            api.takingPic = true;
            photoboothTools.console.logDev('Taking picture in progress: ' + api.takingPic);

            if (api.isTimeOutPending()) {
                api.resetTimeOut();
            }

            if (config.commands.pre_photo) {
                api.shellCommand('pre-command');
            }

            if (window.photoboothMode === 'classic' || window.photoboothMode === 'ai_swap' || window.sessionPhotoboothMode === 'classic' || window.sessionPhotoboothMode === 'ai_swap') {
                chromaFile = null;
                photoStyle = PhotoStyle.PHOTO;
            } else if (chromaFile) {
                photoStyle = PhotoStyle.CHROMA;
            }
            api.photoStyle = photoStyle;
            photoboothTools.console.log('PhotoStyle: ' + api.photoStyle);

            // Priority: Explicit Studio countdown select > localStorage > config
            const studioSelectVal = $('#studioCountdownSelect').val();
            const storedCountdown = localStorage.getItem('photobooth_custom_countdown');
            const customSec = parseInt(studioSelectVal || storedCountdown, 10);

            let countdownTime;
            if (customSec && customSec >= 1 && customSec <= 10) {
                countdownTime = customSec;
            } else {
                switch (api.photoStyle) {
                    case PhotoStyle.VIDEO:
                        countdownTime = parseInt(config.video.cntdwn_time, 10) || 3;
                        break;
                    case PhotoStyle.CUSTOM:
                        countdownTime = parseInt(config.custom.cntdwn_time, 10) || 3;
                        break;
                    case PhotoStyle.PHOTO:
                    default:
                        countdownTime = parseInt(config.picture.cntdwn_time, 10) || 3;
                        break;
                }
            }
            photoboothTools.console.log('Resolved countdownTime: ' + countdownTime + ' seconds.');

            let maxGetMediaRetry = Math.max(countdownTime - 1, 0);
            if (config.commands.preview_kill && maxGetMediaRetry > 0) {
                maxGetMediaRetry = Math.max(countdownTime - parseInt(config.preview.stop_time, 10), 0);
            }
            photoboothPreview.startVideo(CameraDisplayMode.COUNTDOWN, retry, maxGetMediaRetry);
            if ((window.sessionPhotoboothMode || window.photoboothMode) === 'ai_swap') {
                $('#aiPoseGuide').fadeIn(200);
            } else {
                $('#aiPoseGuide').hide();
            }

            if (
                config.preview.mode !== PreviewMode.NONE.valueOf() &&
                (config.preview.style === PreviewStyle.CONTAIN.valueOf() ||
                    config.preview.style === PreviewStyle.SCALE_DOWN.valueOf()) &&
                config.preview.showFrame
            ) {
                if (
                    (api.photoStyle === PhotoStyle.PHOTO || api.photoStyle === PhotoStyle.CUSTOM) &&
                    config.picture.take_frame
                ) {
                    previewFramePicture.show();
                }
            }

            videoBackground.hide();
            startPage.removeClass('stage--active');
            loader.addClass('stage--active');
            api.screensaver.hide();

            if (config.get_request.countdown) {
                let getMode;
                switch (api.photoStyle) {
                    case PhotoStyle.VIDEO:
                        getMode = config.get_request.video;
                        break;
                    case PhotoStyle.CUSTOM:
                        getMode = config.get_request.custom;
                        break;
                    case PhotoStyle.PHOTO:
                    default:
                        getMode = config.get_request.picture;
                        break;
                }
                const getUrl = config.get_request.server + '/' + getMode;
                photoboothTools.getRequest(getUrl);
            }

            await api.countdown.start(countdownTime);
            await api.cheese.start();

            if (config.preview.camTakesPic && !photoboothPreview.stream && !config.dev.demo_images) {
                api.errorPic({
                    error: 'No preview by device cam available!'
                });
            } else if (api.photoStyle === PhotoStyle.VIDEO) {
                api.takeVideo(retry);
            } else {
                api.takePic(retry);
            }
        } catch (error) {
            photoboothTools.console.log('thrill: unexpected error:', error);
            api.errorPic({ error: error.message || 'Unexpected error in thrill' });
        }
    };

    api.takeVideo = function (retry) {
        remoteBuzzerClient.inProgress('in-progress');
        const data = {
            style: api.photoStyle
        };
        api.callTakeVideoApi(data, retry);
    };

    api.takePic = function (retry) {
        try {
            remoteBuzzerClient.inProgress('in-progress');

            api.stopPreviewAndCaptureFromVideo();

            let canvasData = '';
            try {
                canvasData = videoSensor.get(0).toDataURL('image/jpeg', 0.95);
            } catch (canvasErr) {
                photoboothTools.console.log('Failed to export canvas dataURL:', canvasErr);
            }

            const data = {
                filter: imgFilter,
                style: api.photoStyle,
                canvasimg: canvasData
            };

            if (api.photoStyle === PhotoStyle.CHROMA) {
                data.file = chromaFile;
            }

            loader.css('--stage-background', 'var(--background-countdown-color)');

            api.callTakePicApi(data, retry);
        } catch (error) {
            photoboothTools.console.log('takePic: unexpected error:', error);
            api.errorPic({ error: error.message || 'Unexpected error in takePic' });
        }
    };

    api.retryTakePic = function (retry) {
        api.takingPic = false;
        retry += 1;
        loaderMessage.text(
            photoboothTools.getTranslation('retry_message') + ' ' + retry + '/' + config.picture.retry_on_error
        );
        photoboothTools.console.logDev('Retry to capture image: ' + retry);
        setTimeout(() => {
            api.thrill(api.photoStyle, retry);
        }, retryTimeout);
    };

    api.callTakePicApi = async (data, retry = 0) => {
        startTime = new Date().getTime();
        if (typeof api.stopFacePoseAlignmentLoop === 'function') {
            api.stopFacePoseAlignmentLoop();
        }
        $('#aiPoseGuide').hide();
        photoboothTools.console.logDev('Capture image.');
        photoboothTools
            .ajaxWithCsrf({
                url: environment.publicFolders.api + '/capture.php',
                method: 'POST',
                data: data,
                timeout: 25000
            })
            .done(async (result) => {
                try {
                    api.cheese.destroy();
                    if (config.ui.shutter_animation) {
                        await api.shutter.start();
                        await api.shutter.stop();
                    }
                    endTime = new Date().getTime();
                    totalTime = endTime - startTime;
                    photoboothTools.console.log('Took ' + data.style, result);
                    imgFilter = config.filters.defaults;
                    const defFilter = (typeof imgFilter === 'object' && imgFilter !== null && imgFilter.value) ? imgFilter.value : imgFilter;
                    $('#filternav .filter-card, #filternav .sidenav-list-item, .filter-card, .sidenav-list-item').removeClass('filter-card--active sidenav-list-item--active focused');
                    $(`#filternav .filter-card[data-filter="${defFilter}"], #filternav .sidenav-list-item[data-filter="${defFilter}"]`).addClass('filter-card--active sidenav-list-item--active');
                    previewFramePicture.hide();
                    if (result.error) {
                        photoboothTools.console.logDev('Error while taking picture.');
                        if (config.picture.retry_on_error > 0 && retry < config.picture.retry_on_error) {
                            api.retryTakePic(retry);
                        } else {
                            api.errorPic(result);
                        }
                    } else if (result.success === PhotoStyle.CHROMA) {
                        chromaFile = result.file;
                        api.processPic(result);
                    } else {
                        api.processPic(result);
                    }
                } catch (error) {
                    photoboothTools.console.log('callTakePicApi.done: unexpected error:', error);
                    api.errorPic({ error: error.message || 'Unexpected error processing capture result' });
                }
            })
            .fail(async (xhr, status, result) => {
                try {
                    if (photoboothTools.isCsrfErrorResponse(xhr)) {
                        photoboothTools.handleCsrfMismatch(environment.publicFolders.api + '/capture.php');
                        return;
                    }
                    endTime = new Date().getTime();
                    totalTime = endTime - startTime;
                    api.cheese.destroy();
                    if (result === null || result === undefined || typeof result === 'string') {
                        result = { error: result || 'Unexpected error: result is null or undefined' };
                    } else if (!result.error) {
                        result.error = 'Unknown error occurred';
                    }
                    photoboothTools.console.log('Took ' + data.style, result);
                    photoboothTools.console.logDev('Failed after ' + totalTime + 'ms');
                    if (config.picture.retry_on_error > 0 && retry < config.picture.retry_on_error) {
                        photoboothTools.console.logDev(
                            'ERROR: Taking picture failed. Retrying. Retry: ' +
                                retry +
                                ' / ' +
                                config.picture.retry_on_error
                        );
                        api.retryTakePic(retry);
                    } else {
                        api.errorPic(result);
                    }
                } catch (error) {
                    photoboothTools.console.log('Unexpected error in .fail block', error);
                    api.errorPic({ error: error.message || 'An unexpected error occurred during failure handling' });
                }
            });
    };

    api.callTakeVideoApi = function (data) {
        if (config.video.animation) {
            videoAnimation.show();
        }
        startTime = new Date().getTime();
        photoboothTools
            .ajaxWithCsrf({
                url: environment.publicFolders.api + '/capture.php',
                method: 'POST',
                data: data,
                timeout: 25000
            })
            .done(async (result) => {
                try {
                    api.cheese.destroy();
                    if (config.video.animation) {
                        videoAnimation.hide();
                    }
                    endTime = new Date().getTime();
                    totalTime = endTime - startTime;
                    photoboothTools.console.log('Took ' + data.style, result);
                    photoboothTools.console.logDev('Taking video took ' + totalTime + 'ms');
                    imgFilter = config.filters.defaults;
                    const defVideoFilter = (typeof imgFilter === 'object' && imgFilter !== null && imgFilter.value) ? imgFilter.value : imgFilter;
                    $('#filternav .filter-card, #filternav .sidenav-list-item, .filter-card, .sidenav-list-item').removeClass('filter-card--active sidenav-list-item--active focused');
                    $(`#filternav .filter-card[data-filter="${defVideoFilter}"], #filternav .sidenav-list-item[data-filter="${defVideoFilter}"]`).addClass('filter-card--active sidenav-list-item--active');

                    if (result.error) {
                        api.errorPic(result);
                    } else {
                        api.processVideo(result);
                    }
                } catch (error) {
                    photoboothTools.console.log('callTakeVideoApi.done: unexpected error:', error);
                    api.errorPic({ error: error.message || 'Unexpected error processing video result' });
                }
            })
            .fail(function (xhr, status, result) {
                try {
                    if (photoboothTools.isCsrfErrorResponse(xhr)) {
                        photoboothTools.handleCsrfMismatch(environment.publicFolders.api + '/capture.php');
                        return;
                    }
                    api.cheese.destroy();
                    if (result === null || result === undefined || typeof result === 'string') {
                        result = { error: result || 'Unexpected error: result is null or undefined' };
                    } else if (!result.error) {
                        result.error = 'Unknown error occurred';
                    }
                    api.errorPic(result);
                } catch (error) {
                    photoboothTools.console.log('Unexpected error in .fail block', error);
                    api.errorPic({ error: error.message || 'An unexpected error occurred during failure handling' });
                }
            });
    };

    api.errorPic = function (data) {
        setTimeout(function () {
            try {
                api.cheese.destroy();
                api.shutter.destroy();
                setFiltersEnabled(true);

                loaderMessage.empty();
                loaderButtonBar.empty();
                previewVideo.hide();
                videoSensor.hide();
                previewFramePicture.hide();
                if (config.video.animation) {
                    videoAnimation.hide();
                }
                loaderMessage.addClass('stage-message--error');
                loaderMessage.append($('<p>').text(photoboothTools.getTranslation('error')));
                photoboothTools.console.log('An error occurred:', data.error);
                if (config.dev.loglevel > 1) {
                    loaderMessage.append($('<p>').text(data.error));
                }
                api.takingPic = false;
                remoteBuzzerClient.inProgress(false);
                photoboothTools.console.logDev('Taking picture in progress: ' + api.takingPic);
            } catch (e) {
                photoboothTools.console.log('errorPic: exception during cleanup:', e);
                api.takingPic = false;
            }

            if (config.dev.reload_on_error) {
                try {
                    loaderMessage.append($('<p>').text(photoboothTools.getTranslation('auto_reload')));
                } catch {
                    // ignore UI update failure
                }
                setTimeout(function () {
                    photoboothTools.reloadPage();
                }, notificationTimeout || 5000);
            } else {
                const reloadButton = $('<button type="button" class="button rotaryfocus">');
                reloadButton.append('<span class="button--icon"><i class="' + config.icons.refresh + '"></i></span>');
                reloadButton.append(
                    '<span class="button--label">' + photoboothTools.getTranslation('reload') + '</span>'
                );
                reloadButton.appendTo(loaderButtonBar).on('click', () => {
                    photoboothTools.reloadPage();
                });
            }
        }, 500);
    };

    api.processPic = function (result) {
        startTime = new Date().getTime();
        loader.addClass('stage--active');
        startPage.removeClass('stage--active');
        resultPage.removeClass('stage--active');
        setFiltersEnabled(false);

        // Stage 4: Burst Shooting Pipeline
        if (window.burstModeActive) {
            setFiltersEnabled(true);
            if (window.burstRetakeIndex >= 0) {
                // Single Retake Mode
                window.burstPhotos[window.burstRetakeIndex] = result.file;
                window.burstRetakeIndex = -1;
                loader.removeClass('stage--active');
                api.renderBurstWorkbench();
                return;
            }

            window.burstPhotos.push(result.file);
            window.burstCurrentShot++;

            if (window.burstCurrentShot < window.burstTotalShots) {
                loaderMessage.html(
                    '<h2 style="font-size:2rem;color:#F472B6;margin-bottom:0.5rem;"><i class="fa fa-camera-retro"></i> 第 ' + window.burstCurrentShot + ' 张已捕捉！</h2>' +
                    '<p style="font-size:1.2rem;color:#FFF;">请变换 Pose，第 ' + (window.burstCurrentShot + 1) + ' 张即将抓拍...</p>'
                );
                setTimeout(() => {
                    api.startBurstShot(window.burstCurrentShot);
                }, 2200);
            } else {
                loader.removeClass('stage--active');
                api.renderBurstWorkbench();
            }
            return;
        }

        // Stage 3.4: Dual Mode Post-Processing Pipeline
        const activeCaptureMode = window.sessionPhotoboothMode || window.photoboothMode || 'classic';

        if (activeCaptureMode === 'ai_swap') {
            $('#aiShuttleOverlay').show();
            $('#aiShuttleProgressBar').css('width', '8%');
            $('#aiShuttlePercent').text('8%');
            const shuttleSteps = [
                { text: '✨ 正在定位面部 5 维几何关键点...', progress: 25 },
                { text: '🧬 正在提取 ArcFace 512维身份特征向量...', progress: 48 },
                { text: '⚡ 正在调用 Inswapper 隐空间重塑华服...', progress: 70 },
                { text: '🎨 正在进行下颌自适应保型与无缝去须融合...', progress: 88 },
                { text: '🌟 GFPGAN 高清纹理重塑，惊艳亮相中...', progress: 96 }
            ];
            let stepIdx = 0;
            let currentPct = 8;
            const tickerTimer = setInterval(() => {
                if (stepIdx < shuttleSteps.length) {
                    const step = shuttleSteps[stepIdx];
                    $('#aiShuttleTicker').html('<span class="ai-ticker-step active">' + step.text + '</span>');
                    currentPct = step.progress;
                    $('#aiShuttleProgressBar').css('width', currentPct + '%');
                    $('#aiShuttlePercent').text(currentPct + '%');
                    stepIdx++;
                } else if (currentPct < 98) {
                    currentPct += 1;
                    $('#aiShuttleProgressBar').css('width', currentPct + '%');
                    $('#aiShuttlePercent').text(currentPct + '%');
                }
            }, 550);

            const tplPath = (window.selectedAiTemplate && window.selectedAiTemplate.path) 
                ? window.selectedAiTemplate.path 
                : ('resources/img/templates_ai/' + (window.selectedAiTemplate ? window.selectedAiTemplate.id : 'hanfu_female_01') + '.jpg');

            photoboothTools
                .ajaxWithCsrf({
                    method: 'POST',
                    url: environment.publicFolders.api + '/faceswapProcess.php',
                    data: {
                        file: result.file,
                        template: tplPath
                    }
                })
                .done((swapData) => {
                    $('#aiShuttleProgressBar').css('width', '100%');
                    $('#aiShuttlePercent').text('100%');
                    setTimeout(() => {
                        clearInterval(tickerTimer);
                        $('#aiShuttleOverlay').hide();
                        setFiltersEnabled(true);
                        if (swapData && swapData.success) {
                            window.lastAiSourceFile = result.file;
                            window.lastAiSwapFile = swapData.file;
                            photoboothTools.console.log('AI Face Swap Success:', swapData);
                            api.renderPic(swapData.file, swapData.images);
                            $('#aiResultControlBar').show();
                            if (window.selectedAiTemplate && window.selectedAiTemplate.title) {
                                $('#aiResultTemplateName').text('变身完成：' + window.selectedAiTemplate.title);
                            }
                        } else {
                            const errMsg = (swapData && swapData.error) ? swapData.error : 'AI 变身换脸处理失败，请重试';
                            photoboothTools.modal.open('error');
                            photoboothTools.modal.empty();
                            photoboothTools.modal.append($('<h3 style="margin-bottom:0.8rem;color:#EF4444;"><i class="fa fa-triangle-exclamation"></i> 变身拍照提示</h3>'));
                            photoboothTools.modal.append($('<p style="font-size:1.1rem;margin-bottom:1.5rem;">').text(errMsg));
                            const retryBtn = $('<button class="button" style="background:#8B5CF6;color:#fff;border-radius:9999px;padding:0.75rem 2rem;font-weight:800;box-shadow:3px 3px 0 #1E293B;">')
                                .text('📸 重新拍摄')
                                .on('click', () => {
                                    photoboothTools.modal.close();
                                    api.thrill(PhotoStyle.PHOTO);
                                });
                            photoboothTools.modal.append(retryBtn);
                        }
                    }, 350);
                })
                .fail((jqXHR, textStatus) => {
                    clearInterval(tickerTimer);
                    $('#aiShuttleOverlay').hide();
                    setFiltersEnabled(true);
                    api.errorPic({
                        error: 'AI 换脸网络请求失败: ' + textStatus
                    });
                });
            return;
        }

        // Classic Photobooth Pipeline: Beauty Retouching + Background Template Matting
        const classicTpl = (window.selectedClassicTemplate && window.selectedClassicTemplate.id && window.selectedClassicTemplate.id !== 'none')
            ? (window.selectedClassicTemplate.image || window.selectedClassicTemplate.path || '')
            : '';
        const bSmooth = (config.beauty && config.beauty.default_smooth !== undefined) ? config.beauty.default_smooth : parseInt($('#studioSmoothSlider').val() || 30, 10);
        const bWhite = (config.beauty && config.beauty.default_white !== undefined) ? config.beauty.default_white : parseInt($('#studioWhiteSlider').val() || 25, 10);
        const bRosy = (config.beauty && config.beauty.default_rosy !== undefined) ? config.beauty.default_rosy : parseInt($('#studioRosySlider').val() || 20, 10);
        const bClarity = (config.beauty && config.beauty.default_clarity !== undefined) ? config.beauty.default_clarity : parseInt($('#studioClaritySlider').val() || 15, 10);
        const bEye = (config.beauty && config.beauty.default_eye !== undefined) ? config.beauty.default_eye : parseInt($('#studioEyeSlider').val() || 15, 10);
        const bSlim = (config.beauty && config.beauty.default_slim !== undefined) ? config.beauty.default_slim : parseInt($('#studioSlimSlider').val() || 15, 10);

        $('#classicLoaderOverlay').show();
        $('#classicProgressBar').css('width', '10%');
        $('#classicProgressPercent').text('10%');
        const classicSteps = classicTpl ? [
            { text: '✨ 正在分析画面构图与人像定位...', progress: 28 },
            { text: '💄 正在执行智能磨皮、晶透美白与元气红润...', progress: 58 },
            { text: '✂️ 正在进行发丝级抠图与柔光背景模板融合...', progress: 86 },
            { text: '📸 正在输出商业级质感大头贴大片...', progress: 96 }
        ] : [
            { text: '✨ 正在分析画面构图与人脸定位...', progress: 35 },
            { text: '💄 正在执行自然磨皮、晶透美白与红润气色...', progress: 75 },
            { text: '📸 正在输出高质感实景自拍大头贴...', progress: 96 }
        ];
        let cStepIdx = 0;
        let cPct = 10;
        const classicTimer = setInterval(() => {
            if (cStepIdx < classicSteps.length) {
                const step = classicSteps[cStepIdx];
                $('#classicLoaderTicker').html('<span class="ai-ticker-step active">' + step.text + '</span>');
                cPct = step.progress;
                $('#classicProgressBar').css('width', cPct + '%');
                $('#classicProgressPercent').text(cPct + '%');
                cStepIdx++;
            } else if (cPct < 98) {
                cPct += 1;
                $('#classicProgressBar').css('width', cPct + '%');
                $('#classicProgressPercent').text(cPct + '%');
            }
        }, 450);

        const applyData = {
            file: result.file,
            filter: imgFilter,
            style: api.photoStyle,
            template: classicTpl,
            smooth: bSmooth,
            white: bWhite,
            rosy: bRosy,
            clarity: bClarity,
            eye: bEye,
            slim: bSlim
        };

        photoboothTools
            .ajaxWithCsrf({
                method: 'POST',
                url: environment.publicFolders.api + '/applyEffects.php',
                data: applyData
            })
            .done((data) => {
                $('#classicProgressBar').css('width', '100%');
                $('#classicProgressPercent').text('100%');
                setTimeout(() => {
                    clearInterval(classicTimer);
                    $('#classicLoaderOverlay').hide();
                    try {
                        setFiltersEnabled(true);
                        photoboothTools.console.log(api.photoStyle + ' processed', data);
                        endTime = new Date().getTime();
                        totalTime = endTime - startTime;
                        photoboothTools.console.logDev(
                            'Processing ' + api.photoStyle + ' took ' + totalTime + 'ms for filter `' + imgFilter + '`'
                        );
                        photoboothTools.console.logDev('Images:', data.images);

                        if (config.get_request.processed) {
                            const getUrl = config.get_request.server + '/' + api.photoStyle;
                            photoboothTools.getRequest(getUrl);
                        }

                        if (data.error) {
                            api.errorPic(data);
                        } else if (api.photoStyle === PhotoStyle.CHROMA && window.photoboothMode !== 'classic' && window.photoboothMode !== 'ai_swap' && window.sessionPhotoboothMode !== 'classic' && window.sessionPhotoboothMode !== 'ai_swap') {
                            api.renderChroma(data.file);
                        } else {
                            api.renderPic(data.file, data.images);
                        }
                    } catch (error) {
                        photoboothTools.console.log('processPic.success: unexpected error:', error);
                        api.errorPic({ error: error.message || 'Unexpected error processing picture' });
                    }
                }, 300);
            })
            .fail((jqXHR, textStatus) => {
                clearInterval(classicTimer);
                $('#classicLoaderOverlay').hide();
                if (photoboothTools.isCsrfErrorResponse(jqXHR)) {
                    photoboothTools.handleCsrfMismatch(environment.publicFolders.api + '/applyEffects.php');
                    return;
                }
                setFiltersEnabled(true);
                api.errorPic({
                    error: '大头贴精修处理网络请求失败: ' + textStatus
                });
            });
    };

    api.processVideo = function (result) {
        startTime = new Date().getTime();

        videoSensor.hide();
        previewVideo.hide();
        videoBackground.hide();
        loader.css('--stage-background', 'var(--background-countdown-color)');
        loaderMessage.html(
            '<i class="' + config.icons.spinner + '"></i><br>' + photoboothTools.getTranslation('busyVideo')
        );

        photoboothTools
            .ajaxWithCsrf({
                method: 'POST',
                url: environment.publicFolders.api + '/applyVideoEffects.php',
                data: {
                    file: result.file
                }
            })
            .done((data) => {
                try {
                    photoboothTools.console.log('video processed', data);
                    endTime = new Date().getTime();
                    totalTime = endTime - startTime;
                    photoboothTools.console.logDev('Processing video took ' + totalTime + 'ms');
                    photoboothTools.console.logDev('Video:', data.file);

                    if (config.get_request.processed) {
                        const getUrl = config.get_request.server + '/video';
                        photoboothTools.getRequest(getUrl);
                    }

                    if (data.error) {
                        api.errorPic(data);
                    } else {
                        api.renderPic(data.file, data.images);
                        const file = environment.publicFolders.images + '/' + data.file;
                        if (config.video.gif) {
                            resultVideo.attr('src', file);
                        } else {
                            const source = document.createElement('source');
                            source.setAttribute('src', file);
                            source.setAttribute('type', 'video/mp4');
                            resultVideo.append(source);
                            resultVideo.get(0).play();
                        }
                        resultVideo.show();
                        if (config.video.qr) {
                            resultVideoQR.attr(
                                'src',
                                environment.publicFolders.api + '/qrcode.php?filename=' + data.file
                            );
                            resultVideoQR.show();
                        }
                    }
                } catch (error) {
                    photoboothTools.console.log('processVideo.success: unexpected error:', error);
                    api.errorPic({ error: error.message || 'Unexpected error processing video' });
                }
            })
            .fail((jqXHR, textStatus) => {
                if (photoboothTools.isCsrfErrorResponse(jqXHR)) {
                    photoboothTools.handleCsrfMismatch(environment.publicFolders.api + '/applyVideoEffects.php');
                    return;
                }
                api.errorPic({
                    error: 'Request failed: ' + textStatus
                });
            });
    };

    api.renderChroma = function (filename) {
        api.filename = filename;

        if (config.keying.show_all) {
            api.addImage(filename);
        }

        startPage.removeClass('stage--active');
        loader.removeClass('stage--active');
        resultPage.addClass('stage--active');

        const chromaimage = environment.publicFolders.keying + '/' + filename;
        processChromaImage(chromaimage, true, filename);
        rotaryController.focusSet(resultPage);

        api.takingPic = false;
        remoteBuzzerClient.inProgress(false);
        photoboothTools.console.logDev('Taking picture in progress: ' + api.takingPic);

        api.resetTimeOut();
    };

    api.showMailForm = function (image) {
        photoboothTools.modal.open('mail');
        const body = photoboothTools.modal.element.querySelector('.modal-body');
        const buttonbar = photoboothTools.modal.element.querySelector('.modal-buttonbar');

        // Text
        const text = document.createElement('p');
        text.textContent = config.mail.send_all_later
            ? photoboothTools.getTranslation('insertMailToDB')
            : photoboothTools.getTranslation('insertMail');
        body.appendChild(text);

        // Form
        const form = document.createElement('form');
        form.id = 'send-mail-form';
        form.classList.add('form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (document.querySelector('#send-mail-message')) {
                document.querySelector('#send-mail-message').remove();
            }
            const message = document.createElement('div');
            message.id = 'send-mail-message';
            message.classList.add('form-message');
            form.appendChild(message);
            const submitButton = document.querySelector('#send-mail-submit');
            submitButton.disabled = true;
            const fd = new FormData(form);
            if (typeof csrf !== 'undefined') {
                fd.append(csrf.key, csrf.token);
            }
            fetch(environment.publicFolders.api + '/sendPic.php', {
                method: 'post',
                body: fd
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        document.querySelector('#send-mail-recipient').value = '';
                        message.classList.add('text-success');
                        if (data.saved) {
                            message.textContent = photoboothTools.getTranslation('mailSaved');
                        } else {
                            message.textContent = photoboothTools.getTranslation('mailSent');
                        }
                    } else {
                        message.classList.add('text-danger');
                        message.textContent = data.error;
                    }
                    submitButton.disabled = false;
                })
                .catch(() => {
                    message.classList.add('text-danger');
                    message.textContent = photoboothTools.getTranslation('mailError');
                    submitButton.disabled = false;
                });
        });
        body.appendChild(form);

        // Image
        const imageInput = document.createElement('input');
        imageInput.type = 'hidden';
        imageInput.name = 'image';
        imageInput.value = image;
        form.appendChild(imageInput);

        // Recipient
        const recipientInput = document.createElement('input');
        recipientInput.classList.add('form-input');
        recipientInput.id = 'send-mail-recipient';
        recipientInput.type = 'text';
        recipientInput.name = 'recipient';
        recipientInput.addEventListener('focusin', (event) => {
            // workaround for photoswipe blocking input
            event.stopImmediatePropagation();
        });
        form.appendChild(recipientInput);

        if (config.mail.virtualKeyboard) {
            virtualKeyboard.initialize(config.mail.keyboardLayout, '#send-mail-recipient', '#send-mail-form');
        }

        // Submit
        const submitLabel = config.mail.send_all_later
            ? photoboothTools.getTranslation('add')
            : photoboothTools.getTranslation('send');
        const submitButton = photoboothTools.button.create(submitLabel, 'fa fa-check', 'primary', 'modal-');
        submitButton.id = 'send-mail-submit';
        submitButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (typeof form.requestSubmit === 'function') {
                form.requestSubmit();
            } else {
                const tmpSubmit = document.createElement('button');
                tmpSubmit.type = 'submit';
                tmpSubmit.style.display = 'none';
                form.appendChild(tmpSubmit);
                tmpSubmit.click();
                form.removeChild(tmpSubmit);
            }
        });
        buttonbar.insertBefore(submitButton, buttonbar.firstChild);
    };

    api.showQrCode = function (filename) {
        if (!config.qr.enabled) {
            return;
        }

        photoboothTools.modal.open();
        const body = photoboothTools.modal.element.querySelector('.modal-body');

        const image = document.createElement('img');
        image.src = environment.publicFolders.api + '/qrcode.php?filename=' + filename;
        body.appendChild(image);

        const qrHelpText = config.qr.custom_text
            ? config.qr.text
            : photoboothTools.getTranslation('qrHelp') + '<br><b>' + config.webserver.ssid + '</b>';
        const text = document.createElement('p');
        text.innerHTML = qrHelpText;
        body.appendChild(text);
    };

    api.renderPic = function (filename, files) {
        api.filename = filename;
        files = Array.isArray(files) ? files : (files ? [files] : [filename]);
        studioPage.removeClass('stage--active');
        $('body').removeClass('mode--studio');

        if (config.print.auto && config.filters.enabled === false) {
            setTimeout(function () {
                photoboothTools.printImage(filename, 1, () => {
                    remoteBuzzerClient.inProgress(false);
                });
            }, config.print.auto_delay);
        }

        buttonPrint.off('click').on('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const currentFile = api.filename || resultPage.attr('data-img') || filename;
            const copies = config.print.max_multi === 1 ? 1 : await photoboothTools.askCopies();

            if (copies && !isNaN(copies)) {
                photoboothTools.printImage(currentFile, copies, () => {
                    remoteBuzzerClient.inProgress(false);
                    buttonPrint.trigger('blur');
                });
            }
        });

        resultPage
            .find('[data-command="qrbtn"]')
            .off('click')
            .on('click', (event) => {
                event.preventDefault();
                const currentFile = api.filename || resultPage.attr('data-img') || filename;
                api.showQrCode(currentFile);
            });

        resultPage
            .find('.deletebtn')
            .off('click')
            .on('click', async (ev) => {
                ev.preventDefault();

                const really = config.delete.no_request
                    ? true
                    : await photoboothTools.confirm(
                          filename + ' ' + photoboothTools.getTranslation('really_delete_image')
                      );
                if (really) {
                    files.forEach(function (file, index, array) {
                        photoboothTools.console.logDev('Index:', index);
                        photoboothTools.console.logDev('Array:', array);
                        api.deleteImage(file, () => {
                            return;
                        });
                    });
                    setTimeout(function () {
                        photoboothTools.reloadPage();
                    }, notificationTimeout);
                } else {
                    buttonDelete.trigger('blur');
                }
            });

        // gallery doesn't support videos atm
        if (!photoboothTools.isVideoFile(filename)) {
            api.addImage(filename);
        }

        // if image is a video render the qr code as image (video should be displayed over this)
        const imageUrl = photoboothTools.isVideoFile(filename)
            ? environment.publicFolders.api + '/qrcode.php?filename=' + filename
            : environment.publicFolders.images + '/' + filename;

        const preloadImage = new Image();
        preloadImage.onload = () => {
            startPage.removeClass('stage--active');

            if (typeof window.rembgReset === 'function') {
                window.rembgReset();
            } else {
                resultPage.removeClass('cutout-mode-active').removeAttr('data-original-img');
                $('#stageCutoutViewport').hide();
                $('#stagePersonTransformBox, #stagePersonResizerBar, #stageTransformBox, #stageBgResizerBar').hide();
                $('#rembgModal').removeClass('active sidenav--open').hide();
            }

            if (typeof window.beautyReset === 'function') {
                window.beautyReset();
            } else {
                $('#beautyModal').removeClass('active sidenav--open').hide();
            }

            resultPage.attr('data-camera-img', filename);
            resultPage.attr('data-original-img', filename);
            resultPage.removeAttr('data-matted-composite');

            resultPage.removeClass(allFilterClasses);
            $('#stageCutoutViewport').removeClass(allFilterClasses);
            $('#stageCutoutPerson').removeClass(allFilterClasses);
            document.documentElement.style.setProperty('--stage-result-filter', 'none');
            if (resultPage[0]) resultPage[0].style.setProperty('--stage-result-filter', 'none');
            const initialVp = document.getElementById('stageCutoutViewport');
            if (initialVp) initialVp.style.removeProperty('filter');
            const initialCp = document.getElementById('stageCutoutPerson');
            if (initialCp) initialCp.style.removeProperty('filter');

            if (imgFilter && imgFilter !== 'plain') {
                resultPage.addClass('filter-effect-' + imgFilter);
                $('#stageCutoutViewport').addClass('filter-effect-' + imgFilter);
                $('#stageCutoutPerson').addClass('filter-effect-' + imgFilter);
                const curCssFilter = filterCssMap[imgFilter] || 'none';
                document.documentElement.style.setProperty('--stage-result-filter', curCssFilter);
                if (resultPage[0]) resultPage[0].style.setProperty('--stage-result-filter', curCssFilter);
            }

            resultPage.css({
                '--stage-background-image': `url("${imageUrl}?filter=${imgFilter}")`
            });
            if (resultPage[0]) {
                resultPage[0].style.setProperty('--stage-background-image', `url("${imageUrl}?filter=${imgFilter}")`);
            }
            resultPage.attr('data-img', filename);
            resultPage.addClass('stage--active');

            const currentActiveMode = window.sessionPhotoboothMode || window.photoboothMode;
            if (currentActiveMode === 'ai_swap') {
                $('#resultSidebar .rembgbtn, #resultSidebar .beautybtn').hide();
                $('#aiResultControlBar').show();
            } else {
                $('#resultSidebar .rembgbtn, #resultSidebar .beautybtn').show();
                $('#aiResultControlBar').hide();
            }

            loader.removeClass('stage--active showBackgroundImage');
            loader.css('background-image', '');

            if (config.qr.enabled && config.qr.result != 'hidden') {
                if (document.getElementById('resultQR')) {
                    document.getElementById('resultQR').remove();
                }
                const qrWrapper = document.createElement('div');
                qrWrapper.id = 'resultQR';
                qrWrapper.setAttribute('class', 'stage-code ' + config.qr.result);

                const qrResultImage = document.createElement('img');
                qrResultImage.addEventListener('load', () => {
                    resultPage.append(qrWrapper);
                });

                qrResultImage.src = environment.publicFolders.api + '/qrcode.php?filename=' + filename;
                qrResultImage.alt = 'QR-Code';
                qrResultImage.classList.add('stage-code__image');
                qrWrapper.append(qrResultImage);

                const qrShortText = config.qr.short_text;
                if (qrShortText && qrShortText.length > 0) {
                    const qrCaption = document.createElement('p');
                    qrCaption.classList.add('stage-code__caption');
                    qrCaption.textContent = qrShortText;
                    qrWrapper.append(qrCaption);
                }
            }

            if (!filternav.hasClass('sidenav--open')) {
                rotaryController.focusSet(resultPage);
            }
        };

        preloadImage.onerror = () => {
            photoboothTools.console.log('ERROR: Failed to preload image: ' + imageUrl);
            loader.removeClass('stage--active showBackgroundImage');
            loader.css('background-image', '');
            photoboothTools.modal.open('error');
            photoboothTools.modal.empty();
            const modalMessage = $('<p>').text(photoboothTools.getTranslation('error'));
            photoboothTools.modal.append(modalMessage);
            const closeBtn = photoboothTools.button.create('close', 'fa fa-times', 'default', 'close');
            closeBtn.on('click', () => {
                photoboothTools.modal.close();
                api.reset();
                startPage.addClass('stage--active');
            });
            photoboothTools.modal.append(closeBtn);
        };

        preloadImage.src = imageUrl;

        api.takingPic = false;
        remoteBuzzerClient.inProgress(false);
        photoboothTools.console.logDev('Taking picture in progress: ' + api.takingPic);

        api.resetTimeOut();

        if (config.commands.preview && !config.preview.bsm) {
            photoboothTools.console.logDev('Preview: core: start video from api.renderPic');
            photoboothPreview.startVideo(CameraDisplayMode.INIT);
        }

        if (config.commands.post_photo) {
            api.shellCommand('post-command', filename);
        }

        api.screensaver.resetTimer();
    };

    api.addImage = function (imageName) {
        if (!config.gallery.enabled) {
            return;
        }
        const useThumb = config.gallery.use_thumb;
        const thumbImg = new Image();
        const bigImg = new Image();
        let thumbSize = '';
        let bigSize = '';
        let bigSizeW = '';
        let bigSizeH = '';
        const maxSizeW = config.gallery.picture_width || 800;
        const maxSizeH = config.gallery.picture_height || 600;

        let imgtoLoad = 2;

        thumbImg.onload = function () {
            thumbSize = this.width + 'x' + this.height;
            if (--imgtoLoad === 0) {
                allLoaded();
            }
        };

        bigImg.onload = function () {
            bigSizeW = this.width;
            bigSizeH = this.height;
            bigSize = bigSizeW + 'x' + bigSizeH;
            // Calculate PSWP dimensions to max 800x600 while keeping aspect ratio
            let aspectRatio = bigSizeW / bigSizeH;
            if (aspectRatio >= 1) {
                // Landscape or square
                if (bigSizeW > maxSizeW) {
                    bigSizeW = maxSizeW;
                    bigSizeH = Math.round(bigSizeW / aspectRatio);
                } else if (bigSizeH > maxSizeH) {
                    bigSizeH = maxSizeH;
                    bigSizeW = Math.round(bigSizeH * aspectRatio);
                }
            } else {
                // Portrait
                if (bigSizeH > maxSizeH) {
                    bigSizeH = maxSizeH;
                    bigSizeW = Math.round(bigSizeH * aspectRatio);
                } else if (bigSizeW > maxSizeW) {
                    bigSizeW = maxSizeW;
                    bigSizeH = Math.round(bigSizeW / aspectRatio);
                }
            }

            if (--imgtoLoad === 0) {
                allLoaded();
            }
        };

        bigImg.src = environment.publicFolders.images + '/' + imageName;
        const thumbUrl =
            (useThumb ? environment.publicFolders.thumbs : environment.publicFolders.images) + '/' + imageName;
        thumbImg.src = thumbUrl;

        function allLoaded() {
            const linkElement = $('<a>').html(thumbImg);

            linkElement.attr('class', 'gallery-list-item rotaryfocus');
            linkElement.attr('data-size', bigSize);
            linkElement.attr('data-pswp-width', bigSizeW);
            linkElement.attr('data-pswp-height', bigSizeH);
            linkElement.attr('href', environment.publicFolders.images + '/' + imageName);
            linkElement.attr('data-med', thumbUrl);
            linkElement.attr('data-med-size', thumbSize);

            if (config.gallery.newest_first) {
                linkElement.prependTo(galimages);
            } else {
                linkElement.appendTo(galimages);
            }

            galimages.children().not('a').remove();
        }
    };

    api.openGallery = function () {
        if (config.gallery.scrollbar) {
            gallery.addClass('scrollbar');
        }

        gallery.addClass('gallery--open');

        setTimeout(() => {
            gallery.find('.gallery__inner').show();
            rotaryController.focusSet(gallery);
        }, 300);
    };

    api.closeGallery = function () {
        if (typeof globalGalleryHandle !== 'undefined') {
            if (globalGalleryHandle.pswp) {
                globalGalleryHandle.pswp.close();
            }
        }

        gallery.find('.gallery__inner').hide();
        gallery.removeClass('gallery--open');

        if (resultPage.is(':visible')) {
            rotaryController.focusSet(resultPage);
        } else if (startPage.is(':visible')) {
            rotaryController.focusSet(startPage);
        }
    };

    api.deleteImage = function (imageName, cb) {
        const errorMsg =
            photoboothTools.getTranslation('error') + '</br>' + photoboothTools.getTranslation('auto_reload');
        $.ajax({
            url: environment.publicFolders.api + '/deletePhoto.php',
            method: 'POST',
            data: {
                file: imageName,
                [csrf.key]: csrf.token
            },
            success: (data) => {
                if (data.success) {
                    const msg =
                        data.file +
                        ' ' +
                        photoboothTools.getTranslation('deleted_successfully') +
                        '</br>' +
                        photoboothTools.getTranslation('auto_reload');
                    photoboothTools.console.log('Deleted ' + data.file);
                    photoboothTools.overlay.showSuccess(msg);
                } else {
                    photoboothTools.console.log('Error while deleting ' + data.file);
                    photoboothTools.console.log('Failed: ' + data.failed);
                    photoboothTools.overlay.showError(errorMsg);
                }
                setTimeout(() => photoboothTools.overlay.close(), notificationTimeout);
                cb(data);
            },
            error: (jqXHR, textStatus) => {
                photoboothTools.console.log('Error while deleting image: ', textStatus);
                photoboothTools.overlay.showError(errorMsg);
                setTimeout(() => photoboothTools.reloadPage(), notificationTimeout);
            }
        });
    };

    $('.imageFilter').on('click', function (e) {
        e.preventDefault();
        api.navbar.toggle();
    });

    let activeFilterRequest = null;
    let filterDebounceTimer = null;
    let filterRequestId = 0;
    const filterCssMap = {
        'plain': 'none',
        'grayscale': 'grayscale(100%)',
        'antique': 'sepia(65%) contrast(90%) brightness(105%) saturate(120%)',
        'vintage': 'sepia(35%) contrast(125%) saturate(115%)',
        'retro': 'sepia(45%) contrast(120%) brightness(95%) saturate(110%)',
        'cool': 'hue-rotate(170deg) contrast(110%) brightness(95%)',
        'summer': 'saturate(160%) brightness(105%) hue-rotate(-15deg)',
        'sepia-light': 'sepia(50%) contrast(105%)',
        'sepia-dark': 'sepia(90%) contrast(115%) brightness(90%)',
        'color': 'contrast(135%) saturate(170%)',
        'washed': 'brightness(115%) contrast(85%) saturate(80%)',
        'everglow': 'brightness(90%) contrast(110%) sepia(40%) saturate(130%)',
        'aqua': 'hue-rotate(150deg) saturate(140%) brightness(105%)',
        'blue': 'hue-rotate(190deg) saturate(180%) contrast(110%)',
        'green': 'hue-rotate(90deg) saturate(180%) contrast(105%)',
        'red': 'hue-rotate(330deg) saturate(200%) contrast(110%)',
        'pink': 'hue-rotate(290deg) saturate(160%) brightness(105%)',
        'yellow': 'hue-rotate(35deg) saturate(180%)',
        'smooth': 'blur(0.8px) contrast(105%)',
        'blur': 'blur(2.5px)',
        'selective-blur': 'blur(2px) contrast(110%)',
        'pixelate': 'contrast(120%) saturate(140%)',
        'negate': 'invert(100%)',
        'emboss': 'contrast(250%) grayscale(100%)',
        'edge': 'contrast(300%) grayscale(100%) invert(20%)',
        'mean': 'contrast(140%) brightness(95%)'
    };

    const allFilterClasses = Object.keys(filterCssMap).map(f => 'filter-effect-' + f).join(' ');

    $(document).on('click', '.filter-card[data-filter], .sidenav-list-item[data-filter]', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const clickedFilter = $(this).data('filter');
        $('#filternav .filter-card, #filternav .sidenav-list-item, .filter-card, .sidenav-list-item').removeClass('filter-card--active sidenav-list-item--active focused');
        $(this).addClass('filter-card--active sidenav-list-item--active');
        if (typeof this.blur === 'function') {
            this.blur();
        }

        imgFilter = clickedFilter;

        // 1. Instantaneous 0ms visual filter on stage & cutout viewport via class + style properties
        resultPage.removeClass(allFilterClasses);
        $('#stageCutoutViewport').removeClass(allFilterClasses);
        $('#stageCutoutPerson').removeClass(allFilterClasses);

        if (clickedFilter !== 'plain') {
            resultPage.addClass('filter-effect-' + clickedFilter);
            $('#stageCutoutViewport').addClass('filter-effect-' + clickedFilter);
            $('#stageCutoutPerson').addClass('filter-effect-' + clickedFilter);
        }

        const cssFilter = filterCssMap[clickedFilter] || 'none';
        document.documentElement.style.setProperty('--stage-result-filter', cssFilter);
        if (resultPage[0]) {
            resultPage[0].style.setProperty('--stage-result-filter', cssFilter);
        }
        resultPage.css('--stage-result-filter', cssFilter);

        const cutoutVp = document.getElementById('stageCutoutViewport');
        if (cutoutVp) {
            cutoutVp.style.setProperty('--stage-result-filter', cssFilter);
            if (clickedFilter !== 'plain') {
                cutoutVp.style.setProperty('filter', cssFilter, 'important');
            } else {
                cutoutVp.style.removeProperty('filter');
            }
        }
        const cutoutPerson = document.getElementById('stageCutoutPerson');
        if (cutoutPerson) {
            if (clickedFilter !== 'plain') {
                cutoutPerson.style.setProperty('filter', cssFilter, 'important');
            } else {
                cutoutPerson.style.removeProperty('filter');
            }
        }

        // Keep timeout timer alive during interactions
        api.clearTimeOut();

        // 2. Debounced background persistence (300ms) with request sequence guard and in-memory preloading
        if (filterDebounceTimer) {
            clearTimeout(filterDebounceTimer);
            filterDebounceTimer = null;
        }

        if (activeFilterRequest) {
            try {
                activeFilterRequest.abort();
            } catch (err) {}
            activeFilterRequest = null;
        }

        const curRequestId = ++filterRequestId;

        filterDebounceTimer = setTimeout(function () {
            filterDebounceTimer = null;

            if (!resultPage.attr('data-original-img')) {
                resultPage.attr('data-original-img', resultPage.attr('data-img'));
            }
            const baseFile = resultPage.attr('data-original-img') || resultPage.attr('data-img');
            if (!baseFile) {
                return;
            }

            const apiUrl = (typeof environment !== 'undefined' && environment.publicFolders && environment.publicFolders.api)
                ? environment.publicFolders.api + '/applyEffects.php'
                : 'api/applyEffects.php';

            activeFilterRequest = photoboothTools.ajaxWithCsrf({
                method: 'POST',
                url: apiUrl,
                data: {
                    file: baseFile,
                    filter: clickedFilter,
                    style: api.photoStyle || 'photo'
                },
                timeout: 25000
            }).done(function (data) {
                activeFilterRequest = null;
                // Discard stale response if user has clicked another filter since this request was queued
                if (curRequestId !== filterRequestId) {
                    return;
                }
                if (data && data.file) {
                    const newFile = data.file;
                    const imagesFolder = (typeof environment !== 'undefined' && environment.publicFolders && environment.publicFolders.images)
                        ? environment.publicFolders.images
                        : '/data/images';
                    const newUrl = imagesFolder + '/' + newFile + '?v=' + Date.now();

                    // In-memory preloader: DO NOT replace stage background until the image is 100% loaded in browser memory!
                    const preloader = new Image();
                    preloader.onload = function () {
                        if (curRequestId !== filterRequestId) return;
                        resultPage.attr('data-img', newFile);
                        api.filename = newFile;
                        resultPage.css('--stage-background-image', `url("${newUrl}")`);
                        if (resultPage[0]) {
                            resultPage[0].style.setProperty('--stage-background-image', `url("${newUrl}")`);
                        }

                        // When returning to plain, ensure all filters are cleanly cleared
                        if (clickedFilter === 'plain') {
                            resultPage.removeClass(allFilterClasses);
                            $('#stageCutoutViewport').removeClass(allFilterClasses);
                            $('#stageCutoutPerson').removeClass(allFilterClasses);
                            document.documentElement.style.setProperty('--stage-result-filter', 'none');
                            if (resultPage[0]) resultPage[0].style.setProperty('--stage-result-filter', 'none');
                            if (cutoutVp) cutoutVp.style.removeProperty('filter');
                            if (cutoutPerson) cutoutPerson.style.removeProperty('filter');
                        }

                        const qrResultImage = document.querySelector('#resultQR img.stage-code__image');
                        if (qrResultImage && environment && environment.publicFolders) {
                            qrResultImage.src = environment.publicFolders.api + '/qrcode.php?filename=' + newFile;
                        }

                        if (typeof api.addImage === 'function') {
                            api.addImage(newFile);
                        }
                    };
                    preloader.onerror = function () {
                        photoboothTools.console.log('Filter image preload error, keeping visual CSS filter.');
                    };
                    preloader.src = newUrl;
                }
                api.resetTimeOut();
            }).fail(function (xhr, status) {
                activeFilterRequest = null;
                if (status !== 'abort') {
                    api.resetTimeOut();
                }
            });
        }, 300);
    });

    $('.takePic, .newpic').on('click', function (e) {
        e.preventDefault();
        if (typeof window.rembgReset === 'function') {
            window.rembgReset();
        }
        api.thrill(PhotoStyle.PHOTO);
        $(this).trigger('blur');
    });

    $('.takeCustom, .newcustom').on('click', function (e) {
        e.preventDefault();
        if (typeof window.rembgReset === 'function') {
            window.rembgReset();
        }
        api.thrill(PhotoStyle.CUSTOM);
        $(this).trigger('blur');
    });

    $('.takeVideo, .newVideo, .newvideo').on('click', function (e) {
        e.preventDefault();
        if (typeof window.rembgReset === 'function') {
            window.rembgReset();
        }
        api.thrill(PhotoStyle.VIDEO);
        $(this).trigger('blur');
    });

    $(document).on('click', '.uploadBtn, [data-command="uploadBtn"]', function (e) {
        e.preventDefault();
        $('#uploadPhotoInput').trigger('click');
        $(this).trigger('blur');
    });

    $(document).on('change', '#uploadPhotoInput', function () {
        if (!this.files || !this.files[0]) {
            return;
        }
        const file = this.files[0];
        const fileInput = this;

        if (typeof window.rembgReset === 'function') {
            window.rembgReset();
        }

        const formData = new FormData();
        formData.append('photo', file);

        if (window.photoboothTools && window.photoboothTools.overlay) {
            photoboothTools.overlay.showWaiting('正在上传图片，请稍候...');
        }

        $.ajax({
            url: 'api/uploadPhoto.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function (res) {
                fileInput.value = '';
                if (window.photoboothTools && window.photoboothTools.overlay) {
                    photoboothTools.overlay.close();
                }
                if (res && res.success && res.file) {
                    api.renderPic(res.file);
                } else {
                    const errMsg = (res && res.error) ? res.error : '上传图片失败，请重试';
                    if (window.photoboothTools && window.photoboothTools.showNotification) {
                        photoboothTools.showNotification('error', errMsg);
                    } else {
                        alert(errMsg);
                    }
                }
            },
            error: function (xhr, status, error) {
                fileInput.value = '';
                if (window.photoboothTools && window.photoboothTools.overlay) {
                    photoboothTools.overlay.close();
                }
                let errMsg = '上传失败: ' + (error || status);
                if (xhr && xhr.responseJSON && xhr.responseJSON.error) {
                    errMsg = '上传失败: ' + xhr.responseJSON.error;
                } else if (xhr && xhr.responseText) {
                    try {
                        const parsed = JSON.parse(xhr.responseText);
                        if (parsed && parsed.error) {
                            errMsg = '上传失败: ' + parsed.error;
                        }
                    } catch (e) {}
                }
                if (window.photoboothTools && window.photoboothTools.showNotification) {
                    photoboothTools.showNotification('error', errMsg);
                } else {
                    alert(errMsg);
                }
            }
        });
    });

    $('[data-command="sidenav-close"]').on('click', function (e) {
        e.preventDefault();
        api.navbar.close();
        rotaryController.focusSet(resultPage);
    });

    $('.gallery-button, .gallerybtn').on('click', function (e) {
        e.preventDefault();
        api.navbar.close();
        api.openGallery($(this));
    });

    $('[data-command="gallery__refresh"]').on('click', function (e) {
        e.preventDefault();
        photoboothTools.reloadPage();
    });

    $('[data-command="gallery__close"]').on('click', function (e) {
        e.preventDefault();
        api.closeGallery();
    });

    $('.mailbtn').on('click touchstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const img = resultPage.attr('data-img');
        api.showMailForm(img);
    });

    resultPage.on('click', function () {
        if (!filternav.hasClass('sidenav--open')) {
            rotaryController.focusSet(resultPage);
        }
    });

    $('.homebtn').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        photoboothTools.reloadPage();
        rotaryController.focusSet(startPage);
    });

    if (screensaverEnabled) {
        $(document).on('click touchstart keydown mousemove', function () {
            api.screensaver.resetTimer();
        });

        screensaverOverlay.on('click touchstart', function (e) {
            e.preventDefault();
            api.screensaver.resetTimer();
        });
    }

    $('.cups-button').on('click', function (ev) {
        ev.preventDefault();

        const url = `http://${location.hostname}:631/jobs/`;
        const features = 'width=1024,height=600,left=0,top=0,screenX=0,screenY=0,resizable=NO,scrollbars=NO';

        window.open(url, 'newwin', features);
    });

    $('.print-unlock-button').on('click', function (e) {
        e.preventDefault();
        photoboothTools.overlay.showWaiting(photoboothTools.getTranslation('wait_message'));
        $.ajax({
            method: 'GET',
            url: environment.publicFolders.api + '/printDB.php',
            data: {
                action: 'unlockPrint',
                [csrf.key]: csrf.token
            },
            success: (data) => {
                if (data.success) {
                    photoboothTools.overlay.showSuccess(photoboothTools.getTranslation('success'));
                    $(this).addClass('hidden');
                } else {
                    photoboothTools.overlay.showError(photoboothTools.getTranslation('error'));
                }
                setTimeout(function () {
                    photoboothTools.overlay.close();
                }, 2000);
            }
        });
    });

    api.handleButtonPressWhileTakingPic = function () {
        photoboothTools.console.logDev('Taking picture already in progress!');
    };

    $(document).on('keyup', function (ev) {
        if (api.isTimeOutPending()) {
            if (typeof onStandaloneGalleryView !== 'undefined' || startPage.is(':visible')) {
                clearTimeout(timeOut);
                photoboothTools.console.logDev('Timeout for auto reload cleared.');
            } else {
                api.resetTimeOut();
            }
        }

        if (config.selfie_mode) {
            return;
        }

        if (typeof onStandaloneGalleryView === 'undefined' && typeof onCaptureChromaView === 'undefined') {
            if (
                (config.picture.key && parseInt(config.picture.key, 10) === ev.keyCode) ||
                (config.custom.key && parseInt(config.custom.key, 10) === ev.keyCode)
            ) {
                if (api.takingPic) {
                    api.handleButtonPressWhileTakingPic();

                    return;
                }
                api.closeGallery();
            } else if (config.print.from_result && config.print.key && parseInt(config.print.key, 10) === ev.keyCode) {
                if (photoboothTools.isPrinting) {
                    photoboothTools.console.log('Printing already in progress!');
                } else {
                    buttonPrint.trigger('click');
                }

                return;
            } else {
                return;
            }

            // picture
            if (config.picture.key && parseInt(config.picture.key, 10) === ev.keyCode) {
                if (config.picture.enabled) {
                    api.thrill(PhotoStyle.PHOTO);
                } else {
                    photoboothTools.console.logDev(
                        'Picture key pressed, but taking pictures disabled. Please enable picture in your config.'
                    );
                }
            }

            // custom
            if (config.custom.key && parseInt(config.custom.key, 10) === ev.keyCode) {
                if (config.custom.enabled) {
                    api.thrill(PhotoStyle.CUSTOM);
                } else {
                    photoboothTools.console.logDev(
                        'Custom key pressed, but custom action disabled. Please enable custom action in your config.'
                    );
                }
            }
        }
    });

    $(document).on('click', function () {
        if (api.isTimeOutPending()) {
            if (typeof onStandaloneGalleryView !== 'undefined' || startPage.is(':visible')) {
                clearTimeout(timeOut);
                photoboothTools.console.logDev('Timeout for auto reload cleared.');
            } else {
                api.resetTimeOut();
            }
        }
    });

    // Disable Right-Click
    if (config.dev.loglevel > 0) {
        $(this).on('contextmenu', function (e) {
            e.preventDefault();
        });
    }

    previewVideo.on('loadedmetadata', function (ev) {
        const videoEl = ev.target;
        let newWidth = videoEl.offsetWidth;
        let newHeight = videoEl.offsetHeight;
        if (config.preview.style === PreviewStyle.SCALE_DOWN.valueOf()) {
            newWidth = videoEl.videoWidth;
            newHeight = videoEl.videoHeight;
        }
        if (newWidth !== 0 && newHeight !== 0) {
            previewFramePicture.css({ width: newWidth, height: newHeight });
        }
    });

    // ==========================================
    // Commercial Dual-Mode State Machine & AI Portal
    // ==========================================
    window.photoboothMode = 'classic'; // 'classic' | 'ai_swap'
    window.selectedAiTemplate = {
        id: 'hanfu_female_01',
        title: '盛唐绮梦 · 汉服仙子',
        category: 'hanfu'
    };

    api.setPhotoboothMode = function (mode) {
        window.photoboothMode = mode;
        photoboothTools.console.log('Photobooth mode switched to:', mode);
    };

    // ==========================================
    // Studio Independent Stage Architecture (独立全屏摄影工作台)
    // ==========================================
    window.studioClassicLayout = 'single'; // 'single' | 'burst'

    api.enterStudio = function (mode) {
        mode = mode || 'ai_swap';
        api.setPhotoboothMode(mode);

        startPage.removeClass('stage--active');
        loader.removeClass('stage--active');
        resultPage.removeClass('stage--active');
        studioPage.addClass('stage--active');
        $('body').addClass('mode--studio');

        // Start live camera in left viewport
        photoboothPreview.startVideo(CameraDisplayMode.BACKGROUND);

        if (mode === 'ai_swap') {
            $('#studioModePill').removeClass('classic');
            $('#studioModePillText').text('AI 魔法变身照');
            $('#workbenchIcon').removeClass('classic').html('<i class="fa fa-wand-magic-sparkles"></i>');
            $('#workbenchTitle').text('AI 魔法变身工作室');
            $('#workbenchSubtitle').text('实时微调美颜滤镜 · 精挑模板一秒穿越');
            $('#tabTemplatesLabel').text('挑选模板');

            $('#studioAiTplContainer').show();
            $('#studioClassicTplContainer').hide();
            $('#aiPoseGuide').show();

            // Default AI template
            if (!window.selectedAiTemplate) {
                const firstCard = $('#studioAiTplGrid .wb-tpl-card.active').first();
                if (firstCard.length) {
                    window.selectedAiTemplate = {
                        id: firstCard.data('id'),
                        title: firstCard.data('title'),
                        image: firstCard.data('image'),
                        path: firstCard.data('image')
                    };
                } else {
                    window.selectedAiTemplate = {
                        id: 'hanfu_female_01',
                        title: '盛唐绮梦 · 汉服仙子',
                        image: 'resources/img/templates_ai/hanfu_female_01.jpg',
                        path: 'resources/img/templates_ai/hanfu_female_01.jpg'
                    };
                }
            }
            if (window.selectedAiTemplate) {
                $('#studioCurrentTplName').text(window.selectedAiTemplate.title || '盛唐绮梦 · 汉服仙子');
                if (window.selectedAiTemplate.image) {
                    $('#studioCurrentTplThumb').attr('src', window.selectedAiTemplate.image).show();
                }
            }
        } else {
            $('#studioModePill').addClass('classic');
            $('#studioModePillText').text('经典美颜大头贴');
            $('#workbenchIcon').addClass('classic').html('<i class="fa fa-camera-retro"></i>');
            $('#workbenchTitle').text('经典美颜大头贴工作室');
            $('#workbenchSubtitle').text('自然微调美颜 · 发丝级抠图换背景');
            $('#tabTemplatesLabel').text('背景模板');

            $('#studioAiTplContainer').hide();
            $('#studioClassicTplContainer').show();
            $('#aiPoseGuide').hide();

            const firstBg = $('#studioClassicTplGrid .wb-classic-card.active').first();
            if (firstBg.length) {
                window.selectedClassicTemplate = {
                    id: firstBg.data('id'),
                    title: firstBg.data('title'),
                    image: firstBg.data('image')
                };
                $('#studioCurrentTplName').text(firstBg.data('title'));
                $('#studioCurrentTplThumb').attr('src', firstBg.data('image')).show();
            }
        }

        // Restore custom countdown preference
        const savedCntdwn = localStorage.getItem('photobooth_custom_countdown');
        if (savedCntdwn) {
            const parsedVal = parseInt(savedCntdwn, 10);
            if (parsedVal >= 1 && parsedVal <= 10) {
                $('#studioCountdownSelect').val(parsedVal);
                config.picture = config.picture || {};
                config.picture.cntdwn_time = parsedVal;
            }
        }

        // Start real-time face orientation and alignment detection loop (Red/Green feedback)
        api.startFacePoseAlignmentLoop();

        // Apply selected filter and real-time beauty to live preview
        api.applyStudioBeautyPreview();
    };

    api.exitStudio = function () {
        studioPage.removeClass('stage--active');
        $('body').removeClass('mode--studio');
        startPage.addClass('stage--active');
        api.stopFacePoseAlignmentLoop();
        $('#aiPoseGuide').hide();
        $('#preview--video').css('filter', '').css('transform', '');
        window.photoboothMode = 'classic';
        window.sessionPhotoboothMode = null;
        if (!usesBackgroundPreview) {
            photoboothPreview.stopPreview();
        }
    };

    // Mode Card Classic Click -> Enter Studio (Classic Mode)
    $(document).on('click', '#cardModeClassic', function (e) {
        if ($(e.target).closest('#btnClassicBurst').length > 0) {
            return;
        }
        e.preventDefault();
        window.studioClassicLayout = 'single';
        api.enterStudio('classic');
    });

    $(document).on('click', '#btnClassicStart', function (e) {
        e.preventDefault();
        window.studioClassicLayout = 'single';
        api.enterStudio('classic');
    });

    $(document).on('click', '#btnClassicBurst', function (e) {
        e.preventDefault();
        window.studioClassicLayout = 'burst';
        api.enterStudio('classic');
        $('#btnStudioModeBurst').trigger('click');
    });

    // Mode Card AI Click -> Enter Studio (AI Mode)
    $(document).on('click', '#cardModeAi, #btnEnterAiMode', function (e) {
        e.preventDefault();
        api.enterStudio('ai_swap');
    });

    // Studio Back Button -> Return Home
    $(document).on('click', '#btnStudioBack', function (e) {
        e.preventDefault();
        api.exitStudio();
    });

    // Studio Mirror Flip Button
    $(document).on('click', '#btnStudioFlip', function (e) {
        e.preventDefault();
        const vid = $('#preview--video');
        const isFlipped = vid.hasClass('flip-horizontal');
        photoboothPreview.setFlip(!isFlipped);
    });

    // Studio Tabs (Filters & Beauty VS Templates)
    $(document).on('click', '.wb-tab-btn', function (e) {
        e.preventDefault();
        const tab = $(this).data('tab');
        $('.wb-tab-btn').removeClass('active');
        $(this).addClass('active');

        $('.wb-tab-pane').removeClass('active');
        if (tab === 'filters') {
            $('#paneFilters').addClass('active');
        } else if (tab === 'templates') {
            $('#paneTemplates').addClass('active');
        }
    });

    // Studio Live Real-Time WebRTC Beauty & Filter Preview Renderer
    api.applyStudioBeautyPreview = function () {
        const smooth = parseInt($('#studioSmoothSlider').val() || 30, 10);
        const white = parseInt($('#studioWhiteSlider').val() || 25, 10);
        const rosy = parseInt($('#studioRosySlider').val() || 20, 10);
        const clarity = parseInt($('#studioClaritySlider').val() || 15, 10);
        const eye = parseInt($('#studioEyeSlider').val() || 15, 10);
        const slim = parseInt($('#studioSlimSlider').val() || 15, 10);

        // 1. Crystal Whitening & Luminance (S-Curve & Shadow Protection)
        const brightness = (1.0 + (white / 100) * 0.28).toFixed(3);
        const whiteContrast = (1.0 + (white / 100) * 0.05).toFixed(3);

        // 2. Natural Rosy Blush (Warm peach / pink saturation boost)
        const rosySat = (1.0 + (rosy / 100) * 0.25).toFixed(3);
        const rosyHue = (rosy > 0) ? `hue-rotate(${-((rosy / 100) * 5.0).toFixed(1)}deg)` : '';

        // 3. High-Definition Clarity (Micro-contrast enhancement)
        const clarityContrast = (1.0 + (clarity / 100) * 0.18).toFixed(3);

        // 4. Fine Skin Smoothing (Soft-focus skin diffusion, visible & delicate)
        let smoothFilter = '';
        if (smooth > 0) {
            const blurPx = (0.4 + (smooth / 100) * 2.2).toFixed(2);
            smoothFilter = `blur(${blurPx}px)`;
        }

        // Combined color and beauty filter
        const netContrast = (parseFloat(whiteContrast) * parseFloat(clarityContrast) * (1.0 - (smooth / 100) * 0.04)).toFixed(3);
        const beautyFilterStr = `brightness(${brightness}) contrast(${netContrast}) saturate(${rosySat}) ${rosyHue} ${smoothFilter}`.trim();

        // 5. Combine with current artistic color filter
        const activeFilter = imgFilter || 'plain';
        const filterVal = (typeof activeFilter === 'object' && activeFilter !== null && activeFilter.value) ? activeFilter.value : activeFilter;
        const baseColorFilter = (filterCssMap && filterCssMap[filterVal] && filterCssMap[filterVal] !== 'none') ? filterCssMap[filterVal] : '';

        const fullFilter = (baseColorFilter + ' ' + beautyFilterStr).trim();

        const vid = $('#preview--video');
        if (vid.length) {
            vid.css('filter', fullFilter);
            // CRITICAL FIX: Do NOT set transform on video element.
            // Horizontal mirror is handled by CSS .flip-horizontal (scale: -1 1).
            // Setting transform: scale(-1) causes double-negative inversion bug.
            vid.css('transform', '');
        }

        // 6. Dynamic Pose Guide Oval Feedback for Eye & Slim
        const guideOval = $('.ai-pose-oval');
        if (guideOval.length) {
            if (eye > 15 || slim > 15) {
                guideOval.addClass('ai-pose-oval--beauty-glow');
            } else {
                guideOval.removeClass('ai-pose-oval--beauty-glow');
            }
            const ovalTaper = (1.0 - (slim / 100) * 0.10).toFixed(2);
            guideOval.css('transform', `scaleX(${ovalTaper})`);
        }
    };

    // Stage 3.7: Real-Time Face Orientation & Pose Alignment Loop (Red / Green Detection)
    let faceAlignmentTimer = null;
    let faceDetector = null;
    if (window.FaceDetector) {
        try {
            faceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        } catch (e) {
            faceDetector = null;
        }
    }
    let alignmentCanvas = null;
    let alignmentCtx = null;
    let isAlignmentChecking = false;

    api.startFacePoseAlignmentLoop = function () {
        api.stopFacePoseAlignmentLoop();
        $('#aiPoseGuide').show();

        const guideOval = $('.ai-pose-oval');
        const guideBadge = $('.ai-pose-badge');

        // Initial default state: unaligned red
        guideOval.removeClass('is-aligned').addClass('is-unaligned');
        guideBadge.removeClass('is-aligned').addClass('is-unaligned')
            .html('<i class="fa fa-crosshairs"></i> AI正脸检测中...');

        faceAlignmentTimer = setInterval(async () => {
            if ($('#aiPoseGuide').is(':hidden')) {
                return;
            }

            const vid = document.getElementById('preview--video');
            if (!vid || vid.paused || vid.ended || !vid.videoWidth || !vid.videoHeight) {
                return;
            }

            if (isAlignmentChecking) {
                return;
            }

            if (!alignmentCanvas) {
                alignmentCanvas = document.createElement('canvas');
                alignmentCanvas.width = 240;
                alignmentCanvas.height = 180;
                alignmentCtx = alignmentCanvas.getContext('2d', { willReadFrequently: true });
            }

            try {
                isAlignmentChecking = true;
                alignmentCtx.drawImage(vid, 0, 0, 240, 180);
                const frameData = alignmentCanvas.toDataURL('image/jpeg', 0.6);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1200);

                const resp = await fetch('api/alignCheck.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: frameData }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (resp.ok) {
                    const result = await resp.json();
                    if (result.status === 'ok') {
                        if (result.detected && result.aligned) {
                            guideOval.removeClass('is-unaligned').addClass('is-aligned');
                            guideBadge.removeClass('is-unaligned').addClass('is-aligned')
                                .html('<i class="fa fa-circle-check"></i> ' + (result.message || '正脸已对正 · 可以拍照'));
                        } else if (result.detected && !result.aligned) {
                            guideOval.removeClass('is-aligned').addClass('is-unaligned');
                            guideBadge.removeClass('is-aligned').addClass('is-unaligned')
                                .html('<i class="fa fa-triangle-exclamation"></i> ' + (result.message || '请正对镜头 · 保持端正'));
                        } else {
                            // Nobody in frame
                            guideOval.removeClass('is-aligned').addClass('is-unaligned');
                            guideBadge.removeClass('is-aligned').addClass('is-unaligned')
                                .html('<i class="fa fa-user-slash"></i> ' + (result.message || '请走入取景框中'));
                        }
                    }
                }
            } catch (err) {
                // Network error or timeout: do NOT falsely turn green!
                guideOval.removeClass('is-aligned').addClass('is-unaligned');
                guideBadge.removeClass('is-aligned').addClass('is-unaligned')
                    .html('<i class="fa fa-circle-notch fa-spin"></i> AI服务响应中...');
            } finally {
                isAlignmentChecking = false;
            }
        }, 220);
    };

    api.stopFacePoseAlignmentLoop = function () {
        if (faceAlignmentTimer) {
            clearInterval(faceAlignmentTimer);
            faceAlignmentTimer = null;
        }
        isAlignmentChecking = false;
    };

    // Beauty Presets Click
    $(document).on('click', '.wb-preset-pill', function (e) {
        e.preventDefault();
        $('.wb-preset-pill').removeClass('active');
        $(this).addClass('active');

        const preset = $(this).data('preset');
        if (preset === 'natural') {
            $('#studioSmoothSlider').val(35).trigger('input');
            $('#studioWhiteSlider').val(25).trigger('input');
            $('#studioRosySlider').val(20).trigger('input');
            $('#studioClaritySlider').val(15).trigger('input');
            $('#studioEyeSlider').val(15).trigger('input');
            $('#studioSlimSlider').val(15).trigger('input');
        } else if (preset === 'rosy') {
            $('#studioSmoothSlider').val(45).trigger('input');
            $('#studioWhiteSlider').val(30).trigger('input');
            $('#studioRosySlider').val(45).trigger('input');
            $('#studioClaritySlider').val(10).trigger('input');
            $('#studioEyeSlider').val(25).trigger('input');
            $('#studioSlimSlider').val(20).trigger('input');
        } else if (preset === 'cool') {
            $('#studioSmoothSlider').val(40).trigger('input');
            $('#studioWhiteSlider').val(45).trigger('input');
            $('#studioRosySlider').val(10).trigger('input');
            $('#studioClaritySlider').val(30).trigger('input');
            $('#studioEyeSlider').val(15).trigger('input');
            $('#studioSlimSlider').val(25).trigger('input');
        } else if (preset === 'raw') {
            $('#studioSmoothSlider').val(0).trigger('input');
            $('#studioWhiteSlider').val(0).trigger('input');
            $('#studioRosySlider').val(0).trigger('input');
            $('#studioClaritySlider').val(0).trigger('input');
            $('#studioEyeSlider').val(0).trigger('input');
            $('#studioSlimSlider').val(0).trigger('input');
        }
        api.applyStudioBeautyPreview();
    });

    // Studio Beauty Sliders Live Input
    $(document).on('input', '#studioSmoothSlider', function () {
        const val = $(this).val();
        $('#valStudioSmooth').text(val + '%');
        config.beauty = config.beauty || {};
        config.beauty.default_smooth = parseInt(val, 10);
        api.applyStudioBeautyPreview();
    });

    $(document).on('input', '#studioWhiteSlider', function () {
        const val = $(this).val();
        $('#valStudioWhite').text(val + '%');
        config.beauty = config.beauty || {};
        config.beauty.default_white = parseInt(val, 10);
        api.applyStudioBeautyPreview();
    });

    $(document).on('input', '#studioRosySlider', function () {
        const val = $(this).val();
        $('#valStudioRosy').text(val + '%');
        config.beauty = config.beauty || {};
        config.beauty.default_rosy = parseInt(val, 10);
        api.applyStudioBeautyPreview();
    });

    $(document).on('input', '#studioClaritySlider', function () {
        const val = $(this).val();
        $('#valStudioClarity').text(val + '%');
        config.beauty = config.beauty || {};
        config.beauty.default_clarity = parseInt(val, 10);
        api.applyStudioBeautyPreview();
    });

    $(document).on('input', '#studioEyeSlider', function () {
        const val = $(this).val();
        $('#valStudioEye').text(val + '%');
        config.beauty = config.beauty || {};
        config.beauty.default_eye = parseInt(val, 10);
        api.applyStudioBeautyPreview();
    });

    $(document).on('input', '#studioSlimSlider', function () {
        const val = $(this).val();
        $('#valStudioSlim').text(val + '%');
        config.beauty = config.beauty || {};
        config.beauty.default_slim = parseInt(val, 10);
        api.applyStudioBeautyPreview();
    });

    $(document).on('click', '#btnResetStudioBeauty', function (e) {
        e.preventDefault();
        $('.wb-preset-pill').removeClass('active');
        $('.wb-preset-pill[data-preset="natural"]').addClass('active');
        $('#studioSmoothSlider').val(30).trigger('input');
        $('#studioWhiteSlider').val(25).trigger('input');
        $('#studioRosySlider').val(20).trigger('input');
        $('#studioClaritySlider').val(15).trigger('input');
        $('#studioEyeSlider').val(15).trigger('input');
        $('#studioSlimSlider').val(15).trigger('input');
        api.applyStudioBeautyPreview();
    });

    // Studio Filter Item Click -> Real-Time WYSIWYG Camera Preview
    $(document).on('click', '.wb-filter-item', function (e) {
        e.preventDefault();
        $('.wb-filter-item').removeClass('active');
        $(this).addClass('active');

        const filter = $(this).data('filter') || 'plain';
        imgFilter = filter;
        api.applyStudioBeautyPreview();
    });

    // Stage 3.6: Custom Countdown Dropdown Handler
    $(document).on('change', '#studioCountdownSelect', function () {
        const val = parseInt($(this).val(), 10) || 3;
        config.picture = config.picture || {};
        config.picture.cntdwn_time = val;
        localStorage.setItem('photobooth_custom_countdown', val);
        photoboothTools.console.logDev('Studio Custom Countdown set to: ' + val + 's');
    });

    // Stage 3.5: Studio AI Template Gender and Category Cascade Filtering
    api.filterStudioAiTemplates = function (sex, cat) {
        sex = sex || 'all';
        cat = cat || 'all';

        $('#studioAiTplGrid .wb-tpl-card').each(function () {
            const cardSex = $(this).data('sex') || 'unisex';
            const cardCat = $(this).data('cat') || '';

            const matchSex = (sex === 'all' || cardSex === sex || cardSex === 'unisex');
            const matchCat = (cat === 'all' || cardCat === cat);

            $(this).toggle(matchSex && matchCat);
        });

        // Ensure active card is visible, else activate first visible card
        const currentActive = $('#studioAiTplGrid .wb-tpl-card.active:visible');
        if (!currentActive.length) {
            const firstVisible = $('#studioAiTplGrid .wb-tpl-card:visible').first();
            if (firstVisible.length) {
                firstVisible.trigger('click');
            }
        }
    };

    $(document).on('click', '#studioAiGenderPills .wb-gender-pill', function (e) {
        e.preventDefault();
        $('#studioAiGenderPills .wb-gender-pill').removeClass('active');
        $(this).addClass('active');

        const selectedSex = $(this).data('sex') || 'all';
        const selectedCat = $('#studioAiCatPills .wb-pill.active').data('cat') || 'all';
        api.filterStudioAiTemplates(selectedSex, selectedCat);
    });

    $(document).on('click', '#studioAiCatPills .wb-pill', function (e) {
        e.preventDefault();
        $('#studioAiCatPills .wb-pill').removeClass('active');
        $(this).addClass('active');

        const selectedCat = $(this).data('cat') || 'all';
        const selectedSex = $('#studioAiGenderPills .wb-gender-pill.active').data('sex') || 'all';
        api.filterStudioAiTemplates(selectedSex, selectedCat);
    });

    // Studio AI Template Card Selection
    $(document).on('click', '#studioAiTplGrid .wb-tpl-card', function (e) {
        e.preventDefault();
        $('#studioAiTplGrid .wb-tpl-card').removeClass('active');
        $(this).addClass('active');

        const tplId = $(this).data('id');
        const tplTitle = $(this).data('title');
        const tplImage = $(this).data('image') || $(this).find('.wb-tpl-img').attr('src');

        window.selectedAiTemplate = {
            id: tplId,
            title: tplTitle,
            image: tplImage,
            path: tplImage
        };

        $('#studioCurrentTplName').text(tplTitle);
        if (tplImage) {
            $('#studioCurrentTplThumb').attr('src', tplImage).show();
        }
    });

    // Studio Upload Custom AI Template
    $(document).on('click', '#btnStudioUploadAiTemplate', function (e) {
        e.preventDefault();
        $('#studioAiTemplateUploadInput').trigger('click');
    });

    $(document).on('change', '#studioAiTemplateUploadInput', function () {
        if (!this.files || !this.files[0]) {
            return;
        }
        const file = this.files[0];
        const formData = new FormData();
        formData.append('template', file);

        photoboothTools.ajaxWithCsrf({
            url: environment.publicFolders.api + '/uploadAiTemplate.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false
        }).done((res) => {
            if (res && res.success) {
                const newCard = $(`
                    <div class="wb-tpl-card active" data-id="${res.id}" data-cat="custom" data-title="${res.title}" data-image="${res.path}" role="button" tabindex="0">
                        <div class="wb-tpl-thumb-box">
                            <img src="${res.path}" alt="${res.title}" class="wb-tpl-img">
                            <span class="wb-tpl-chip" style="background:#8B5CF6;color:#fff;">自定义</span>
                            <div class="wb-tpl-check"><i class="fa fa-circle-check"></i></div>
                        </div>
                        <div class="wb-tpl-meta">
                            <div class="wb-tpl-title">${res.title}</div>
                            <div class="wb-tpl-tags"><span class="tag-sex">自定义</span><span class="tag-feat">最新</span></div>
                        </div>
                    </div>
                `);
                $('#studioAiTplGrid .wb-tpl-card').removeClass('active');
                $('#studioAiTplGrid').prepend(newCard);
                window.selectedAiTemplate = {
                    id: res.id,
                    title: res.title,
                    image: res.path,
                    path: res.path
                };
                $('#studioCurrentTplName').text(res.title);
                $('#studioCurrentTplThumb').attr('src', res.path).show();
                $('[data-cat="all"]').trigger('click');
            } else {
                alert(res.error || '上传模板失败，请检查图片格式');
            }
        }).fail(() => {
            alert('网络异常，上传模板失败');
        });
    });

    // Classic Studio Layout Mode Chips
    $(document).on('click', '#btnStudioModeSingle', function (e) {
        e.preventDefault();
        $('.wb-layout-chip').removeClass('active');
        $(this).addClass('active');
        window.studioClassicLayout = 'single';
    });

    $(document).on('click', '#btnStudioModeBurst', function (e) {
        e.preventDefault();
        $('.wb-layout-chip').removeClass('active');
        $(this).addClass('active');
        window.studioClassicLayout = 'burst';
    });

    // Classic Background Template Selection
    $(document).on('click', '#studioClassicTplGrid .wb-classic-card', function (e) {
        e.preventDefault();
        $('#studioClassicTplGrid .wb-classic-card').removeClass('active');
        $(this).addClass('active');

        const title = $(this).data('title');
        const img = $(this).data('image');
        window.selectedClassicTemplate = {
            id: $(this).data('id'),
            title: title,
            image: img
        };
        $('#studioCurrentTplName').text(title);
        $('#studioCurrentTplThumb').attr('src', img).show();
    });

    // Classic Background Upload
    $(document).on('click', '#btnStudioUploadBgTemplate', function (e) {
        e.preventDefault();
        $('#studioBgTemplateUploadInput').trigger('click');
    });

    $(document).on('change', '#studioBgTemplateUploadInput', function () {
        if (!this.files || !this.files[0]) return;
        const file = this.files[0];
        const formData = new FormData();
        formData.append('template', file);

        photoboothTools.ajaxWithCsrf({
            url: environment.publicFolders.api + '/uploadTemplate.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false
        }).done((res) => {
            if (res && res.success) {
                const newCard = $(`
                    <div class="wb-classic-card active" data-id="${res.id}" data-title="${res.title}" data-image="${res.path}" role="button" tabindex="0">
                        <div class="wb-classic-thumb-box">
                            <img src="${res.path}" alt="${res.title}" class="wb-classic-img">
                            <div class="wb-tpl-check"><i class="fa fa-circle-check"></i></div>
                        </div>
                        <div class="wb-classic-name">${res.title}</div>
                    </div>
                `);
                $('#studioClassicTplGrid .wb-classic-card').removeClass('active');
                $('#studioClassicTplGrid').prepend(newCard);
                window.selectedClassicTemplate = { id: res.id, title: res.title, image: res.path };
                $('#studioCurrentTplName').text(res.title);
                $('#studioCurrentTplThumb').attr('src', res.path).show();
            } else {
                alert(res.error || '上传背景失败');
            }
        });
    });

    // Studio "完成 · 开始拍照" Done & Capture Button
    $(document).on('click', '#btnStudioDoneCapture', function (e) {
        e.preventDefault();

        // Synchronize selected countdown time
        const customSec = parseInt($('#studioCountdownSelect').val() || localStorage.getItem('photobooth_custom_countdown') || 3, 10);
        if (customSec >= 1 && customSec <= 10) {
            config.picture = config.picture || {};
            config.picture.cntdwn_time = customSec;
            localStorage.setItem('photobooth_custom_countdown', customSec);
        }

        if (window.photoboothMode === 'classic' && window.studioClassicLayout === 'burst') {
            studioPage.removeClass('stage--active');
            $('body').removeClass('mode--studio');
            $('#btnClassicBurst').trigger('click');
            return;
        }

        // Trigger capture for Single Photo (Classic or AI Swap)
        studioPage.removeClass('stage--active');
        $('body').removeClass('mode--studio');
        if (typeof window.rembgReset === 'function') {
            window.rembgReset();
        }
        api.thrill(PhotoStyle.PHOTO);
    });

    // Comparison with original snap (Hold/Click to compare)
    $(document).on('mousedown touchstart', '#btnAiCompareSnap', function (e) {
        e.preventDefault();
        if (window.lastAiSourceFile) {
            const srcUrl = environment.publicFolders.images + '/' + window.lastAiSourceFile;
            resultPage.css('--stage-background-image', `url("${srcUrl}")`);
            $(this).addClass('active').find('span').text('松开恢复变身');
        }
    });

    $(document).on('mouseup mouseleave touchend', '#btnAiCompareSnap', function (e) {
        e.preventDefault();
        if (window.lastAiSwapFile) {
            const swapUrl = environment.publicFolders.images + '/' + window.lastAiSwapFile;
            resultPage.css('--stage-background-image', `url("${swapUrl}")`);
            $(this).removeClass('active').find('span').text('查看原拍对比');
        }
    });

    // Change template or Retake from results page -> Return directly to Studio Page
    $(document).on('click', '#btnAiChangeTemplate', function (e) {
        e.preventDefault();
        api.enterStudio('ai_swap');
        $('#tabBtnTemplates').trigger('click');
    });

    $(document).on('click', '.stage--result .newpic', function (e) {
        e.preventDefault();
        api.enterStudio(window.photoboothMode || 'classic');
    });

    // Upload Custom AI Template
    $(document).on('click', '#btnUploadAiTemplate', function (e) {
        e.preventDefault();
        $('#aiTemplateUploadInput').trigger('click');
    });

    $(document).on('change', '#aiTemplateUploadInput', function () {
        if (!this.files || !this.files[0]) {
            return;
        }
        const file = this.files[0];
        const fileInput = this;

        const formData = new FormData();
        formData.append('template', file);

        if (window.photoboothTools && window.photoboothTools.overlay) {
            photoboothTools.overlay.showWaiting('正在上传自定义换脸模板，请稍候...');
        }

        $.ajax({
            url: 'api/uploadAiTemplate.php',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            dataType: 'json'
        }).done(function (data) {
            if (window.photoboothTools && window.photoboothTools.overlay) {
                photoboothTools.overlay.close();
            }
            if (data.success) {
                const newCardHtml = `
                    <div class="ai-template-card active" data-id="${data.id}" data-category="custom" data-title="${data.title}" data-image="${data.image}">
                        <div class="ai-tpl-badge" style="background:#FDE047; color:#854D0E;">⭐ 自定义</div>
                        <div class="ai-tpl-thumb-wrap">
                            <img class="ai-tpl-thumb" src="${data.image}" alt="${data.title}">
                        </div>
                        <div class="ai-tpl-info">
                            <div class="ai-tpl-name">${data.title}</div>
                            <div class="ai-tpl-tags"><span>用户上传</span><span>个性定制</span></div>
                        </div>
                        <div class="ai-tpl-selected-check"><i class="fa fa-circle-check"></i></div>
                    </div>
                `;
                $('.ai-template-card').removeClass('active');
                $('#aiTemplateGrid').prepend(newCardHtml);

                // Switch to custom tab or show it
                $('.ai-cat-tab').removeClass('active');
                $('.ai-cat-tab[data-category="custom"]').addClass('active');
                $('.ai-template-card').each(function () {
                    if ($(this).data('category') === 'custom') {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });

                // Activate selected
                window.selectedAiTemplate = {
                    id: data.id,
                    title: data.title,
                    category: 'custom',
                    image: data.image
                };
                $('#aiCurrentTemplateName').text(data.title);
                $('#aiCurrentTemplateThumb').attr('src', data.image).show();

                if (window.photoboothTools && window.photoboothTools.overlay) {
                    photoboothTools.overlay.showSuccess('自定义模板导入成功！已自动为您选中。', 2000);
                }
            } else {
                alert('模板上传失败: ' + (data.error || '未知错误'));
            }
        }).fail(function (xhr, status, error) {
            if (window.photoboothTools && window.photoboothTools.overlay) {
                photoboothTools.overlay.close();
            }
            alert('模板上传网络请求失败: ' + error);
        }).always(function () {
            fileInput.value = '';
        });
    });

    // ========================================================
    // Stage 4: Burst Mode & Selection Workbench Controller
    // ========================================================
    window.burstModeActive = false;
    window.burstPhotos = [];
    window.burstTotalShots = 6;
    window.burstCurrentShot = 0;
    window.burstRetakeIndex = -1;
    window.burstSelectedIndices = [0, 1, 2, 3];
    window.burstLayout = '1x4_strip';
    window.burstTheme = 'white';

    api.startBurstShot = function (shotIndex) {
        loaderMessage.html(
            '<div style="text-align:center;">' +
            '<h2 style="font-size:2.2rem;color:#FBBF24;margin-bottom:0.5rem;"><i class="fa fa-film"></i> 连拍进行中</h2>' +
            '<p style="font-size:1.3rem;color:#FFF;">正在抓拍第 <strong style="color:#F472B6;font-size:1.8rem;">' + (shotIndex + 1) + '</strong> / ' + window.burstTotalShots + ' 张</p>' +
            '</div>'
        );
        api.thrill(PhotoStyle.PHOTO);
    };

    api.renderBurstWorkbench = function () {
        loader.removeClass('stage--active');
        startPage.removeClass('stage--active');
        resultPage.removeClass('stage--active');

        const grid = $('#burstWorkbenchGrid');
        grid.empty();

        window.burstPhotos.forEach((file, idx) => {
            const isSelected = window.burstSelectedIndices.includes(idx);
            const orderIndex = window.burstSelectedIndices.indexOf(idx);
            const badgeText = isSelected ? (orderIndex + 1) : '+';
            const selectedClass = isSelected ? 'selected' : '';
            const imgUrl = environment.publicFolders.images + '/' + file + '?v=' + Date.now();

            const card = $(`
                <div class="burst-item-card ${selectedClass}" data-index="${idx}">
                    <div class="burst-item-thumb-wrap">
                        <img class="burst-item-thumb" src="${imgUrl}" alt="Shot ${idx + 1}" />
                        <div class="burst-order-badge">${badgeText}</div>
                    </div>
                    <div class="burst-item-toolbar">
                        <span class="burst-item-label">第 ${idx + 1} 张</span>
                        <button type="button" class="btn-retake-shot" data-index="${idx}" title="重新拍摄此张">
                            <i class="fa fa-camera-rotate"></i> 仅重拍
                        </button>
                    </div>
                </div>
            `);
            grid.append(card);
        });

        $('#burstSelectedCount').text(`已选 ${window.burstSelectedIndices.length} / 4 张`);
        $('#burstWorkbenchModal').fadeIn(200);
    };

    // Trigger Burst Shoot from Card A
    $(document).on('click', '#btnClassicBurst', function (e) {
        e.preventDefault();
        api.setPhotoboothMode('classic');
        window.burstModeActive = true;
        window.burstPhotos = [];
        window.burstCurrentShot = 0;
        window.burstRetakeIndex = -1;
        window.burstSelectedIndices = [0, 1, 2, 3];
        $('#burstWorkbenchModal').hide();
        api.startBurstShot(0);
    });

    // Select / Deselect Card in Burst Workbench
    $(document).on('click', '.burst-item-card', function (e) {
        if ($(e.target).closest('.btn-retake-shot').length > 0) return;
        const idx = parseInt($(this).data('index'), 10);
        const pos = window.burstSelectedIndices.indexOf(idx);

        if (pos >= 0) {
            // Already selected, allow deselect if > 1
            if (window.burstSelectedIndices.length > 1) {
                window.burstSelectedIndices.splice(pos, 1);
            }
        } else {
            // Not selected, add to selection up to 4
            if (window.burstSelectedIndices.length < 4) {
                window.burstSelectedIndices.push(idx);
            } else {
                // If 4 already selected, replace the last one
                window.burstSelectedIndices[3] = idx;
            }
        }
        api.renderBurstWorkbench();
    });

    // Single Retake (局部单张重拍 - Stage 4.2)
    $(document).on('click', '.btn-retake-shot', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const retakeIdx = parseInt($(this).data('index'), 10);
        window.burstRetakeIndex = retakeIdx;

        $('#burstWorkbenchModal').fadeOut(150, function () {
            loaderMessage.html(
                '<div style="text-align:center;">' +
                '<h2 style="font-size:2.2rem;color:#F59E0B;margin-bottom:0.5rem;"><i class="fa fa-camera-rotate"></i> 局部重拍模式</h2>' +
                '<p style="font-size:1.3rem;color:#FFF;">正在重拍第 <strong style="color:#F472B6;">' + (retakeIdx + 1) + '</strong> 张，请准备！</p>' +
                '</div>'
            );
            api.thrill(PhotoStyle.PHOTO);
        });
    });

    // Layout Selector
    $(document).on('click', '.burst-layout-btn', function (e) {
        e.preventDefault();
        $('.burst-layout-btn').removeClass('active');
        $(this).addClass('active');
        window.burstLayout = $(this).data('layout');
    });

    // Theme Selector
    $(document).on('click', '.burst-theme-pill', function (e) {
        e.preventDefault();
        $('.burst-theme-pill').removeClass('active');
        $(this).addClass('active');
        window.burstTheme = $(this).data('theme');
    });

    // Restart Whole Burst Group
    $(document).on('click', '#btnBurstRestart', function (e) {
        e.preventDefault();
        if (confirm('确定作废整组照片并重新连拍 6 张吗？')) {
            $('#burstWorkbenchModal').fadeOut(150, function () {
                $('#btnClassicBurst').trigger('click');
            });
        }
    });

    // Close Workbench Modal
    $(document).on('click', '#btnBurstClose, #burstWorkbenchBackdrop', function (e) {
        e.preventDefault();
        $('#burstWorkbenchModal').fadeOut(150);
        window.burstModeActive = false;
        startPage.addClass('stage--active');
    });

    // Generate 300DPI Collage Print (Stage 4.3)
    $(document).on('click', '#btnGenerateCollage', function (e) {
        e.preventDefault();
        if (window.burstSelectedIndices.length < 4) {
            alert('请先选择 4 张照片用于四格相纸排版！');
            return;
        }

        const chosenFiles = window.burstSelectedIndices.map(i => window.burstPhotos[i]);
        if (window.photoboothTools && window.photoboothTools.overlay) {
            photoboothTools.overlay.showWaiting('正在极速生成 300DPI 人生四格相纸，请稍候...');
        }

        $.ajax({
            url: environment.publicFolders.api + '/createCollageGrid.php',
            type: 'POST',
            data: {
                images: chosenFiles,
                layout: window.burstLayout || '1x4_strip',
                theme: window.burstTheme || 'white',
                title: 'PHOTOBOOTH MEMORY · 自拍纪念'
            },
            dataType: 'json'
        }).done(function (data) {
            if (window.photoboothTools && window.photoboothTools.overlay) {
                photoboothTools.overlay.close();
            }
            if (data && data.success) {
                $('#burstWorkbenchModal').fadeOut(150);
                window.burstModeActive = false;
                api.renderPic(data.file, data.images);
            } else {
                alert('拼版相纸生成失败: ' + (data.error || '未知错误'));
            }
        }).fail(function (xhr, status, error) {
            if (window.photoboothTools && window.photoboothTools.overlay) {
                photoboothTools.overlay.close();
            }
            alert('拼版相纸生成请求失败: ' + error);
        });
    });

    // ========================================================
    // Stage 5.3: Commercial Pay Gate & QR Code Unlock Controller
    // ========================================================
    window.payGateActiveOrderId = null;
    window.payGateTimer = null;
    window.payGateSuccessCallback = null;

    api.openPaymentGate = function (mode, callback) {
        window.payGateSuccessCallback = callback;
        $.ajax({
            url: 'api/paymentGate.php',
            type: 'POST',
            data: { action: 'create', mode: mode },
            dataType: 'json'
        }).done(function (data) {
            if (data && data.success) {
                window.payGateActiveOrderId = data.order_id;
                $('#payGateAmount').text(data.amount);
                $('#payGateModeTitle').text(data.mode_name);
                $('#payQrWx').attr('src', data.qr_wechat);
                $('#payQrAli').attr('src', data.qr_alipay);

                let timeLeft = 120;
                $('#payTimerVal').text(timeLeft);
                clearInterval(window.payGateTimer);
                window.payGateTimer = setInterval(function () {
                    timeLeft--;
                    $('#payTimerVal').text(timeLeft);
                    if (timeLeft <= 0) {
                        clearInterval(window.payGateTimer);
                        $('#payGateModal').fadeOut(150);
                    }
                }, 1000);

                $('#payGateModal').fadeIn(200);
            }
        });
    };

    $(document).on('click', '#btnPayMockSuccess', function (e) {
        e.preventDefault();
        if (!window.payGateActiveOrderId) return;
        $.ajax({
            url: 'api/paymentGate.php?action=mock_pay',
            type: 'POST',
            data: { order_id: window.payGateActiveOrderId },
            dataType: 'json'
        }).done(function (res) {
            if (res && res.success) {
                clearInterval(window.payGateTimer);
                $('#payGateModal').fadeOut(150, function () {
                    if (window.photoboothTools && window.photoboothTools.overlay) {
                        photoboothTools.overlay.showSuccess('支付成功！已开闸，开始拍照...', 1500);
                    }
                    if (typeof window.payGateSuccessCallback === 'function') {
                        window.payGateSuccessCallback();
                    }
                });
            }
        });
    });

    $(document).on('click', '#btnPayGateClose, #payGateBackdrop', function (e) {
        e.preventDefault();
        clearInterval(window.payGateTimer);
        $('#payGateModal').fadeOut(150);
    });

    return api;
})();

$(function () {
    photoBooth.init();
});
