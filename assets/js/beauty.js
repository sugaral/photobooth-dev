"use strict";

/* Photobooth AI Real-time Parameterized Beauty Retouching System */
/* globals photoboothTools */
(function ($) {
  'use strict';

  // State variables
  var currentPreviewUrl = '';
  var currentBaseFile = '';
  var isDrawerOpen = false;
  var previewRequestId = 0;
  var previewDebounceTimer = null;
  var configDebounceTimer = null;
  var isApplyingBake = false;
  var applyRequestId = 0;
  var applyRequest = null;
  var doneButtonHtml = null;
  function finishApply(requestId) {
    if (requestId !== applyRequestId) return;
    isApplyingBake = false;
    applyRequest = null;
    if (doneButtonHtml !== null) $('#btnBeautyDone').html(doneButtonHtml);
    $('#btnBeautyDone, #btnBeautyReset, #beautyModal input').prop('disabled', false);
  }

  // Default configuration values
  var defaultBeautyConfig = {
    enabled: true,
    auto_apply: true,
    default_eye: 15,
    default_slim: 15,
    default_smooth: 20,
    default_white: 15,
    default_rosy: 20,
    default_clarity: 15
  };
  window.defaultBeautyConfig = defaultBeautyConfig;
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
  function getCleanBaseName(rawName) {
    if (!rawName) return '';
    var name = String(rawName).trim();
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
    var resultPage = $('.stage[data-stage="result"]');
    if (!resultPage.length || !url) return;
    resultPage.css('--stage-background-image', 'url("' + url + '")');
    if (resultPage[0]) {
      resultPage[0].style.setProperty('--stage-background-image', 'url("' + url + '")');
    }
  }
  function resolveCurrentFile() {
    var resultPage = $('.stage[data-stage="result"]');
    var file = '';

    // 1. Check window.api.filename
    if (window.api && window.api.filename) {
      file = window.api.filename;
    }

    // 2. Check resultPage data attributes
    if (!file && resultPage.length) {
      file = resultPage.attr('data-img') || resultPage.attr('data-camera-img') || resultPage.attr('data-original-img') || '';
    }

    // 3. Check CSS background url on result stage
    if (!file && resultPage.length) {
      var bg = resultPage.css('--stage-background-image') || resultPage.attr('style') || '';
      var match = bg.match(/url\(['"]?([^'"\)]+)['"]?\)/i);
      if (match && match[1]) {
        file = match[1];
      }
    }
    file = getCleanBaseName(file);
    return file;
  }

  /* ----------------------------------------------------
     Part 1: Quick Settings on Start Page
  ---------------------------------------------------- */
  function syncBeautyToRuntime(cfg) {
    if (typeof window.config !== 'object' || window.config === null) {
      window.config = {};
    }
    window.config.beauty = $.extend(window.config.beauty || {}, cfg);
    if (typeof config === 'object' && config !== null) {
      config.beauty = $.extend(config.beauty || {}, cfg);
    }
    var isEnabled = cfg.enabled !== false;
    var isAuto = isEnabled && cfg.auto_apply !== false;
    var eye = isAuto ? (cfg.default_eye !== undefined ? parseInt(cfg.default_eye, 10) : 15) : 0;
    var slim = isAuto ? (cfg.default_slim !== undefined ? parseInt(cfg.default_slim, 10) : 15) : 0;
    var smooth = isAuto ? (cfg.default_smooth !== undefined ? parseInt(cfg.default_smooth, 10) : 20) : 0;
    var white = isAuto ? (cfg.default_white !== undefined ? parseInt(cfg.default_white, 10) : 15) : 0;
    var rosy = isAuto ? (cfg.default_rosy !== undefined ? parseInt(cfg.default_rosy, 10) : 20) : 0;
    var clarity = isAuto ? (cfg.default_clarity !== undefined ? parseInt(cfg.default_clarity, 10) : 15) : 0;

    var studioSliders = $('#studioSmoothSlider, #studioWhiteSlider, #studioRosySlider, #studioClaritySlider, #studioEyeSlider, #studioSlimSlider');
    var studioPresets = $('.wb-preset-pill, #btnResetStudioBeauty');
    var beautySection = $('.wb-section--beauty');

    if (!isEnabled) {
      studioSliders.prop('disabled', true);
      studioPresets.prop('disabled', true);
      beautySection.addClass('is-disabled');
      if (!$('#badgeBeautyDisabled').length) {
        $('.wb-section--beauty .wb-section-title').append('<span id="badgeBeautyDisabled" class="wb-beauty-disabled-badge"><i class="fa fa-ban"></i> 已停用</span>');
      }
    } else {
      studioSliders.prop('disabled', false);
      studioPresets.prop('disabled', false);
      beautySection.removeClass('is-disabled');
      $('#badgeBeautyDisabled').remove();
    }

    // Update both the input sliders and the text percent displays
    if ($('#studioEyeSlider').length) {
      $('#studioEyeSlider').val(eye);
      $('#valStudioEye').text(eye + '%');
    }
    if ($('#studioSlimSlider').length) {
      $('#studioSlimSlider').val(slim);
      $('#valStudioSlim').text(slim + '%');
    }
    if ($('#studioSmoothSlider').length) {
      $('#studioSmoothSlider').val(smooth);
      $('#valStudioSmooth').text(smooth + '%');
    }
    if ($('#studioWhiteSlider').length) {
      $('#studioWhiteSlider').val(white);
      $('#valStudioWhite').text(white + '%');
    }
    if ($('#studioRosySlider').length) {
      $('#studioRosySlider').val(rosy);
      $('#valStudioRosy').text(rosy + '%');
    }
    if ($('#studioClaritySlider').length) {
      $('#studioClaritySlider').val(clarity);
      $('#valStudioClarity').text(clarity + '%');
    }

    // Update Preset Pills active status
    $('.wb-preset-pill').removeClass('active');
    if (smooth === 0 && white === 0 && rosy === 0 && clarity === 0 && eye === 0 && slim === 0) {
      $('.wb-preset-pill[data-preset="raw"]').addClass('active');
    } else if (smooth === 35 && white === 25 && rosy === 20 && clarity === 15 && eye === 15 && slim === 15) {
      $('.wb-preset-pill[data-preset="natural"]').addClass('active');
    } else if (smooth === 45 && white === 30 && rosy === 45 && clarity === 10 && eye === 25 && slim === 20) {
      $('.wb-preset-pill[data-preset="rosy"]').addClass('active');
    } else if (smooth === 40 && white === 45 && rosy === 10 && clarity === 30 && eye === 15 && slim === 25) {
      $('.wb-preset-pill[data-preset="cool"]').addClass('active');
    }

    if (window.api && typeof window.api.applyStudioBeautyPreview === 'function') {
      window.api.applyStudioBeautyPreview();
    }
  }
  window.syncBeautyToRuntime = syncBeautyToRuntime;

  function loadQuickSettingsBeauty(callback) {
    var autoApplyCb = $('#settingBeautyAutoApply');
    var slidersBox = $('#settingBeautySlidersBox');
    var hintEl = $('#settingBeautyHint');
    var eyeSlider = $('#settingBeautyEye');
    var slimSlider = $('#settingBeautySlim');
    var smoothSlider = $('#settingBeautySmooth');
    var whiteSlider = $('#settingBeautyWhite');
    var rosySlider = $('#settingBeautyRosy');
    var claritySlider = $('#settingBeautyClarity');
    var lblEye = $('#lblSettingBeautyEye');
    var lblSlim = $('#lblSettingBeautySlim');
    var lblSmooth = $('#lblSettingBeautySmooth');
    var lblWhite = $('#lblSettingBeautyWhite');
    var lblRosy = $('#lblSettingBeautyRosy');
    var lblClarity = $('#lblSettingBeautyClarity');

    $.ajax({
      url: getApiUrl('beautyConfig.php'),
      method: 'GET',
      dataType: 'json'
    }).done(function (res) {
      if (res && res.success) {
        defaultBeautyConfig = $.extend(defaultBeautyConfig, res);
        window.defaultBeautyConfig = defaultBeautyConfig;
        var isAuto = res.enabled !== false && res.auto_apply !== false;
        if (autoApplyCb.length) {
          autoApplyCb.prop('checked', isAuto);
          $('#settingBeautySlidersBox input').prop('disabled', !isAuto);
          if (isAuto) {
            slidersBox.show();
            if (hintEl.length) hintEl.html('<i class="fa fa-circle-check" style="color:#10b981;"></i> 默认美颜参数已生效 · 新拍照片自动同步初修');
          } else {
            slidersBox.hide();
            if (hintEl.length) hintEl.html('<i class="fa fa-circle-info" style="color:#94a3b8;"></i> 已停用美颜 · 拍照将保留原始生动镜头画面');
          }
          if (eyeSlider.length) { eyeSlider.val(res.default_eye); lblEye.text(res.default_eye + '%'); }
          if (slimSlider.length) { slimSlider.val(res.default_slim); lblSlim.text(res.default_slim + '%'); }
          if (smoothSlider.length) { smoothSlider.val(res.default_smooth); lblSmooth.text(res.default_smooth + '%'); }
          if (whiteSlider.length) { whiteSlider.val(res.default_white); lblWhite.text(res.default_white + '%'); }
          if (rosySlider.length) { rosySlider.val(res.default_rosy); lblRosy.text(res.default_rosy + '%'); }
          if (claritySlider.length) { claritySlider.val(res.default_clarity); lblClarity.text(res.default_clarity + '%'); }
        }
        syncBeautyToRuntime(res);
        if (typeof callback === 'function') callback(res);
      }
    });
  }
  window.loadQuickSettingsBeauty = loadQuickSettingsBeauty;

  function initQuickSettingsBeauty() {
    var autoApplyCb = $('#settingBeautyAutoApply');
    var slidersBox = $('#settingBeautySlidersBox');
    var hintEl = $('#settingBeautyHint');
    var eyeSlider = $('#settingBeautyEye');
    var slimSlider = $('#settingBeautySlim');
    var smoothSlider = $('#settingBeautySmooth');
    var whiteSlider = $('#settingBeautyWhite');
    var rosySlider = $('#settingBeautyRosy');
    var claritySlider = $('#settingBeautyClarity');
    var lblEye = $('#lblSettingBeautyEye');
    var lblSlim = $('#lblSettingBeautySlim');
    var lblSmooth = $('#lblSettingBeautySmooth');
    var lblWhite = $('#lblSettingBeautyWhite');
    var lblRosy = $('#lblSettingBeautyRosy');
    var lblClarity = $('#lblSettingBeautyClarity');
    if (!autoApplyCb.length) return;

    loadQuickSettingsBeauty();

    function saveConfigToServer() {
      if (configDebounceTimer) {
        clearTimeout(configDebounceTimer);
      }
      configDebounceTimer = setTimeout(function () {
        configDebounceTimer = null;
        var isChecked = autoApplyCb.is(':checked');
        var payload = {
          enabled: isChecked,
          auto_apply: isChecked,
          default_eye: parseInt(eyeSlider.val(), 10) || 0,
          default_slim: parseInt(slimSlider.val(), 10) || 0,
          default_smooth: parseInt(smoothSlider.val(), 10) || 0,
          default_white: parseInt(whiteSlider.val(), 10) || 0,
          default_rosy: rosySlider.length ? (parseInt(rosySlider.val(), 10) || 0) : 0,
          default_clarity: claritySlider.length ? (parseInt(claritySlider.val(), 10) || 0) : 0
        };
        defaultBeautyConfig = $.extend(defaultBeautyConfig, payload);
        window.defaultBeautyConfig = defaultBeautyConfig;
        syncBeautyToRuntime(payload);
        $.ajax({
          url: getApiUrl('beautyConfig.php'),
          method: 'POST',
          data: JSON.stringify(payload),
          contentType: 'application/json; charset=utf-8',
          dataType: 'json'
        }).done(function (res) {
          if (res && res.success && hintEl.length) {
            hintEl.html(isChecked
              ? '<i class="fa fa-circle-check" style="color:#10b981;"></i> 默认美颜参数已生效 · 新拍照片自动同步初修'
              : '<i class="fa fa-circle-info" style="color:#94a3b8;"></i> 已停用美颜 · 拍照将保留原始生动镜头画面');
          }
        });
      }, 300);
    }
    autoApplyCb.on('change', function () {
      var isChecked = $(this).is(':checked');
      $('#settingBeautySlidersBox input').prop('disabled', !isChecked);
      if (isChecked) {
        slidersBox.slideDown(200);
        if (hintEl.length) hintEl.html('<i class="fa fa-circle-check" style="color:#10b981;"></i> 默认美颜参数已生效 · 新拍照片自动同步初修');
      } else {
        slidersBox.slideUp(200);
        if (hintEl.length) hintEl.html('<i class="fa fa-circle-info" style="color:#94a3b8;"></i> 已停用美颜 · 拍照将保留原始生动镜头画面');
      }
      var payload = {
        enabled: isChecked,
        auto_apply: isChecked,
        default_eye: parseInt(eyeSlider.val(), 10) || 0,
        default_slim: parseInt(slimSlider.val(), 10) || 0,
        default_smooth: parseInt(smoothSlider.val(), 10) || 0,
        default_white: parseInt(whiteSlider.val(), 10) || 0,
        default_rosy: rosySlider.length ? (parseInt(rosySlider.val(), 10) || 0) : 0,
        default_clarity: claritySlider.length ? (parseInt(claritySlider.val(), 10) || 0) : 0
      };
      defaultBeautyConfig = $.extend(defaultBeautyConfig, payload);
      window.defaultBeautyConfig = defaultBeautyConfig;
      syncBeautyToRuntime(payload);
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
    if (rosySlider.length) {
      rosySlider.on('input', function () {
        lblRosy.text($(this).val() + '%');
        saveConfigToServer();
      });
    }
    if (claritySlider.length) {
      claritySlider.on('input', function () {
        lblClarity.text($(this).val() + '%');
        saveConfigToServer();
      });
    }
  }

  /* ----------------------------------------------------
     Part 2: Real-time Beauty Drawer on Result Screen
  ---------------------------------------------------- */
  function openBeautyDrawer() {
    console.log('[Beauty] openBeautyDrawer invoked');
    var modal = $('#beautyModal');
    if (!modal.length) {
      console.error('[Beauty] #beautyModal element not found');
      return;
    }
    var resultPage = $('.stage[data-stage="result"]');

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
    if (!currentBaseFile) {
      photoboothTools.showNotification('error', '没有可编辑的照片');
      return;
    }
    if (window.photoBooth) window.photoBooth.invalidateComposite();
    if (window.photoEditState) {
      window.photoEditState.sync(resultPage[0]);
      if (currentBaseFile) window.photoEditState.setCurrent(currentBaseFile);
    }
    console.log('[Beauty] Active file resolved for beauty:', currentBaseFile);
    if (currentBaseFile && currentBaseFile !== 'latest') {
      if (!resultPage.attr('data-original-img')) {
        resultPage.attr('data-original-img', currentBaseFile);
      }
      currentPreviewUrl = getImagesFolder() + '/' + currentBaseFile + '?v=' + Date.now();
    }

    // Open the drawer with silky smooth sliding animation
    modal.show().css('display', 'flex').attr('aria-hidden', 'false').addClass('active sidenav--open');
    isDrawerOpen = true;

    // Trigger immediate preview
    triggerBeautyPreview(true);
  }
  function closeBeautyDrawer() {
    console.log('[Beauty] closeBeautyDrawer invoked');
    var modal = $('#beautyModal');
    modal.removeClass('active sidenav--open').attr('aria-hidden', 'true');
    isDrawerOpen = false;
    previewRequestId++;
    applyRequestId++;
    if (applyRequest) applyRequest.abort();
    finishApply(applyRequestId);
    if (currentBaseFile) setStageImage(getImagesFolder() + '/' + currentBaseFile);
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
    if (isApplyingBake) return;
    var curRequestId = ++previewRequestId;
    var editRevision = window.photoEditState ? window.photoEditState.begin('beauty-preview') : 0;
    var delay = immediate ? 0 : 75;
    if (previewDebounceTimer) {
      clearTimeout(previewDebounceTimer);
    }
    previewDebounceTimer = setTimeout(function () {
      previewDebounceTimer = null;
      var targetFile = currentBaseFile || resolveCurrentFile();
      if (!targetFile || !isDrawerOpen) return;
      var eyeVal = parseFloat($('#sliderBeautyEye').val()) || 0;
      var slimVal = parseFloat($('#sliderBeautySlim').val()) || 0;
      var smoothVal = parseFloat($('#sliderBeautySmooth').val()) || 0;
      var whiteVal = parseFloat($('#sliderBeautyWhite').val()) || 0;
      var postData = {
        file: targetFile,
        action: 'preview',
        eye: eyeVal,
        slim: slimVal,
        smooth: smoothVal,
        white: whiteVal
      };
      photoboothTools.ajaxWithCsrf({
        url: getApiUrl('beautyProcess.php'),
        method: 'POST',
        data: postData,
        dataType: 'json',
        timeout: 10000
      }).done(function (res) {
        if (curRequestId !== previewRequestId) {
          return; // Stale response discarded
        }
        if (window.photoEditState && !window.photoEditState.isCurrent(editRevision)) return;
        if (res && res.success && res.preview_url) {
          currentPreviewUrl = res.preview_url;
          if (res.file && res.file !== currentBaseFile) {
            currentBaseFile = res.file;
          }

          // In-memory preloader: zero screen flash
          var preloader = new Image();
          preloader.onload = function () {
            if (curRequestId !== previewRequestId || !isDrawerOpen || window.photoEditState && !window.photoEditState.isCurrent(editRevision)) return;
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
    var targetFile = currentBaseFile || resolveCurrentFile();
    if (!targetFile) return;
    clearTimeout(previewDebounceTimer);
    previewRequestId++;
    isApplyingBake = true;
    var requestId = ++applyRequestId;
    var btnDone = $('#btnBeautyDone');
    if (doneButtonHtml === null) doneButtonHtml = btnDone.html();
    $('#btnBeautyReset, #beautyModal input').prop('disabled', true);
    btnDone.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> <span>正在烘焙...</span>');
    var editRevision = window.photoEditState ? window.photoEditState.begin('beauty') : 0;
    var eyeVal = parseFloat($('#sliderBeautyEye').val()) || 0;
    var slimVal = parseFloat($('#sliderBeautySlim').val()) || 0;
    var smoothVal = parseFloat($('#sliderBeautySmooth').val()) || 0;
    var whiteVal = parseFloat($('#sliderBeautyWhite').val()) || 0;
    applyRequest = photoboothTools.ajaxWithCsrf({
      url: getApiUrl('beautyProcess.php'),
      method: 'POST',
      data: {
        file: targetFile,
        source_file: targetFile,
        action: 'apply',
        eye: eyeVal,
        slim: slimVal,
        smooth: smoothVal,
        white: whiteVal
      },
      dataType: 'json',
      timeout: 25000
    }).done(function (res) {
      if (requestId !== applyRequestId) return;
      if (!isDrawerOpen || window.photoEditState && !window.photoEditState.isCurrent(editRevision)) {
        finishApply(requestId);
        return;
      }
      if (res && res.success && res.url && res.file) {
        var finalUrl = res.url;
        var resultPage = $('.stage[data-stage="result"]');

        // Preload final baked image
        var preloader = new Image();
        preloader.onload = function () {
          if (requestId !== applyRequestId) return;
          if (!isDrawerOpen || window.photoEditState && !window.photoEditState.isCurrent(editRevision)) {
            finishApply(requestId);
            return;
          }
          currentBaseFile = res.file;
          setStageImage(finalUrl);
          resultPage.attr('data-img', res.file);
          resultPage.attr('data-original-img', resultPage.attr('data-original-img') || res.file);
          if (window.photoEditState) {
            window.photoEditState.setCurrent(res.file);
            window.photoEditState.beauty = {
              eye: eyeVal,
              slim: slimVal,
              smooth: smoothVal,
              white: whiteVal
            };
          }
          if (window.photoBooth) window.photoBooth.setBaseImage(res.file);
          closeBeautyDrawer();
          if (window.photoboothTools && window.photoboothTools.showNotification) {
            photoboothTools.showNotification('success', 'AI 美颜效果已保存！');
          }
        };
        preloader.onerror = function () {
          if (requestId !== applyRequestId) return;
          finishApply(requestId);
          if (!window.photoEditState || window.photoEditState.isCurrent(editRevision)) photoboothTools.showNotification('error', '美颜成片加载失败，请重试');
        };
        preloader.src = finalUrl;
      } else {
        finishApply(requestId);
        var err = res && res.error ? res.error : '保存美颜失败';
        if (window.photoboothTools && window.photoboothTools.showNotification) {
          photoboothTools.showNotification('error', err);
        } else {
          alert(err);
        }
      }
    }).fail(function (xhr, status, error) {
      if (requestId !== applyRequestId) return;
      finishApply(requestId);
      if (status === 'abort') return;
      var err = '网络请求失败：' + (error || status);
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
    currentBaseFile = '';
    currentPreviewUrl = '';
    isApplyingBake = false;
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

    // 5. Reset to default button
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
