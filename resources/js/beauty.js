/* Photobooth AI Real-time Parameterized Beauty Retouching System */
(function ($) {
    'use strict';

    // State variables
    let currentPreviewUrl = '';
    let originalRawUrl = '';
    let currentBaseFile = '';
    let isDrawerOpen = false;
    let previewRequestId = 0;
    let previewDebounceTimer = null;
    let configDebounceTimer = null;
    let isApplyingBake = false;

    // Default configuration values
    let defaultBeautyConfig = {
        enabled: true,
        auto_apply: true,
        default_eye: 15,
        default_slim: 15,
        default_smooth: 20,
        default_white: 15
    };

    function getApiUrl(endpoint) {
        if (typeof environment !== 'undefined' && environment.publicFolders && environment.publicFolders.api) {
            return environment.publicFolders.api + '/' + endpoint;
        }
        return 'api/' + endpoint;
    }

    function getImagesFolder() {
        if (typeof environment !== 'undefined' && environment.publicFolders && environment.publicFolders.images) {
            return environment.publicFolders.images;
        }
        return 'data/images';
    }

    function getTmpFolder() {
        if (typeof environment !== 'undefined' && environment.publicFolders && environment.publicFolders.tmp) {
            return environment.publicFolders.tmp;
        }
        return 'data/tmp';
    }

    function getCleanBaseName(rawName) {
        if (!rawName) return '';
        let name = String(rawName).trim();
        if (name.indexOf('/') !== -1 || name.indexOf('\\') !== -1) {
            name = name.split('/').pop().split('\\').pop();
        }
        if (name.indexOf('?') !== -1) {
            name = name.split('?')[0];
        }
        if (name.indexOf('orig_') === 0) {
            name = name.substring(5);
        }
        return name;
    }

    function setStageImage(url) {
        const resultPage = $('.stage[data-stage="result"]');
        if (!resultPage.length || !url) return;
        resultPage.css('--stage-background-image', 'url("' + url + '")');
        if (resultPage[0]) {
            resultPage[0].style.setProperty('--stage-background-image', 'url("' + url + '")');
        }
    }

    function resolveCurrentFile() {
        const resultPage = $('.stage[data-stage="result"]');
        let file = '';

        // 1. Check window.api.filename
        if (window.api && window.api.filename) {
            file = window.api.filename;
        }

        // 2. Check resultPage data attributes
        if (!file && resultPage.length) {
            file = resultPage.attr('data-img') ||
                   resultPage.attr('data-camera-img') ||
                   resultPage.attr('data-original-img') || '';
        }

        // 3. Check CSS background url on result stage
        if (!file && resultPage.length) {
            const bg = resultPage.css('--stage-background-image') || resultPage.attr('style') || '';
            const match = bg.match(/url\(['"]?([^'"\)]+)['"]?\)/i);
            if (match && match[1]) {
                file = match[1];
            }
        }

        file = getCleanBaseName(file);

        // 4. Default fallback: use 'latest' if no specific file resolved yet
        if (!file) {
            file = 'latest';
        }

        return file;
    }

    /* ----------------------------------------------------
       Part 1: Quick Settings on Start Page
    ---------------------------------------------------- */
    function initQuickSettingsBeauty() {
        const autoApplyCb = $('#settingBeautyAutoApply');
        const slidersBox = $('#settingBeautySlidersBox');
        const hintEl = $('#settingBeautyHint');

        const eyeSlider = $('#settingBeautyEye');
        const slimSlider = $('#settingBeautySlim');
        const smoothSlider = $('#settingBeautySmooth');
        const whiteSlider = $('#settingBeautyWhite');

        const lblEye = $('#lblSettingBeautyEye');
        const lblSlim = $('#lblSettingBeautySlim');
        const lblSmooth = $('#lblSettingBeautySmooth');
        const lblWhite = $('#lblSettingBeautyWhite');

        if (!autoApplyCb.length) return;

        // Load initial config from server
        $.ajax({
            url: getApiUrl('beautyConfig.php'),
            method: 'GET',
            dataType: 'json'
        }).done(function (res) {
            if (res && res.success) {
                defaultBeautyConfig = $.extend(defaultBeautyConfig, res);
                autoApplyCb.prop('checked', !!res.auto_apply);
                if (res.auto_apply) {
                    slidersBox.slideDown(200);
                } else {
                    slidersBox.slideUp(200);
                }
                eyeSlider.val(res.default_eye);
                lblEye.text(res.default_eye + '%');
                slimSlider.val(res.default_slim);
                lblSlim.text(res.default_slim + '%');
                smoothSlider.val(res.default_smooth);
                lblSmooth.text(res.default_smooth + '%');
                whiteSlider.val(res.default_white);
                lblWhite.text(res.default_white + '%');
            }
        });

        function saveConfigToServer() {
            if (configDebounceTimer) {
                clearTimeout(configDebounceTimer);
            }
            configDebounceTimer = setTimeout(function () {
                configDebounceTimer = null;
                const payload = {
                    enabled: true,
                    auto_apply: autoApplyCb.is(':checked'),
                    default_eye: parseInt(eyeSlider.val(), 10) || 0,
                    default_slim: parseInt(slimSlider.val(), 10) || 0,
                    default_smooth: parseInt(smoothSlider.val(), 10) || 0,
                    default_white: parseInt(whiteSlider.val(), 10) || 0
                };
                defaultBeautyConfig = $.extend(defaultBeautyConfig, payload);
                $.ajax({
                    url: getApiUrl('beautyConfig.php'),
                    method: 'POST',
                    data: JSON.stringify(payload),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                }).done(function (res) {
                    if (res && res.success && hintEl.length) {
                        hintEl.html('<i class="fa fa-circle-check" style="color:#10b981;"></i> 默认美颜参数已生效 · 新拍照片自动同步初修');
                    }
                });
            }, 300);
        }

        autoApplyCb.on('change', function () {
            if ($(this).is(':checked')) {
                slidersBox.slideDown(200);
            } else {
                slidersBox.slideUp(200);
            }
            saveConfigToServer();
        });

        eyeSlider.on('input', function () {
            lblEye.text($(this).val() + '%');
            saveConfigToServer();
        });

        slimSlider.on('input', function () {
            lblSlim.text($(this).val() + '%');
            saveConfigToServer();
        });

        smoothSlider.on('input', function () {
            lblSmooth.text($(this).val() + '%');
            saveConfigToServer();
        });

        whiteSlider.on('input', function () {
            lblWhite.text($(this).val() + '%');
            saveConfigToServer();
        });
    }

    /* ----------------------------------------------------
       Part 2: Real-time Beauty Drawer on Result Screen
    ---------------------------------------------------- */
    function openBeautyDrawer() {
        console.log('[Beauty] openBeautyDrawer invoked');
        const modal = $('#beautyModal');
        if (!modal.length) {
            console.error('[Beauty] #beautyModal element not found');
            return;
        }

        const resultPage = $('.stage[data-stage="result"]');

        // Restore normal background visibility if cutout mode was active
        resultPage.removeClass('cutout-mode-active');
        $('#stageCutoutViewport').hide();
        $('#stagePersonTransformBox, #stagePersonResizerBar, #stageTransformBox, #stageBgResizerBar').hide();

        // Close other conflicting drawers if open
        if ($('#rembgModal').length) {
            $('#rembgModal').removeClass('active sidenav--open');
        }
        if ($('#filternav').length) {
            $('#filternav').removeClass('sidenav--open active');
        }

        // Initialize slider values with current defaults
        $('#sliderBeautyEye').val(defaultBeautyConfig.default_eye || 15);
        $('#lblBeautyEye').text((defaultBeautyConfig.default_eye || 15) + '%');

        $('#sliderBeautySlim').val(defaultBeautyConfig.default_slim || 15);
        $('#lblBeautySlim').text((defaultBeautyConfig.default_slim || 15) + '%');

        $('#sliderBeautySmooth').val(defaultBeautyConfig.default_smooth || 20);
        $('#lblBeautySmooth').text((defaultBeautyConfig.default_smooth || 20) + '%');

        $('#sliderBeautyWhite').val(defaultBeautyConfig.default_white || 15);
        $('#lblBeautyWhite').text((defaultBeautyConfig.default_white || 15) + '%');

        // Resolve active photo
        currentBaseFile = resolveCurrentFile();
        console.log('[Beauty] Active file resolved for beauty:', currentBaseFile);

        if (currentBaseFile && currentBaseFile !== 'latest') {
            if (!resultPage.attr('data-original-img')) {
                resultPage.attr('data-original-img', currentBaseFile);
            }
            originalRawUrl = getTmpFolder() + '/orig_' + currentBaseFile + '?v=' + Date.now();
        }

        // Open the drawer with silky smooth sliding animation
        modal.show().css('display', 'flex').addClass('active sidenav--open');
        isDrawerOpen = true;

        // Trigger immediate preview
        triggerBeautyPreview(true);
    }

    function closeBeautyDrawer() {
        console.log('[Beauty] closeBeautyDrawer invoked');
        const modal = $('#beautyModal');
        modal.removeClass('active sidenav--open');
        isDrawerOpen = false;

        if (previewDebounceTimer) {
            clearTimeout(previewDebounceTimer);
            previewDebounceTimer = null;
        }

        setTimeout(function () {
            if (!modal.hasClass('active')) {
                modal.hide();
            }
        }, 350);
    }

    function triggerBeautyPreview(immediate) {
        const curRequestId = ++previewRequestId;
        const delay = immediate ? 0 : 75;

        if (previewDebounceTimer) {
            clearTimeout(previewDebounceTimer);
        }

        previewDebounceTimer = setTimeout(function () {
            previewDebounceTimer = null;

            const targetFile = currentBaseFile || resolveCurrentFile() || 'latest';
            const eyeVal = parseFloat($('#sliderBeautyEye').val()) || 0;
            const slimVal = parseFloat($('#sliderBeautySlim').val()) || 0;
            const smoothVal = parseFloat($('#sliderBeautySmooth').val()) || 0;
            const whiteVal = parseFloat($('#sliderBeautyWhite').val()) || 0;

            const postData = {
                file: targetFile,
                action: 'preview',
                eye: eyeVal,
                slim: slimVal,
                smooth: smoothVal,
                white: whiteVal
            };

            $.ajax({
                url: getApiUrl('beautyProcess.php'),
                method: 'POST',
                data: postData,
                dataType: 'json',
                timeout: 10000
            }).done(function (res) {
                if (curRequestId !== previewRequestId) {
                    return; // Stale response discarded
                }
                if (res && res.success && res.preview_url) {
                    currentPreviewUrl = res.preview_url;

                    if (res.file && res.file !== currentBaseFile) {
                        currentBaseFile = res.file;
                        originalRawUrl = getTmpFolder() + '/orig_' + currentBaseFile + '?v=' + Date.now();
                    }

                    // In-memory preloader: zero screen flash
                    const preloader = new Image();
                    preloader.onload = function () {
                        if (curRequestId !== previewRequestId) return;
                        setStageImage(currentPreviewUrl);
                    };
                    preloader.src = currentPreviewUrl;
                }
            }).fail(function (xhr, status) {
                console.warn('[Beauty] Preview request failed:', status);
            });
        }, delay);
    }

    function saveAndBakeBeauty() {
        if (isApplyingBake) return;
        isApplyingBake = true;

        const btnDone = $('#btnBeautyDone');
        const origDoneHtml = btnDone.html();
        btnDone.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> <span>正在烘焙...</span>');

        const targetFile = currentBaseFile || resolveCurrentFile() || 'latest';
        const eyeVal = parseFloat($('#sliderBeautyEye').val()) || 0;
        const slimVal = parseFloat($('#sliderBeautySlim').val()) || 0;
        const smoothVal = parseFloat($('#sliderBeautySmooth').val()) || 0;
        const whiteVal = parseFloat($('#sliderBeautyWhite').val()) || 0;

        $.ajax({
            url: getApiUrl('beautyProcess.php'),
            method: 'POST',
            data: {
                file: targetFile,
                action: 'apply',
                eye: eyeVal,
                slim: slimVal,
                smooth: smoothVal,
                white: whiteVal
            },
            dataType: 'json',
            timeout: 25000
        }).done(function (res) {
            btnDone.prop('disabled', false).html(origDoneHtml);
            isApplyingBake = false;

            if (res && res.success && res.url) {
                const finalUrl = res.url;
                const resultPage = $('.stage[data-stage="result"]');

                // Preload final baked image
                const preloader = new Image();
                preloader.onload = function () {
                    setStageImage(finalUrl);
                    resultPage.attr('data-img', res.file);
                    if (window.api) {
                        window.api.filename = res.file;
                    }
                    closeBeautyDrawer();
                    if (window.photoboothTools && window.photoboothTools.showNotification) {
                        photoboothTools.showNotification('success', 'AI 美颜效果已保存！');
                    }
                };
                preloader.src = finalUrl;
            } else {
                const err = (res && res.error) ? res.error : '保存美颜失败';
                if (window.photoboothTools && window.photoboothTools.showNotification) {
                    photoboothTools.showNotification('error', err);
                } else {
                    alert(err);
                }
            }
        }).fail(function (xhr, status, error) {
            btnDone.prop('disabled', false).html(origDoneHtml);
            isApplyingBake = false;
            const err = '网络请求失败：' + (error || status);
            if (window.photoboothTools && window.photoboothTools.showNotification) {
                photoboothTools.showNotification('error', err);
            } else {
                alert(err);
            }
        });
    }

    function resetBeautyToDefault() {
        $('#sliderBeautyEye').val(defaultBeautyConfig.default_eye || 15);
        $('#lblBeautyEye').text((defaultBeautyConfig.default_eye || 15) + '%');

        $('#sliderBeautySlim').val(defaultBeautyConfig.default_slim || 15);
        $('#lblBeautySlim').text((defaultBeautyConfig.default_slim || 15) + '%');

        $('#sliderBeautySmooth').val(defaultBeautyConfig.default_smooth || 20);
        $('#lblBeautySmooth').text((defaultBeautyConfig.default_smooth || 20) + '%');

        $('#sliderBeautyWhite').val(defaultBeautyConfig.default_white || 15);
        $('#lblBeautyWhite').text((defaultBeautyConfig.default_white || 15) + '%');

        triggerBeautyPreview(true);
    }

    // Global reset/control hooks
    window.beautyReset = function () {
        closeBeautyDrawer();
    };
    window.openBeautyDrawer = openBeautyDrawer;
    window.closeBeautyDrawer = closeBeautyDrawer;

    /* ----------------------------------------------------
       Part 3: Event Bindings Initialization
    ---------------------------------------------------- */
    $(document).ready(function () {
        console.log('[Beauty] beauty.js loaded and initialized');

        // 1. Initialize Quick Settings
        initQuickSettingsBeauty();

        // 2. Click on "AI美颜" button in result screen
        $(document).off('click.beautyOpen', '.beautybtn, [data-command="beautybtn"]').on('click.beautyOpen', '.beautybtn, [data-command="beautybtn"]', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Beauty] beautybtn clicked! Drawer active:', $('#beautyModal').hasClass('active'));
            if ($('#beautyModal').hasClass('active')) {
                closeBeautyDrawer();
            } else {
                openBeautyDrawer();
            }
        });

        // 3. Close drawer button
        $(document).off('click.beautyClose', '#btnBeautyClose').on('click.beautyClose', '#btnBeautyClose', function (e) {
            e.preventDefault();
            closeBeautyDrawer();
        });

        // 4. Slider real-time drag handlers
        $('#sliderBeautyEye').on('input', function () {
            $('#lblBeautyEye').text($(this).val() + '%');
            triggerBeautyPreview();
        });

        $('#sliderBeautySlim').on('input', function () {
            $('#lblBeautySlim').text($(this).val() + '%');
            triggerBeautyPreview();
        });

        $('#sliderBeautySmooth').on('input', function () {
            $('#lblBeautySmooth').text($(this).val() + '%');
            triggerBeautyPreview();
        });

        $('#sliderBeautyWhite').on('input', function () {
            $('#lblBeautyWhite').text($(this).val() + '%');
            triggerBeautyPreview();
        });

        // 5. Compare Button: Hold to see untouched raw original photo
        const compareBtn = $('#btnBeautyCompare');
        function showOriginal() {
            if (originalRawUrl) {
                compareBtn.addClass('is-comparing');
                setStageImage(originalRawUrl);
            }
        }
        function restorePreview() {
            compareBtn.removeClass('is-comparing');
            if (currentPreviewUrl) {
                setStageImage(currentPreviewUrl);
            }
        }

        compareBtn.on('mousedown touchstart', function (e) {
            e.preventDefault();
            showOriginal();
        });

        compareBtn.on('mouseup mouseleave touchend touchcancel', function (e) {
            e.preventDefault();
            restorePreview();
        });

        // 6. Reset to default button
        $('#btnBeautyReset').off('click.beautyReset').on('click.beautyReset', function (e) {
            e.preventDefault();
            resetBeautyToDefault();
        });

        // 7. Done button: Bake and save
        $('#btnBeautyDone').off('click.beautyDone').on('click.beautyDone', function (e) {
            e.preventDefault();
            saveAndBakeBeauty();
        });
    });

})(jQuery);
