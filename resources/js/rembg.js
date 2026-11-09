"use strict";

/* Photobooth AI Cutout, 60FPS Contour Flow, Click-to-Composite & Custom Template Resizer */
/* globals photoboothTools */
(function ($) {
  'use strict';

  function setMattingLoadingState(isLoading, engineName) {
    var stageResult = $('.stage[data-stage="result"]');
    var sidebarButtons = $('#resultSidebar .button, .result-sidebar .button');
    var rembgBtn = $('.rembgbtn, [data-command="rembgbtn"]');
    var loader = $('#stageMattingLoader');
    var engineHint = $('#stageMattingEngineHint');
    if (isLoading) {
      stageResult.addClass('stage-matting-locked');
      $('body').addClass('stage-matting-locked');
      rembgBtn.addClass('is-matting-loading');
      sidebarButtons.not('.rembgbtn, [data-command="rembgbtn"]').prop('disabled', true);
      if (engineHint.length) {
        engineHint.text('AI 人像发丝级精细抠图进行中...');
      }
      loader.addClass('is-active').show();
    } else {
      stageResult.removeClass('stage-matting-locked');
      $('body').removeClass('stage-matting-locked');
      rembgBtn.removeClass('is-matting-loading');
      sidebarButtons.prop('disabled', false);
      loader.removeClass('is-active').hide();
    }
  }
  window.rembgReset = function () {
    setMattingLoadingState(false);
    $('#rembgModal').removeClass('active sidenav--open').hide();
        $('#btnClassicCustomBg, .rembgbtn').removeClass('active is-drawer-open').attr('aria-expanded', 'false');
    $('#stageCutoutViewport').hide();
    $('#stagePersonTransformBox, #stagePersonResizerBar, #stageTransformBox, #stageBgResizerBar').hide();
    $('.stage[data-stage="result"]').removeClass('cutout-mode-active').removeAttr('data-original-img');
    isCutoutExtracted = false;
    cutoutPngUrl = '';
    baseOriginalName = '';
    currentTemplate = '';
    cutoutState = 'idle';
    latestCompositeFile = '';
    isProcessingTemplate = false;
    isCustomTemplateActive = false;
    isPersonActive = false;
    customScale = 1.0;
    customOffsetX = 0;
    customOffsetY = 0;
    personScale = 1.0;
    personOffsetX = 0;
    personOffsetY = 0;
    if (recompositeTimer) {
      clearTimeout(recompositeTimer);
      recompositeTimer = null;
    }
    if (personRecompositeTimer) {
      clearTimeout(personRecompositeTimer);
      personRecompositeTimer = null;
    }
    $('#stageCutoutPerson').removeClass('is-switching');
  };
  function getCleanOriginalName(rawName) {
    if (!rawName) return '';
    var name = String(rawName).trim();
    if (name.indexOf('/') !== -1 || name.indexOf('\\') !== -1) {
      name = name.split('/').pop().split('\\').pop();
    }
    if (name.indexOf('?') !== -1) {
      name = name.split('?')[0];
    }
    if (name.indexOf('_rembg_') !== -1) {
      name = name.split('_rembg_')[0] + '.jpg';
    }
    return name;
  }
  var currentTemplate = '';
  var baseOriginalName = '';
  var latestCompositeFile = '';
  var isCutoutExtracted = false;
  var cutoutPngUrl = '';
  var cutoutRequestId = 0;
  var cutoutState = 'idle';
  var isProcessingTemplate = false;
  var compositeRequestId = 0;
  var compositeRequest = null;
  var compositeDirty = false;
  var finalizeRequested = false;
  var selectedEngine = 'birefnet';

  // Custom template transform parameters
  var customScale = 1.0;
  var customOffsetX = 0;
  var customOffsetY = 0;
  var isCustomTemplateActive = false;
  var recompositeTimer = null;

  // Cutout person transform parameters
  var personScale = 1.0;
  var personOffsetX = 0;
  var personOffsetY = 0;
  var isPersonActive = false;
  var personRecompositeTimer = null;
  function notifyRembg(type, message) {
    if (window.photoboothTools && window.photoboothTools.showNotification) {
      window.photoboothTools.showNotification(type, message);
    }
  }
  function initRembg() {
    var modal = $('#rembgModal');
    var grid = $('#rembgTemplateGrid');
    var selectedNameEl = $('#rembgSelectedName');
    var uploadInput = $('#rembgTemplateUpload');
    var revertBtn = $('#btnRembgRevert');
    var closeBtn = $('#btnRembgClose');
    var cutoutViewport = $('#stageCutoutViewport');
    var cutoutBg = $('#stageCutoutBg');
    var cutoutPerson = $('#stageCutoutPerson');
    var personImg = $('#stagePersonImg');
    var contourCanvas = $('#stageContourCanvas');

    // Background template transform controls
    var transformBox = $('#stageTransformBox');
    var resizerBar = $('#stageBgResizerBar');
    var lblBgScaleVal = $('#lblBgScaleVal');
    var btnScaleMinus = $('#btnBgScaleMinus');
    var btnScalePlus = $('#btnBgScalePlus');
    var btnScaleFit = $('#btnBgScaleFit');
    var btnScaleReset = $('#btnBgScaleReset');

    // Cutout person transform controls
    var personTransformBox = $('#stagePersonTransformBox');
    var personResizerBar = $('#stagePersonResizerBar');
    var lblPersonScaleVal = $('#lblPersonScaleVal');
    var btnPersonScaleMinus = $('#btnPersonScaleMinus');
    var btnPersonScalePlus = $('#btnPersonScalePlus');
    var btnPersonReset = $('#btnPersonReset');
    var contourAnimationId = 0;
    $(document).off('.rembg');

    // Engine switcher (ensure disabled buttons like FeyNoBg cannot be clicked)
    $(document).off('click.rembgEngine', '.rembg-engine-btn').on('click.rembgEngine', '.rembg-engine-btn', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if ($(this).is(':disabled') || $(this).hasClass('is-disabled') || isProcessingTemplate || cutoutState === 'extracting') {
        return;
      }
      var newEngine = $(this).attr('data-engine') || 'rmbg2';
      if (newEngine === selectedEngine && isCutoutExtracted) {
        return;
      }
      selectedEngine = newEngine;
      $('.rembg-engine-btn').removeClass('active');
      $(this).addClass('active');

      // If session is already open/active, smoothly switch without clearing stage or drawer
      if (modal.hasClass('active') || cutoutViewport.is(':visible') || isCutoutExtracted) {
        switchEngineInSession(selectedEngine);
      } else {
        isCutoutExtracted = false;
        cutoutPngUrl = '';
        cutoutPerson.css('visibility', 'hidden');
        startMattingAndFlow();
      }
    });
    function isShootMattingAllowed() {
      var currentMode = window.sessionPhotoboothMode || window.photoboothMode;
      var isWorkshop = Boolean(window.creativeWorkshop && window.creativeWorkshop.resultLayout) || currentMode === 'workshop';
      return currentMode === 'shoot' && !isWorkshop;
    }

    // 1. User clicks "AI抠图换景": Start flow with lock guard
    $(document).off('click.rembgOpen', '.rembgbtn, [data-command="rembgbtn"]').on('click.rembgOpen', '.rembgbtn, [data-command="rembgbtn"]', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!isShootMattingAllowed()) {
        return;
      }
      if (cutoutState === 'extracting' || isProcessingTemplate || $('.stage-matting-locked').length > 0) {
        return;
      }
      startMattingAndFlow();
    });

    // Toggle custom background drawer from resizer bar
    $(document).off('click.rembgResizerBg', '#btnResizerChangeBg').on('click.rembgResizerBg', '#btnResizerChangeBg', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!isShootMattingAllowed()) {
        return;
      }
      if (modal.hasClass('active')) {
        modal.removeClass('active sidenav--open').hide();
            $('#btnClassicCustomBg, .rembgbtn').removeClass('active is-drawer-open').attr('aria-expanded', 'false');
      } else {
        modal.addClass('active sidenav--open').show();
        loadTemplates();
      }
    });

    // 2. Click template card -> Immediately composite & interlock with mutex (Document-level delegation)
    $(document).off('click.rembgTemplate', '.rembg-template-card').on('click.rembgTemplate', '.rembg-template-card', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var card = $(this);
      if (isProcessingTemplate) {
        notifyRembg('warning', '当前模板正在合成替换中，请稍候...');
        return;
      }
      if (card.hasClass('is-loading')) {
        return;
      }
      var tplPath = card.attr('data-path');
      var tplName = card.attr('data-name');
      applyTemplateComposite(tplPath, tplName, card);
    });

    // 3. Delete custom template handler
    $(document).off('click.rembgDelTemplate', '.rembg-template-del-btn').on('click.rembgDelTemplate', '.rembg-template-del-btn', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      var btn = $(this);
      var card = btn.closest('.rembg-template-card');
      var tplPath = btn.attr('data-path') || card.attr('data-path');
      if (!tplPath || btn.prop('disabled')) return;
      var confirmed = window.confirm('确定要删除该自定义背景模板吗？删除后不可恢复。');
      if (!confirmed) return;
      btn.prop('disabled', true).addClass('is-loading');
      $.ajax({
        url: 'api/deleteTemplate.php',
        type: 'POST',
        data: {
          file: tplPath
        },
        dataType: 'json'
      }).done(function (res) {
        if (res && res.success) {
          notifyRembg('success', '自定义模板已删除');

          // If currently active template was deleted, fallback to transparent
          if (currentTemplate === tplPath) {
            var transparentCard = grid.find('.rembg-template-card[data-path="transparent"]');
            applyTemplateComposite('transparent', '透明背景 (PNG)', transparentCard);
          }
          card.css({
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            opacity: 0,
            transform: 'scale(0.8)'
          });
          setTimeout(function () {
            card.remove();
          }, 250);
        } else {
          notifyRembg('error', res && res.error || '删除模板失败');
          btn.prop('disabled', false).removeClass('is-loading');
        }
      }).fail(function (xhr, status, error) {
        var response = xhr && xhr.responseJSON;
        var msg = response && (response.error || response.message) || error || '删除模板请求失败';
        notifyRembg('error', msg);
        btn.prop('disabled', false).removeClass('is-loading');
      });
    });

    // Close drawer
    $(document).off('click.rembgClose', '#btnRembgClose').on('click.rembgClose', '#btnRembgClose', function (e) {
      e.preventDefault();
      e.stopPropagation();
      completeRembgAndApplyToStage();
    });

    // Done button: Complete composite and replace image on stage
    $(document).off('click.rembgDone', '#btnRembgDone').on('click.rembgDone', '#btnRembgDone', function (e) {
      e.preventDefault();
      e.stopPropagation();
      completeRembgAndApplyToStage();
    });

    // Revert to original
    $(document).off('click.rembgRevert', '#btnRembgRevert').on('click.rembgRevert', '#btnRembgRevert', function (e) {
      e.preventDefault();
      e.stopPropagation();
      revertToOriginal();
    });

    // File upload for custom template
    $(document).off('change.rembgUpload', '#rembgTemplateUpload').on('change.rembgUpload', '#rembgTemplateUpload', function () {
      if (this.files && this.files[0]) {
        uploadCustomTemplate(this.files[0]);
      }
    });

    // Quick resizer toolbar events
    btnScaleMinus.on('click', function (e) {
      e.preventDefault();
      setCustomScale(customScale - 0.1);
    });
    btnScalePlus.on('click', function (e) {
      e.preventDefault();
      setCustomScale(customScale + 0.1);
    });
    btnScaleFit.on('click', function (e) {
      e.preventDefault();
      customScale = 1.0;
      customOffsetX = 0;
      customOffsetY = 0;
      updateTransformView();
      scheduleRecomposite();
    });
    btnScaleReset.on('click', function (e) {
      e.preventDefault();
      customScale = 1.0;
      customOffsetX = 0;
      customOffsetY = 0;
      updateTransformView();
      scheduleRecomposite();
    });

    // Bind interactive drag/resize on transformBox
    bindTransformBoxGestures();

    // Person quick resizer toolbar events
    btnPersonScaleMinus.on('click', function (e) {
      e.preventDefault();
      setPersonScale(personScale - 0.1);
    });
    btnPersonScalePlus.on('click', function (e) {
      e.preventDefault();
      setPersonScale(personScale + 0.1);
    });
    btnPersonReset.on('click', function (e) {
      e.preventDefault();
      personScale = 1.0;
      personOffsetX = 0;
      personOffsetY = 0;
      updatePersonTransformView();
      schedulePersonRecomposite();
    });

    // Confirm & Merge Person / Background into Stage
    $(document).off('click.rembgPersonConfirm', '#btnPersonConfirm').on('click.rembgPersonConfirm', '#btnPersonConfirm', function (e) {
      e.preventDefault();
      e.stopPropagation();
      completeRembgAndApplyToStage();
    });
    $(document).off('click.rembgBgConfirm', '#btnBgConfirm').on('click.rembgBgConfirm', '#btnBgConfirm', function (e) {
      e.preventDefault();
      e.stopPropagation();
      completeRembgAndApplyToStage();
    });

    // Auto-finalize & merge when clicking empty area on stage outside transform controls
    $(document).off('click.rembgStageDismiss').on('click.rembgStageDismiss', '.stage[data-stage="result"]', function (e) {
      if ($(e.target).closest('#stagePersonTransformBox, #stagePersonResizerBar, #stageTransformBox, #stageBgResizerBar, #rembgModal, #resultSidebar, .buttonbar, .editor-drawer, .classic-frame-overlay, .swal2-container').length === 0) {
        if ($('#stagePersonTransformBox').is(':visible') || $('#stageBgResizerBar').is(':visible') || $('#stageCutoutViewport').is(':visible')) {
          completeRembgAndApplyToStage();
        }
      }
    });

    // Bind interactive drag/resize on cutout person
    bindPersonTransformGestures();

    // Window resize adjusts transform box positions
    $(window).off('resize.rembgPerson').on('resize.rembgPerson', function () {
      if (isPersonActive) {
        updatePersonTransformView();
      }
      if (isCustomTemplateActive) {
        updateTransformView();
      }
    });

    /* ========================================================
       Main Flow: Extract -> 60FPS Contour Flow -> Lift -> Pop Drawer
       ======================================================== */
    function switchEngineInSession(engine) {
      if (isProcessingTemplate || cutoutState === 'extracting') return;
      var resultPage = $('.stage[data-stage="result"]');
      baseOriginalName = getCleanOriginalName(resultPage.attr('data-camera-img') || resultPage.attr('data-original-img') || resultPage.attr('data-img') || baseOriginalName);
      if (!baseOriginalName) {
        notifyRembg('error', '未检测到当前拍摄照片');
        return;
      }
      cutoutState = 'extracting';
      setMattingLoadingState(true, engine);
      cutoutPerson.addClass('is-switching');
      var requestId = ++cutoutRequestId;
      notifyRembg('info', '正在切换至 ' + (engine === 'rmbg2' ? 'RMBG-2.0' : 'BiRefNet') + ' 模型推理...');
      $.ajax({
        url: 'api/rembgProcess.php',
        type: 'POST',
        data: {
          file: baseOriginalName,
          template: 'transparent',
          action: 'apply',
          engine: engine || selectedEngine || 'rmbg2'
        },
        dataType: 'json',
        timeout: 90000
      }).done(function (res) {
        clearTimeout(slowWarnTimer);
        if (requestId !== cutoutRequestId) return;
        if (!res || !res.success || !res.file) {
          cutoutState = 'ready';
          setMattingLoadingState(false);
          cutoutPerson.removeClass('is-switching');
          notifyRembg('error', res && res.error || '切换抠图引擎失败');
          return;
        }
        cutoutPngUrl = '/data/images/' + res.file + '?v=' + Date.now();
        latestCompositeFile = res.file;
        isCutoutExtracted = true;
        var preloader = new Image();
        preloader.onload = function () {
          if (requestId !== cutoutRequestId) return;
          personImg.attr('src', cutoutPngUrl);
          cutoutPerson.removeClass('is-switching').css('visibility', 'visible');
          cutoutState = 'ready';
          setMattingLoadingState(false);
          notifyRembg('success', '已切换至 ' + (engine === 'rmbg2' ? 'RMBG-2.0' : 'BiRefNet') + ' 抠图引擎');

          // If a background template (custom or preset) was already selected, auto-recomposite with the new cutout!
          if (currentTemplate && currentTemplate !== 'transparent' && currentTemplate !== 'none') {
            var activeCard = grid.find(".rembg-template-card[data-path=\"".concat(currentTemplate, "\"]"));
            var tplName = activeCard.length && activeCard.attr('data-name') || selectedNameEl.text();
            applyTemplateComposite(currentTemplate, tplName, activeCard);
          }
        };
        preloader.onerror = function () {
          if (requestId !== cutoutRequestId) return;
          cutoutState = 'ready';
          setMattingLoadingState(false);
          cutoutPerson.removeClass('is-switching');
          notifyRembg('error', '透明前景加载异常');
        };
        preloader.src = cutoutPngUrl;
      }).fail(function (xhr, status, error) {
        if (requestId !== cutoutRequestId) return;
        cutoutState = 'ready';
        setMattingLoadingState(false);
        cutoutPerson.removeClass('is-switching');
        notifyRembg('error', '切换抠图引擎失败：' + (error || status || '网络请求异常'));
      });
    }
    var activeMattingOptions = {};
    function startMattingAndFlow(options) {
      activeMattingOptions = options || {};
      var resultPage = $('.stage[data-stage="result"]');
      var prevOriginal = baseOriginalName;
      if (!resultPage.attr('data-camera-img')) {
        var initialCandidate = resultPage.attr('data-original-img') || resultPage.attr('data-img') || '';
        resultPage.attr('data-camera-img', getCleanOriginalName(initialCandidate));
      }
      baseOriginalName = getCleanOriginalName(resultPage.attr('data-camera-img') || resultPage.attr('data-original-img') || resultPage.attr('data-img'));
      if (prevOriginal && prevOriginal !== baseOriginalName) {
        isCutoutExtracted = false;
        cutoutPngUrl = '';
        latestCompositeFile = '';
      }
      if (!baseOriginalName) {
        notifyRembg('error', '未检测到当前拍摄照片');
        return;
      }
      if ($('#filternav').hasClass('sidenav--open')) {
        $('#filternav').removeClass('sidenav--open');
      }
      if ($('#beautyModal').length) {
        $('#beautyModal').removeClass('active sidenav--open').hide();
      }
      if (window.photoBooth && typeof window.photoBooth.clearTimeOut === 'function') {
        window.photoBooth.clearTimeOut();
      }

      // Keep right drawer CLOSED initially as requested
      modal.removeClass('active sidenav--open').hide();
            $('#btnClassicCustomBg, .rembgbtn').removeClass('active is-drawer-open').attr('aria-expanded', 'false');
      transformBox.hide();
      resizerBar.hide();
      personTransformBox.hide();
      personResizerBar.hide();
      personScale = 1.0;
      personOffsetX = 0;
      personOffsetY = 0;
      isPersonActive = false;
      if (cutoutPerson[0]) {
        cutoutPerson[0].style.setProperty('transform', 'none', 'important');
      }

      // Prepare stage viewport
      cutoutViewport.show();
      cutoutBg.css({
        'background-image': 'none',
        'background-color': 'transparent'
      });
      cutoutPerson.removeClass('is-lifted').css('visibility', 'hidden');
      if (isCutoutExtracted && cutoutPngUrl && personImg.attr('src')) {
        // Cutout already extracted, replay 60FPS contour trace directly
        runContourFlowAndPopDrawer(personImg[0], activeMattingOptions);
        return;
      }

      // Extract person mask via backend
      cutoutState = 'extracting';
      setMattingLoadingState(true, selectedEngine);
      var requestId = ++cutoutRequestId;
      notifyRembg('info', '正在进行 AI 人物定位与智能抠图...');
      var slowWarnTimer = setTimeout(function () {
        if (cutoutState === 'extracting') {
          notifyRembg('info', 'AI 正在深度推理人像发丝与边缘，首次加载模型请稍候...');
        }
      }, 8000);
      $.ajax({
        url: 'api/rembgProcess.php',
        type: 'POST',
        data: {
          file: baseOriginalName,
          template: 'transparent',
          action: 'apply',
          engine: selectedEngine || 'rmbg2'
        },
        dataType: 'json',
        timeout: 90000
      }).done(function (res) {
        if (requestId !== cutoutRequestId) return;
        if (!res || !res.success || !res.file) {
          cutoutState = 'error';
          setMattingLoadingState(false);
          notifyRembg('error', res && res.error || 'AI 抠图失败');
          return;
        }
        cutoutPngUrl = '/data/images/' + res.file + '?v=' + Date.now();
        latestCompositeFile = res.file;
        isCutoutExtracted = false;
        cutoutState = 'animating';
        personImg.off('load error').on('load', function () {
          if (requestId !== cutoutRequestId) return;
          setMattingLoadingState(false);
          runContourFlowAndPopDrawer(this);
        }).on('error', function () {
          if (requestId !== cutoutRequestId) return;
          cutoutState = 'error';
          setMattingLoadingState(false);
          resultPage.removeClass('cutout-mode-active');
          cutoutViewport.hide();
          cutoutPerson.css('visibility', 'hidden');
          notifyRembg('error', '透明人物前景加载失败');
        }).attr('src', cutoutPngUrl);
      }).fail(function (xhr, status, error) {
        clearTimeout(slowWarnTimer);
        if (requestId !== cutoutRequestId) return;
        cutoutState = 'error';
        setMattingLoadingState(false);
        notifyRembg('error', 'AI 抠图失败：' + (error || status || '网络请求异常'));
      });
    }

    // Run 60FPS contour trace flow, then lift person, then slide in right drawer
    function runContourFlowAndPopDrawer(imgElem, options) {
      options = options || activeMattingOptions || {};
      var requestId = cutoutRequestId;
      setMattingLoadingState(false);
      var resultPage = $('.stage[data-stage="result"]');
      cutoutViewport.show();
      cutoutPerson.css({
        'visibility': 'visible',
        'opacity': '0'
      });
      playContourAnimation(imgElem, contourCanvas, options, function () {
        if (requestId !== cutoutRequestId) return;
        // 1. Contour flow finished -> pop out & highlight person
        resultPage.addClass('cutout-mode-active');
        cutoutPerson.css({
          'visibility': 'visible',
          'opacity': '1',
          'z-index': '100'
        }).addClass('is-lifted');
        isCutoutExtracted = true;
        cutoutState = 'ready';
        isPersonActive = true;

        // 2. Allow customizing person position: show selection box & resizer toolbar
        personTransformBox.show();
        personResizerBar.show();
        updatePersonTransformView();

        // 3. Smoothly pop open the right-side template selection drawer
        setTimeout(function () {
          if (requestId !== cutoutRequestId) return;
          if ($('#beautyModal').length) {
            $('#beautyModal').removeClass('active sidenav--open').hide();
          }
          modal.addClass('active sidenav--open').show();
          loadTemplates();
        }, 200);
      });
    }

    /* ========================================================
       60FPS High-Precision Silky Smooth Dynamic Contour Flow
       3-Stage Cinematic Matting Transition:
       Stage 1: Flowing glowing outline along person/background seam (~1100ms, ~66 frames)
       Stage 2: Original background fades out to 0, person lifts to top layer (~800ms, ~48 frames)
       Stage 3: New studio HD background smoothly fades in (~500ms, ~30 frames)
       Total frames > 140 frames @ 60FPS
       ======================================================== */
    function playContourAnimation(imgElement, canvasElement, options, onComplete) {
      if (typeof options === 'function') {
        onComplete = options;
        options = {};
      }
      options = options || {};
      var canvas = canvasElement[0] || canvasElement;
      var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
      if (!ctx) {
        if (onComplete) onComplete();
        return;
      }
      var animationToken = ++contourAnimationId;
      function isCurrentAnimation() {
        return animationToken === contourAnimationId;
      }
      var stageResult = $('.stage--result');
      var cutoutViewport = $('#stageCutoutViewport');
      var canvasContainer = cutoutViewport.length && cutoutViewport.is(':visible') ? cutoutViewport : stageResult;
      var cWidth = canvasContainer.width() || window.innerWidth;
      var cHeight = canvasContainer.height() || window.innerHeight;
      var dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      function updateCanvasSize() {
        cWidth = canvasContainer.width() || window.innerWidth;
        cHeight = canvasContainer.height() || window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2.0);
        if (canvas.width !== Math.round(cWidth * dpr) || canvas.height !== Math.round(cHeight * dpr)) {
          canvas.width = Math.round(cWidth * dpr);
          canvas.height = Math.round(cHeight * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      updateCanvasSize();
      var natW = imgElement.naturalWidth || imgElement.width || cWidth;
      var natH = imgElement.naturalHeight || imgElement.height || cHeight;

      // 离屏画布：强制包裹 2 像素透明 Padding，杜绝边缘截断与穿身回环
      var offW = Math.min(natW, 480);
      var offH = Math.max(30, Math.round(offW * (natH / natW)));
      var pad = 2;
      var padW = offW + pad * 2;
      var padH = offH + pad * 2;
      var off = document.createElement('canvas');
      off.width = padW;
      off.height = padH;
      var offCtx = off.getContext('2d');
      offCtx.clearRect(0, 0, padW, padH);
      offCtx.drawImage(imgElement, pad, pad, offW, offH);
      var imgData;
      try {
        imgData = offCtx.getImageData(0, 0, padW, padH);
      } catch (e) {
        if (onComplete) onComplete();
        return;
      }
      var data = imgData.data;
      var alphaAt = function alphaAt(x, y) {
        if (x < 0 || x >= padW || y < 0 || y >= padH) return 0;
        return data[(y * padW + x) * 4 + 3];
      };
      var start = null;
      for (var y = pad; y < padH - pad; y++) {
        for (var x = pad; x < padW - pad; x++) {
          if (alphaAt(x, y) > 90) {
            start = {
              x: x,
              y: y
            };
            break;
          }
        }
        if (start) break;
      }
      if (!start) {
        if (onComplete) onComplete();
        return;
      }
      var dirs = [{
        x: 0,
        y: -1
      }, {
        x: 1,
        y: -1
      }, {
        x: 1,
        y: 0
      }, {
        x: 1,
        y: 1
      }, {
        x: 0,
        y: 1
      }, {
        x: -1,
        y: 1
      }, {
        x: -1,
        y: 0
      }, {
        x: -1,
        y: -1
      }];
      var rawPts = [];
      var curr = {
        x: start.x,
        y: start.y
      };
      var backtrack = 6;
      for (var _step = 0; _step < 6000; _step++) {
        // 保存归一化相对坐标 [0, 1]，支持在任何缩放级别下动态重投影
        var nx = Math.max(0, Math.min(1, (curr.x - pad) / offW));
        var ny = Math.max(0, Math.min(1, (curr.y - pad) / offH));
        rawPts.push({
          nx: nx,
          ny: ny
        });
        var found = false;
        for (var i = 0; i < 8; i++) {
          var dirIdx = (backtrack + i) % 8;
          var testX = curr.x + dirs[dirIdx].x;
          var testY = curr.y + dirs[dirIdx].y;
          if (alphaAt(testX, testY) > 90) {
            curr = {
              x: testX,
              y: testY
            };
            backtrack = (dirIdx + 6) % 8;
            found = true;
            break;
          }
        }
        if (!found || curr.x === start.x && curr.y === start.y && _step > 20) {
          break;
        }
      }
      if (rawPts.length < 8) {
        if (onComplete) onComplete();
        return;
      }
      var resampled = [];
      var lastP = rawPts[0];
      resampled.push(lastP);
      var minNormSpacing = 1.0 / 220.0;
      var minNormSqDist = minNormSpacing * minNormSpacing;
      for (var _i = 1; _i < rawPts.length; _i++) {
        var p = rawPts[_i];
        var dnx = p.nx - lastP.nx;
        var dny = p.ny - lastP.ny;
        if (dnx * dnx + dny * dny >= minNormSqDist) {
          resampled.push(p);
          lastP = p;
        }
      }
      var smoothPts = resampled;
      var n = smoothPts.length;
      for (var pass = 0; pass < 3; pass++) {
        var nextPass = [];
        for (var _i2 = 0; _i2 < n; _i2++) {
          var pPrev = smoothPts[(_i2 - 1 + n) % n];
          var pCurr = smoothPts[_i2];
          var pNext = smoothPts[(_i2 + 1) % n];
          nextPass.push({
            nx: 0.25 * pPrev.nx + 0.5 * pCurr.nx + 0.25 * pNext.nx,
            ny: 0.25 * pPrev.ny + 0.5 * pCurr.ny + 0.25 * pNext.ny
          });
        }
        smoothPts = nextPass;
      }
      var totalPts = smoothPts.length;

      // 动态视口与图片绝对像素几何计算函数 (实时响应 Ctrl+滚轮 视口变化)
      function getScreenRect() {
        var vp = $('#stageCutoutViewport');
        var pImg = $('#stagePersonImg');
        var vpEl = vp.length ? vp[0] : canvasContainer[0] || canvas;
        var vpRect = vpEl && vpEl.getBoundingClientRect ? vpEl.getBoundingClientRect() : null;
        var imgEl = pImg.length ? pImg[0] : imgElement || null;
        var imgRect = imgEl && imgEl.getBoundingClientRect ? imgEl.getBoundingClientRect() : null;
        if (imgRect && imgRect.width > 20 && imgRect.height > 20 && vpRect && vpRect.width > 20) {
          return {
            x: imgRect.left - vpRect.left,
            y: imgRect.top - vpRect.top,
            w: imgRect.width,
            h: imgRect.height
          };
        }

        // 兜底几何计算：按 aspect-ratio 在当前容器中居中 contain
        var curW = canvasContainer.width() || window.innerWidth;
        var curH = canvasContainer.height() || window.innerHeight;
        var sRatio = curW / Math.max(1, curH);
        var iRatio = natW / Math.max(1, natH);
        var rW, rH, rX, rY;
        if (iRatio > sRatio) {
          rW = curW;
          rH = curW / iRatio;
          rX = 0;
          rY = (curH - rH) / 2;
        } else {
          rH = curH;
          rW = curH * iRatio;
          rX = (curW - rW) / 2;
          rY = 0;
        }
        return {
          x: rX,
          y: rY,
          w: rW,
          h: rH
        };
      }
      function renderSplinePath(context, points, count, screenRect) {
        if (count < 2) return;
        context.beginPath();
        var toScreen = function toScreen(p) {
          return {
            x: screenRect.x + p.nx * screenRect.w,
            y: screenRect.y + p.ny * screenRect.h
          };
        };
        var p0 = toScreen(points[0]);
        var p1 = toScreen(points[1]);
        context.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
        for (var _i3 = 1; _i3 < count; _i3++) {
          var _pCurr = toScreen(points[_i3]);
          var nextIndex = _i3 + 1 < count ? _i3 + 1 : count === points.length ? 0 : _i3;
          var _pNext = toScreen(points[nextIndex]);
          var midX = (_pCurr.x + _pNext.x) / 2;
          var midY = (_pCurr.y + _pNext.y) / 2;
          context.quadraticCurveTo(_pCurr.x, _pCurr.y, midX, midY);
        }
        if (count < points.length) {
          var last = toScreen(points[count - 1]);
          context.lineTo(last.x, last.y);
        } else {
          context.closePath();
        }
      }

      // 快速流畅 60FPS 动画时间分配（总计 900ms，轻快响应）
      var duration1 = 380; // 阶段1: 激光流光轻快穿梭分割线 (~23帧)
      var duration2 = 320; // 阶段2: 原背景自然淡出，人像跃迁就绪 (~19帧)
      var duration3 = 200; // 阶段3: 背景平滑淡入呈现 (~12帧)
      var totalDuration = duration1 + duration2 + duration3; // 总计 900ms 极速响应

      var resultImg = $('#result--img');
      var cutoutBg = $('#stageCutoutBg');
      var defaultBgUrl = options.autoBackground ? 'resources/img/templates/' + options.autoBackground + '.jpg' : 'resources/img/templates/studio_light.jpg';

      // 预设背景层置于底层，初始透明
      cutoutBg.css({
        'background-image': 'url("' + defaultBgUrl + '")',
        'background-size': 'cover',
        'background-position': 'center center',
        'opacity': '0',
        'display': 'block',
        'z-index': '1'
      });

      // 人像初始置于中间层，初始透明待升起
      cutoutPerson.css({
        'visibility': 'visible',
        'opacity': '0',
        'z-index': '100'
      });
      var startAnimTime = null;
      function step(timestamp) {
        if (!isCurrentAnimation()) return;
        if (!startAnimTime) startAnimTime = timestamp;
        var elapsed = timestamp - startAnimTime;
        updateCanvasSize();
        var screenRect = getScreenRect();
        ctx.clearRect(0, 0, cWidth, cHeight);
        if (elapsed <= duration1) {
          // ================= 阶段 1：高亮流光线条沿分割线闭合流动穿梭 =================
          var p1 = Math.min(elapsed / duration1, 1.0);
          var currentCount = Math.floor(p1 * totalPts);
          if (currentCount > 1) {
            ctx.save();

            // 外层青蓝发光霓虹线 (Cyan Neon Glow)
            renderSplinePath(ctx, smoothPts, currentCount, screenRect);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 22;
            ctx.lineWidth = 4.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // 内层核心白光激光束
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#ffffff';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.0;
            ctx.stroke();

            // 彗星光头 (Flowing Tip Comet)
            var tipNorm = smoothPts[Math.min(currentCount, totalPts - 1)];
            var tipX = screenRect.x + tipNorm.nx * screenRect.w;
            var tipY = screenRect.y + tipNorm.ny * screenRect.h;
            ctx.beginPath();
            ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 24;
            ctx.fill();
            ctx.restore();
          }
          requestAnimationFrame(step);
        } else if (elapsed <= duration1 + duration2) {
          // ================= 阶段 2：原背景自然淡出至0消失，人像跃迁至最高层 =================
          var p2 = Math.min((elapsed - duration1) / duration2, 1.0);

          // 1. 原拍摄背景透明度从 1.0 自然淡出至 0
          resultImg.css('opacity', (1.0 - p2).toFixed(3));

          // 2. 抠出的人像层升起并浮现至最高层，带有微小的立体跃迁感
          var _personScale = (1.0 + 0.025 * (1.0 - p2)).toFixed(3);
          cutoutPerson.css({
            'visibility': 'visible',
            'opacity': p2.toFixed(3),
            'z-index': '100',
            'transform': 'scale(' + _personScale + ')'
          });

          // 3. 分割线流光向外轻微扩散并自然淡化
          var lineAlpha = (1.0 - p2) * 0.95;
          if (lineAlpha > 0.02) {
            ctx.save();
            renderSplinePath(ctx, smoothPts, totalPts, screenRect);
            ctx.strokeStyle = 'rgba(56, 189, 248, ' + lineAlpha.toFixed(3) + ')';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 24 * (1.0 - p2);
            ctx.lineWidth = 4.0;
            ctx.stroke();
            ctx.restore();
          }
          requestAnimationFrame(step);
        } else if (elapsed <= totalDuration) {
          // ================= 阶段 3：底层全新摄影棚高清背景平滑淡入 =================
          var p3 = Math.min((elapsed - duration1 - duration2) / duration3, 1.0);
          resultImg.hide(); // 原背景彻底隐藏
          cutoutBg.css('opacity', p3.toFixed(3)); // 全新背景平滑淡入呈现
          requestAnimationFrame(step);
        } else {
          // 动画全部完成，清理画布并呈现就绪状态
          ctx.clearRect(0, 0, cWidth, cHeight);
          resultImg.hide();
          cutoutBg.css('opacity', '1');
          cutoutPerson.css({
            'visibility': 'visible',
            'opacity': '1',
            'z-index': '100',
            'transform': 'none'
          });
          if (onComplete) onComplete();
        }
      }
      requestAnimationFrame(step);
    }

    /* ========================================================
       Click-to-Composite & Interlock Mechanism
       ======================================================== */
    function applyTemplateComposite(tplPath, tplName, cardElement) {
      if (isProcessingTemplate) {
        notifyRembg('warning', '当前模板正在合成替换中，请稍候...');
        return;
      }
      var path = tplPath || 'transparent';
      var requestId = ++compositeRequestId;
      compositeDirty = false;
      latestCompositeFile = '';
      if (window.photoBooth) window.photoBooth.invalidateComposite();
      currentTemplate = path;
      if (!baseOriginalName) {
        var resultPage = $('.stage[data-stage="result"]');
        baseOriginalName = getCleanOriginalName(resultPage.attr('data-camera-img') || resultPage.attr('data-original-img') || resultPage.attr('data-img') || '');
      } else {
        baseOriginalName = getCleanOriginalName(baseOriginalName);
      }

      // Target card reference
      var targetCard = cardElement && cardElement.length ? cardElement : grid.find(".rembg-template-card[data-path=\"".concat(path, "\"]"));

      // Mark processing & lock all template cards
      isProcessingTemplate = true;
      grid.find('.rembg-template-card').addClass('is-locked').removeClass('active is-loading');
      if (targetCard && targetCard.length) {
        targetCard.removeClass('is-locked').addClass('active is-loading');
      }
      selectedNameEl.text(tplName || '透明背景 (PNG)').show();

      // Detect if this is a custom uploaded template
      isCustomTemplateActive = path.indexOf('custom_') !== -1 || tplName && tplName.indexOf('自定义') !== -1 || path.indexOf('/data/templates/') !== -1;
      if (isCustomTemplateActive) {
        transformBox.show();
        resizerBar.show();
        updateTransformView();
      } else {
        transformBox.hide();
        resizerBar.hide();
        customScale = 1.0;
        customOffsetX = 0;
        customOffsetY = 0;
      }

      // Real-time preview update immediately for instant user perception
      if (path === 'transparent' || path === 'none') {
        cutoutBg.css({
          'background-image': 'none',
          'background-color': 'transparent'
        });
        if (cutoutBg[0]) {
          cutoutBg[0].style.setProperty('background-image', 'none', 'important');
          cutoutBg[0].style.setProperty('background-color', 'transparent', 'important');
        }
      } else {
        var escapedPath = String(path).replace(/\\/g, '/').replace(/"/g, '\\"');
        var bgUrl = escapedPath.startsWith('http') || escapedPath.startsWith('/') ? escapedPath : '/' + escapedPath;
        cutoutBg.css({
          'background-color': 'transparent',
          'background-image': 'url("' + bgUrl + '")'
        });
        if (cutoutBg[0]) {
          cutoutBg[0].style.setProperty('background-image', 'url("' + bgUrl + '")', 'important');
          cutoutBg[0].style.setProperty('background-color', 'transparent', 'important');
        }
      }

      // Immediately start matting composite on backend
      var postData = {
        file: baseOriginalName,
        template: path,
        action: 'apply',
        engine: selectedEngine || 'rmbg2',
        scale: customScale,
        offset_x: getNormalizedOffsetX(),
        offset_y: getNormalizedOffsetY(),
        person_scale: personScale,
        person_offset_x: getNormalizedPersonOffsetX(),
        person_offset_y: getNormalizedPersonOffsetY()
      };
      compositeRequest = photoboothTools.ajaxWithCsrf({
        url: 'api/rembgProcess.php',
        type: 'POST',
        data: postData,
        dataType: 'json',
        timeout: 90000
      }).done(function (res) {
        if (requestId !== compositeRequestId) return;
        if (!res || !res.success || !res.file) {
          var message = res && res.error || '模板合成失败';
          notifyRembg('error', message);
          return;
        }
        latestCompositeFile = res.file;
        var resultPage = $('.stage[data-stage="result"]');
        var newImgUrl = '/data/images/' + res.file + '?v=' + Date.now();
        resultPage.css('--stage-background-image', 'url("' + newImgUrl + '")');
        notifyRembg('success', '背景替换完成');
      }).fail(function (xhr, status, error) {
        if (requestId !== compositeRequestId) return;
        var response = xhr && xhr.responseJSON;
        var message = response && (response.error || response.message) || error || '模板合成失败';
        notifyRembg('error', message);
      }).always(function () {
        if (requestId !== compositeRequestId) return;
        // Unlock mutex and restore cards
        isProcessingTemplate = false;
        compositeRequest = null;
        if (targetCard && targetCard.length) {
          targetCard.removeClass('is-loading').addClass('active');
        }
        grid.find('.rembg-template-card').removeClass('is-locked');
        // Edits made while the previous request was running must also be saved.
        if (compositeDirty) {
          flushRecomposite();
        } else if (finalizeRequested) {
          finalizeRequested = false;
          if (latestCompositeFile) finalizeStageReplacement();
        }
      });
    }
    function flushRecomposite() {
      clearTimeout(recompositeTimer);
      clearTimeout(personRecompositeTimer);
      recompositeTimer = null;
      personRecompositeTimer = null;
      if (!compositeDirty || isProcessingTemplate) return;
      var activeCard = grid.find('.rembg-template-card.active');
      applyTemplateComposite(currentTemplate || 'transparent', activeCard.attr('data-name'), activeCard);
    }

    /* ========================================================
       Custom Template Interactive Transform & Drag Engine
       ======================================================== */
    function getNormalizedOffsetX() {
      var vpW = cutoutViewport.width() || window.innerWidth;
      return vpW > 0 ? customOffsetX / vpW : 0;
    }
    function getNormalizedOffsetY() {
      var vpH = cutoutViewport.height() || window.innerHeight;
      return vpH > 0 ? customOffsetY / vpH : 0;
    }
    function setCustomScale(val) {
      customScale = Math.max(0.3, Math.min(3.5, parseFloat(val.toFixed(2))));
      updateTransformView();
      scheduleRecomposite();
    }
    function updateTransformView() {
      // Apply scale & translation to background layer in viewport
      cutoutBg.css({
        'transform': "translate(".concat(customOffsetX, "px, ").concat(customOffsetY, "px) scale(").concat(customScale, ")"),
        'transform-origin': 'center center'
      });

      // Update transform bounding box position
      var vpW = cutoutViewport.width() || window.innerWidth;
      var vpH = cutoutViewport.height() || window.innerHeight;
      var boxW = Math.min(vpW, vpH * 1.5) * 0.8 * customScale;
      var boxH = boxW * (vpH / vpW);
      transformBox.css({
        width: boxW + 'px',
        height: boxH + 'px',
        left: 'calc(50% + ' + customOffsetX + 'px - ' + boxW / 2 + 'px)',
        top: 'calc(50% + ' + customOffsetY + 'px - ' + boxH / 2 + 'px)'
      });
      lblBgScaleVal.text(Math.round(customScale * 100) + '%');
    }
    function scheduleRecomposite() {
      compositeDirty = true;
      if (recompositeTimer) clearTimeout(recompositeTimer);
      recompositeTimer = setTimeout(flushRecomposite, 350);
    }
    function bindTransformBoxGestures() {
      var isDraggingMove = false;
      var isDraggingHandle = false;
      var dragStartX = 0;
      var dragStartY = 0;
      var initOffsetX = 0;
      var initOffsetY = 0;
      var initScale = 1.0;
      var initDist = 0;

      // Handle drag center (move/pan)
      transformBox.on('pointerdown', function (e) {
        if ($(e.target).hasClass('transform-handle')) return;
        isDraggingMove = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initOffsetX = customOffsetX;
        initOffsetY = customOffsetY;
        transformBox[0].setPointerCapture(e.pointerId);
        e.preventDefault();
      });

      // Handle drag corners (scale)
      transformBox.on('pointerdown', '.transform-handle', function (e) {
        e.stopPropagation();
        isDraggingHandle = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initScale = customScale;
        var rect = transformBox[0].getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        initDist = Math.hypot(e.clientX - centerX, e.clientY - centerY) || 1;
        this.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      $(document).on('pointermove.rembgTransform', function (e) {
        if (isDraggingMove) {
          var dx = e.clientX - dragStartX;
          var dy = e.clientY - dragStartY;
          customOffsetX = initOffsetX + dx;
          customOffsetY = initOffsetY + dy;
          updateTransformView();
        } else if (isDraggingHandle) {
          var rect = transformBox[0].getBoundingClientRect();
          var centerX = rect.left + rect.width / 2;
          var centerY = rect.top + rect.height / 2;
          var currDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
          var ratio = currDist / initDist;
          customScale = Math.max(0.3, Math.min(3.5, parseFloat((initScale * ratio).toFixed(2))));
          updateTransformView();
        }
      });
      $(document).on('pointerup.rembgTransform pointercancel.rembgTransform', function () {
        if (isDraggingMove || isDraggingHandle) {
          isDraggingMove = false;
          isDraggingHandle = false;
          scheduleRecomposite();
        }
      });
    }

    /* ========================================================
       Cutout Person Interactive Transform & Drag Engine
       ======================================================== */
    function getNormalizedPersonOffsetX() {
      var vpW = cutoutViewport.width() || window.innerWidth;
      return vpW > 0 ? personOffsetX / vpW : 0;
    }
    function getNormalizedPersonOffsetY() {
      var vpH = cutoutViewport.height() || window.innerHeight;
      return vpH > 0 ? personOffsetY / vpH : 0;
    }
    function setPersonScale(val) {
      personScale = Math.max(0.2, Math.min(3.5, parseFloat(val.toFixed(2))));
      updatePersonTransformView();
      schedulePersonRecomposite();
    }
    function updatePersonTransformView() {
      // Apply scale & translation to cutout person layer in viewport
      if (cutoutPerson[0]) {
        cutoutPerson[0].style.setProperty('transform', "translate(".concat(personOffsetX, "px, ").concat(personOffsetY, "px) scale(").concat(personScale, ")"), 'important');
        cutoutPerson[0].style.setProperty('transform-origin', 'center center', 'important');
      }

      // Calculate person image bounding box
      var vpW = cutoutViewport.width() || window.innerWidth;
      var vpH = cutoutViewport.height() || window.innerHeight;
      var img = personImg[0];
      var natW = img && img.naturalWidth || vpW;
      var natH = img && img.naturalHeight || vpH;
      var imgRatio = natW / natH;
      var vpRatio = vpW / vpH;
      var baseW, baseH;
      if (imgRatio > vpRatio) {
        baseW = vpW;
        baseH = vpW / imgRatio;
      } else {
        baseH = vpH;
        baseW = vpH * imgRatio;
      }
      var boxW = baseW * personScale;
      var boxH = baseH * personScale;
      var centerX = vpW / 2 + personOffsetX;
      var centerY = vpH / 2 + personOffsetY;
      personTransformBox.css({
        width: Math.round(boxW) + 'px',
        height: Math.round(boxH) + 'px',
        left: Math.round(centerX - boxW / 2) + 'px',
        top: Math.round(centerY - boxH / 2) + 'px'
      });
      lblPersonScaleVal.text(Math.round(personScale * 100) + '%');
    }
    function schedulePersonRecomposite() {
      compositeDirty = true;
      if (personRecompositeTimer) clearTimeout(personRecompositeTimer);
      personRecompositeTimer = setTimeout(flushRecomposite, 350);
    }
    function bindPersonTransformGestures() {
      var isDraggingMove = false;
      var isDraggingHandle = false;
      var dragStartX = 0;
      var dragStartY = 0;
      var initOffsetX = 0;
      var initOffsetY = 0;
      var initScale = 1.0;
      var initDist = 0;

      // Handle drag center (move person)
      personTransformBox.on('pointerdown', function (e) {
        if ($(e.target).hasClass('person-transform-handle')) return;
        isDraggingMove = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initOffsetX = personOffsetX;
        initOffsetY = personOffsetY;
        cutoutPerson.addClass('is-dragging');
        personTransformBox.addClass('is-active');
        this.setPointerCapture(e.pointerId);
        e.preventDefault();
      });

      // Handle drag corners (scale person)
      personTransformBox.on('pointerdown', '.person-transform-handle', function (e) {
        e.stopPropagation();
        isDraggingHandle = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initScale = personScale;
        var rect = personTransformBox[0].getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        initDist = Math.hypot(e.clientX - centerX, e.clientY - centerY) || 1;
        cutoutPerson.addClass('is-dragging');
        personTransformBox.addClass('is-active');
        this.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      $(document).on('pointermove.rembgPersonTransform', function (e) {
        if (isDraggingMove) {
          var dx = e.clientX - dragStartX;
          var dy = e.clientY - dragStartY;
          personOffsetX = initOffsetX + dx;
          personOffsetY = initOffsetY + dy;
          updatePersonTransformView();
        } else if (isDraggingHandle) {
          var rect = personTransformBox[0].getBoundingClientRect();
          var centerX = rect.left + rect.width / 2;
          var centerY = rect.top + rect.height / 2;
          var currDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
          var ratio = currDist / initDist;
          personScale = Math.max(0.2, Math.min(3.5, parseFloat((initScale * ratio).toFixed(2))));
          updatePersonTransformView();
        }
      });
      $(document).on('pointerup.rembgPersonTransform pointercancel.rembgPersonTransform', function () {
        if (isDraggingMove || isDraggingHandle) {
          isDraggingMove = false;
          isDraggingHandle = false;
          cutoutPerson.removeClass('is-dragging');
          personTransformBox.removeClass('is-active');
          schedulePersonRecomposite();
        }
      });
    }

    /* ========================================================
       Templates Management & Custom Upload
       ======================================================== */
    function loadTemplates() {
      $.ajax({
        url: 'api/getTemplates.php',
        type: 'GET',
        dataType: 'json'
      }).done(function (res) {
        if (res.success && res.templates) {
          renderTemplates(res.templates);
        }
      });
    }
    function renderTemplates(templates) {
      grid.empty();
      templates.forEach(function (tpl) {
        var isSelected = tpl.path === currentTemplate;
        var isCustom = tpl.type === 'custom' || tpl.path && tpl.path.indexOf('custom_') !== -1;
        var delBtnHtml = isCustom ? "\n                    <button type=\"button\" class=\"rembg-template-del-btn\" data-path=\"".concat(tpl.path, "\" title=\"\u5220\u9664\u6B64\u80CC\u666F\u6A21\u677F\">\n                        <i class=\"fa fa-trash-can\"></i>\n                    </button>\n                ") : '';
        var item = $("\n                    <div class=\"rembg-template-card ".concat(isSelected ? 'active' : '', "\" data-path=\"").concat(tpl.path, "\" data-name=\"").concat(tpl.name, "\" data-type=\"").concat(tpl.type || 'builtin', "\">\n                        <div class=\"rembg-thumb-wrap\">\n                            <img src=\"").concat(tpl.thumbnail, "\" alt=\"").concat(tpl.name, "\" loading=\"lazy\" />\n                            <div class=\"rembg-badge\"><i class=\"fa fa-check\"></i></div>\n                            ").concat(delBtnHtml, "\n                        </div>\n                        <div class=\"rembg-template-name\">").concat(tpl.name, "</div>\n                    </div>\n                "));
        grid.append(item);
      });
    }
    function uploadCustomTemplate(file) {
      var requestId = cutoutRequestId;
      var formData = new FormData();
      formData.append('template', file);
      var uploadBtn = $('#lblUploadTemplate');
      var originalText = uploadBtn.find('span').text();
      uploadBtn.find('span').text('上传中...');
      $.ajax({
        url: 'api/uploadTemplate.php',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json'
      }).done(function (res) {
        uploadBtn.find('span').text(originalText);
        uploadInput.val('');
        if (requestId !== cutoutRequestId) return;
        if (res.success) {
          var newCard = $("\n                        <div class=\"rembg-template-card active\" data-path=\"".concat(res.path, "\" data-name=\"\u81EA\u5B9A\u4E49: ").concat(res.name, "\" data-type=\"custom\">\n                            <div class=\"rembg-thumb-wrap\">\n                                <img src=\"").concat(res.path, "\" alt=\"").concat(res.name, "\" />\n                                <div class=\"rembg-badge\"><i class=\"fa fa-check\"></i></div>\n                                <button type=\"button\" class=\"rembg-template-del-btn\" data-path=\"").concat(res.path, "\" title=\"\u5220\u9664\u6B64\u80CC\u666F\u6A21\u677F\">\n                                    <i class=\"fa fa-trash-can\"></i>\n                                </button>\n                            </div>\n                            <div class=\"rembg-template-name\">\u81EA\u5B9A\u4E49: ").concat(res.name, "</div>\n                        </div>\n                    "));
          grid.prepend(newCard);
          applyTemplateComposite(res.path, '自定义: ' + res.name, newCard);
        } else {
          notifyRembg('error', res.error || '上传模板失败');
        }
      }).fail(function () {
        uploadBtn.find('span').text(originalText);
        uploadInput.val('');
        if (requestId !== cutoutRequestId) return;
        notifyRembg('error', '上传背景模板失败');
      });
    }
    function completeRembgAndApplyToStage() {
      if (cutoutState === 'extracting' || cutoutState === 'animating') {
        notifyRembg('info', '正在准备人物前景，请稍候');
        return;
      }
      finalizeRequested = true;
      flushRecomposite();
      if (isProcessingTemplate) {
        notifyRembg('info', '正在完成背景合成，请稍候...');
        return;
      }
      finalizeRequested = false;
      finalizeStageReplacement();
    }
    function finalizeStageReplacement() {
      if (isProcessingTemplate) return;
      var resultPage = $('.stage[data-stage="result"]');
      var finalFile = latestCompositeFile;
      if (!finalFile) {
        notifyRembg('error', '当前背景尚未成功合成，请重新选择背景后再完成');
        return;
      }

      // 1. Hide interactive transform controls and real-time cutout viewport
      modal.removeClass('active sidenav--open').hide();
            $('#btnClassicCustomBg, .rembgbtn').removeClass('active is-drawer-open').attr('aria-expanded', 'false');
      transformBox.hide();
      resizerBar.hide();
      personTransformBox.hide();
      personResizerBar.hide();
      cutoutViewport.hide();
      resultPage.removeClass('cutout-mode-active');

      // 2. Replace the image on the main result stage
      var finalUrl = '/data/images/' + finalFile + '?v=' + Date.now();
      resultPage.attr('data-img', finalFile);
      // CRITICAL: Set data-original-img to this new composite image!
      // Subsequent filter operations in filter menu will modify THIS image, NOT the raw camera photo!
      resultPage.attr('data-original-img', finalFile);
      resultPage.attr('data-matted-composite', finalFile);
      if (window.photoEditState) {
        window.photoEditState.setCurrent(finalFile);
        window.photoEditState.background = currentTemplate || '';
        window.photoEditState.begin('background');
      }
      resultPage.css('--stage-background-image', 'url("' + finalUrl + '")');
      if (resultPage[0]) {
        resultPage[0].style.setProperty('--stage-background-image', 'url("' + finalUrl + '")');
        resultPage[0].style.setProperty('--stage-result-filter', 'none');
      }
      resultPage.css('--stage-result-filter', 'none');
      document.documentElement.style.setProperty('--stage-result-filter', 'none');
      resultPage.removeClass(function (index, className) {
        return (className.match(/(^|\s)filter-effect-\S+/g) || []).join(' ');
      });
      cutoutViewport.removeClass(function (index, className) {
        return (className.match(/(^|\s)filter-effect-\S+/g) || []).join(' ');
      });
      cutoutPerson.removeClass(function (index, className) {
        return (className.match(/(^|\s)filter-effect-\S+/g) || []).join(' ');
      });
      if (cutoutViewport[0]) {
        cutoutViewport[0].style.removeProperty('filter');
      }
      if (cutoutPerson[0]) {
        cutoutPerson[0].style.removeProperty('filter');
      }

      // Reset active filter card back to "原图" (plain)
      $('#filternav .filter-card, #filternav .sidenav-list-item, .filter-card, .sidenav-list-item').removeClass('filter-card--active sidenav-list-item--active focused');
      $("#filternav .filter-card[data-filter=\"plain\"], #filternav .sidenav-list-item[data-filter=\"plain\"]").addClass('filter-card--active sidenav-list-item--active');
      if (window.photoBooth) {
        window.photoBooth.applyEditFilter('plain', true);
        window.photoBooth.setBaseImage(finalFile);
      }

      // 3. Update QR code on stage if visible
      var qrImg = document.querySelector('#resultQR img.stage-code__image');
      if (qrImg && window.environment && window.environment.publicFolders) {
        qrImg.src = window.environment.publicFolders.api + '/qrcode.php?filename=' + finalFile;
      }
      var filterThumbUrl = 'resources/img/filter_model_thumb.jpg';
      $('.filter-preview-img').each(function () {
        $(this).attr('src', filterThumbUrl);
      });
      if (window.photoBooth && typeof window.photoBooth.resetTimeOut === 'function') {
        window.photoBooth.resetTimeOut();
      }
      notifyRembg('success', '已替换为主界面成片，您可继续选择滤镜进行调整');
    }

    /* Comprehensive cleanup and state reset when user takes a new picture */
    function cleanupRembg() {
      compositeRequestId++;
      if (compositeRequest) compositeRequest.abort();
      compositeRequest = null;
      compositeDirty = false;
      finalizeRequested = false;
      latestCompositeFile = '';
      setMattingLoadingState(false);
      contourAnimationId++;
      cutoutRequestId++;
      cutoutState = 'idle';
      isCutoutExtracted = false;
      cutoutPngUrl = '';
      isProcessingTemplate = false;
      isCustomTemplateActive = false;
      currentTemplate = '';
      baseOriginalName = '';
      customScale = 1.0;
      customOffsetX = 0;
      customOffsetY = 0;
      if (recompositeTimer) {
        clearTimeout(recompositeTimer);
        recompositeTimer = null;
      }
      personScale = 1.0;
      personOffsetX = 0;
      personOffsetY = 0;
      isPersonActive = false;
      if (personRecompositeTimer) {
        clearTimeout(personRecompositeTimer);
        personRecompositeTimer = null;
      }

      // Hide and reset cutout person
      cutoutPerson.css('visibility', 'hidden').removeClass('is-lifted is-dragging');
      if (cutoutPerson[0]) {
        cutoutPerson[0].style.setProperty('transform', 'none', 'important');
      }
      personImg.attr('src', '');

      // Hide and reset background element
      cutoutBg.css({
        'background-image': 'none',
        'background-color': 'transparent',
        'transform': 'none'
      });
      if (cutoutBg[0]) {
        cutoutBg[0].style.setProperty('background-image', 'none', 'important');
        cutoutBg[0].style.setProperty('background-color', 'transparent', 'important');
      }

      // Clear contour canvas
      if (contourCanvas.length) {
        var contourContext = contourCanvas[0].getContext('2d');
        if (contourContext) {
          contourContext.clearRect(0, 0, contourCanvas[0].width, contourCanvas[0].height);
        }
      }

      // Hide viewport & all transform controls
      cutoutViewport.removeClass(function (index, className) {
        return (className.match(/(^|\s)filter-effect-\S+/g) || []).join(' ');
      });
      cutoutPerson.removeClass(function (index, className) {
        return (className.match(/(^|\s)filter-effect-\S+/g) || []).join(' ');
      });
      if (cutoutViewport[0]) {
        cutoutViewport[0].style.removeProperty('filter');
      }
      if (cutoutPerson[0]) {
        cutoutPerson[0].style.removeProperty('filter');
      }
      cutoutViewport.hide();
      transformBox.hide();
      resizerBar.hide();
      personTransformBox.hide();
      personResizerBar.hide();

      // Clear result stage cutout state and original image reference
      var resultPage = $('.stage[data-stage="result"]');
      resultPage.removeClass('cutout-mode-active');
      resultPage.removeAttr('data-original-img');

      // Close right drawer and reset card selections
      modal.removeClass('active sidenav--open').hide();
            $('#btnClassicCustomBg, .rembgbtn').removeClass('active is-drawer-open').attr('aria-expanded', 'false');
      grid.find('.rembg-template-card').removeClass('active is-locked is-loading');
      selectedNameEl.text('').hide();
    }

    // Expose globally so core.js can call it during api.reset() and api.renderPic()
    window.rembgReset = cleanupRembg;

    // Proactively bind to all buttons that trigger new capture, home, or retake
    $(document).off('click.rembgCleanup').on('click.rembgCleanup', '.takePic, .newpic, .takeCustom, .newcustom, .takeVideo, .newvideo, .newVideo, .homebtn, [data-command="homebtn"], [data-command="newpic"], [data-command="takePic"]', function () {
      cleanupRembg();
    });
    function revertToOriginal() {
      compositeRequestId++;
      if (compositeRequest) compositeRequest.abort();
      compositeRequest = null;
      compositeDirty = false;
      finalizeRequested = false;
      clearTimeout(recompositeTimer);
      clearTimeout(personRecompositeTimer);
      recompositeTimer = null;
      personRecompositeTimer = null;
      var resultPage = $('.stage[data-stage="result"]');
      var origCapture = resultPage.attr('data-camera-img') || baseOriginalName;
      if (!origCapture) return;
      contourAnimationId++;
      cutoutRequestId++;
      cutoutState = 'idle';
      isCutoutExtracted = false;
      cutoutPngUrl = '';
      latestCompositeFile = '';
      isProcessingTemplate = false;
      isCustomTemplateActive = false;
      personScale = 1.0;
      personOffsetX = 0;
      personOffsetY = 0;
      isPersonActive = false;
      cutoutPerson.css('visibility', 'hidden').removeClass('is-lifted is-dragging');
      if (cutoutPerson[0]) {
        cutoutPerson[0].style.setProperty('transform', 'none', 'important');
      }
      personImg.attr('src', '');
      cutoutBg.css({
        'background-image': 'none',
        'background-color': 'transparent',
        'transform': 'none'
      });
      if (cutoutBg[0]) {
        cutoutBg[0].style.setProperty('background-image', 'none', 'important');
        cutoutBg[0].style.setProperty('background-color', 'transparent', 'important');
      }
      if (contourCanvas.length) {
        var contourContext = contourCanvas[0].getContext('2d');
        if (contourContext) {
          contourContext.clearRect(0, 0, contourCanvas[0].width, contourCanvas[0].height);
        }
      }
      cutoutViewport.hide();
      transformBox.hide();
      resizerBar.hide();
      personTransformBox.hide();
      personResizerBar.hide();
      resultPage.removeClass('cutout-mode-active');
      var origUrl = '/data/images/' + origCapture + '?v=' + Date.now();
      resultPage.attr('data-img', origCapture);
      resultPage.attr('data-original-img', origCapture);
      resultPage.removeAttr('data-matted-composite');
      resultPage.css('--stage-background-image', "url(\"".concat(origUrl, "\")"));
      resultPage.css('--stage-result-filter', 'none');
      $('#stageCutoutPerson').css('filter', 'none');
      $('#filternav .filter-card, #filternav .sidenav-list-item, .filter-card, .sidenav-list-item').removeClass('filter-card--active sidenav-list-item--active focused');
      $("#filternav .filter-card[data-filter=\"plain\"], #filternav .sidenav-list-item[data-filter=\"plain\"]").addClass('filter-card--active sidenav-list-item--active');
      if (window.photoBooth) {
        window.photoBooth.applyEditFilter('plain', true);
        window.photoBooth.setBaseImage(origCapture);
      }
      if (window.photoEditState) {
        window.photoEditState.setCurrent(origCapture);
        window.photoEditState.background = '';
        window.photoEditState.filter = 'plain';
        window.photoEditState.begin('reset-background');
      }
      var filterThumbUrl = 'resources/img/filter_model_thumb.jpg';
      $('.filter-preview-img').each(function () {
        $(this).attr('src', filterThumbUrl);
      });
      var qrImg = document.querySelector('#resultQR img.stage-code__image');
      if (qrImg && window.environment && window.environment.publicFolders) {
        qrImg.src = window.environment.publicFolders.api + '/qrcode.php?filename=' + origCapture;
      }
      currentTemplate = '';
      grid.find('.rembg-template-card').removeClass('active is-locked is-loading');
      modal.removeClass('active sidenav--open').hide();
            $('#btnClassicCustomBg, .rembgbtn').removeClass('active is-drawer-open').attr('aria-expanded', 'false');
      notifyRembg('info', '已还原为拍摄原图');
    }
    window.startMattingAndFlow = startMattingAndFlow;
    window.completeRembgAndApplyToStage = completeRembgAndApplyToStage;
    window.isCutoutViewportActive = function () {
      return $('#stageCutoutViewport').is(':visible') || $('#stagePersonTransformBox').is(':visible');
    };
  }
  $(document).ready(function () {
    initRembg();
  });
})(jQuery);