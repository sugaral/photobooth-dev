"use strict";

function _typeof2(o) { "@babel/helpers - typeof"; return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof2(o); }
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _regenerator() {
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */var e,
    t,
    r = "function" == typeof Symbol ? Symbol : {},
    n = r.iterator || "@@iterator",
    o = r.toStringTag || "@@toStringTag";
  function i(r, n, o, i) {
    var c = n && n.prototype instanceof Generator ? n : Generator,
      u = Object.create(c.prototype);
    return _regeneratorDefine2(u, "_invoke", function (r, n, o) {
      var i,
        c,
        u,
        f = 0,
        p = o || [],
        y = !1,
        G = {
          p: 0,
          n: 0,
          v: e,
          a: d,
          f: d.bind(e, 4),
          d: function d(t, r) {
            return i = t, c = 0, u = e, G.n = r, a;
          }
        };
      function d(r, n) {
        for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
          var o,
            i = p[t],
            d = G.p,
            l = i[2];
          r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
        }
        if (o || r > 1) return a;
        throw y = !0, n;
      }
      return function (o, p, l) {
        if (f > 1) throw TypeError("Generator is already running");
        for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
          i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
          try {
            if (f = 2, i) {
              if (c || (o = "next"), t = i[o]) {
                if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                if (!t.done) return t;
                u = t.value, c < 2 && (c = 0);
              } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
              i = e;
            } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
          } catch (t) {
            i = e, c = 1, u = t;
          } finally {
            f = 1;
          }
        }
        return {
          value: t,
          done: y
        };
      };
    }(r, o, i), !0), u;
  }
  var a = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  t = Object.getPrototypeOf;
  var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () {
      return this;
    }), t),
    u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
  function f(e) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () {
    return this;
  }), _regeneratorDefine2(u, "toString", function () {
    return "[object Generator]";
  }), (_regenerator = function _regenerator() {
    return {
      w: i,
      m: f
    };
  })();
}
function _regeneratorDefine2(e, r, n, t) {
  var i = Object.defineProperty;
  try {
    i({}, "", {});
  } catch (e) {
    i = 0;
  }
  _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) {
    function o(r, n) {
      _regeneratorDefine2(e, r, function (e) {
        return this._invoke(r, n, e);
      });
    }
    r ? i ? i(e, r, {
      value: n,
      enumerable: !t,
      configurable: !t,
      writable: !t
    }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
  }, _regeneratorDefine2(e, r, n, t);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
/* eslint n/no-unsupported-features/node-builtins: "off" */
/* globals initPhotoSwipeFromDOM initRemoteBuzzerFromDOM processChromaImage remoteBuzzerClient rotaryController globalGalleryHandle photoboothTools photoboothPreview virtualKeyboard csrf */

/* global createScreensaver */
// Shared edit state for background, beauty and filters.
window.photoEditState = window.photoEditState || {
  rawFile: '',
  currentFile: '',
  background: '',
  filter: 'plain',
  beauty: {},
  revision: 0,
  begin: function begin(kind) {
    this.revision += 1;
    this.pending = kind || '';
    return this.revision;
  },
  isCurrent: function isCurrent(revision) {
    return revision === this.revision;
  },
  setCurrent: function setCurrent(file) {
    if (file) this.currentFile = String(file).split('?')[0].split('/').pop();
    return this.currentFile;
  },
  sync: function sync(stage) {
    var node = stage || document.querySelector('.stage[data-stage="result"]');
    if (!node) return this.currentFile;
    var file = node.getAttribute('data-img') || '';
    if (file) this.setCurrent(file);
    return this.currentFile;
  }
};
var photoBooth = function () {
  var PhotoStyle = {
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
  var api = {},
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
    usesBackgroundPreview = config.preview.asBackground && config.preview.mode === PreviewMode.DEVICE.valueOf() && (config.commands.preview && !config.preview.bsm || !config.commands.preview),
    timeToLive = parseInt(config.picture.time_to_live, 10) * 1000,
    retryTimeout = config.picture.retry_timeout * 1000,
    notificationTimeout = config.ui.notification_timeout * 1000,
    screensaverMode = config.screensaver.mode,
    screensaverEnabled = config.screensaver.enabled && config.screensaver.timeout_minutes > 0 && (screensaverMode === 'gallery' || screensaverMode === 'folder' || (screensaverMode === 'video' ? !!config.screensaver.video_source : !!config.screensaver.image_source)),
    screensaverTimeoutMs = (config.screensaver.timeout_minutes || 0) * 60000,
    screensaverSwitchMs = (config.screensaver.switch_seconds || 60) * 1000,
    urlSafe = function urlSafe(src) {
      return src ? encodeURI(src) : '';
    };
  var timeOut,
    chromaFile = '',
    imgFilter = config.filters.defaults,
    command,
    startTime,
    endTime,
    totalTime;
  api.takingPic = false;
  api.chromaimage = '';
  api.filename = '';
  api.photoStyle = '';
  var editTools = window.PhotoboothEditSession;
  var compositeSaves = new editTools.SaveCoordinator(30000);
  var editHistory = new editTools.History(25);
  var editSession = 0;
  var baseImageSize = null;
  var autoPrintTimer = null;
  var activeGestureCancel = null;
  var saveSequence = 0;
  // Keep at most one encoded image so retries upload identical bytes with the same ID.
  var pendingComposite = null;
  var deliveryActions = new Set();
  api.invalidateComposite = function () {
    compositeSaves.invalidate();
    clearTimeout(autoPrintTimer);
    window.lastRenderedComposite = null;
    $('#resultQR').remove();
    window.photoEditState.begin('edit');
  };
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
    window.photoEditState.revision += 1;
    window.photoEditState.rawFile = '';
    window.photoEditState.currentFile = '';
    window.photoEditState.background = '';
    window.photoEditState.filter = 'plain';
    window.photoEditState.beauty = {};
    loader.css('--stage-background', 'var(--background-countdown-color)');
    loader.removeClass('stage--active');
    loaderButtonBar.empty();
    loaderMessage.empty();
    loaderMessage.removeClass('stage-message--error');
    resultPage.removeAttr('style data-img');
    resultPage.removeClass('stage--active');
    studioPage.removeClass('stage--active');
    $('body').removeClass('mode--studio mode--result is-capturing');
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
    if (typeof api.resetEditSession === 'function') {
      api.resetEditSession();
    }
    window.burstModeActive = false;
    $('#aiTemplateModal').hide();
    $('#aiShuttleOverlay').removeClass('is-active').hide();
    $('#classicLoaderOverlay').removeClass('is-active').hide();
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
    var params = new URLSearchParams(window.location.search);
    if (params.has('screensaverPreview')) {
      api.screensaver.show(true);
    }
  };
  api.screensaver = createScreensaver({
    config: config,
    environment: environment,
    startPage: startPage,
    overlay: screensaverOverlay,
    videoEl: screensaverVideo,
    imageEl: screensaverImage,
    textTop: screensaverTextTop,
    textCenter: screensaverTextCenter,
    textBottom: screensaverTextBottom,
    screensaverEnabled: screensaverEnabled,
    screensaverMode: screensaverMode,
    screensaverTimeoutMs: screensaverTimeoutMs,
    screensaverSwitchMs: screensaverSwitchMs,
    urlSafe: urlSafe,
    photoboothTools: photoboothTools
  });
  var initQuickSettings = function initQuickSettings() {
    var modal = $('#quickSettingsModal');
    if (!modal.length) return;
    var btnOpen = $('#btnQuickSettings');
    var btnClose = $('#btnQuickSettingsClose, #btnQuickSettingsDone, #quickSettingsBackdrop');
    var selectCamera = $('#settingCameraSelect');
    var btnRefresh = $('#btnRefreshCameras');
    var hintText = $('#settingCameraHint');
    var miniVideo = document.getElementById('settingCameraMiniVideo');
    var placeholder = $('.settings-camera-preview-placeholder');

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
        var pref = window.photoboothPreview.getPreferredCamera && window.photoboothPreview.getPreferredCamera() || {
          id: localStorage.getItem('photobooth_preferred_camera_id') || localStorage.getItem('photobooth_preferred_camera') || '',
          label: localStorage.getItem('photobooth_preferred_camera_label') || ''
        };
        selectCamera.empty();
        var matchedIndex = -1;
        cameras.forEach(function (cam, index) {
          var label = cam.label || '摄像头 ' + (index + 1);
          var opt = $('<option>').val(cam.deviceId).text(label).data('label', label);

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
      var selectedId = $(this).val();
      var selectedLabel = $(this).find('option:selected').data('label') || $(this).find('option:selected').text();
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

    // 4. AI 推理设备与 CPU 线程数设置（严格按下拉选择生效）
    var selectDevice = $('#settingInferenceDevice');
    var gpuInfoBox = $('#settingsGpuInfoBox');
    var cpuBox = $('#settingsCpuBox');
    var gpuNameEl = $('#settingsGpuName');
    var selectCpu = $('#settingCpuThreadsSelect');
    var selectEngine = $('#settingMattingEngine');
    var cpuHint = $('#settingCpuThreadsHint');
    var appliedDeviceMode = String(selectDevice.val() || 'auto');
    var updateDeviceVisibility = function updateDeviceVisibility(mode) {
      var isCpu = mode === 'cpu';
      gpuInfoBox.toggle(!isCpu);
      cpuBox.toggle(isCpu);
    };
    function loadDeviceConfig() {
      if (!selectDevice.length && !selectCpu.length) return;
      $.ajax({
        url: 'api/rembgCpuConfig.php',
        type: 'GET',
        dataType: 'json',
        cache: false,
        success: function success(res) {
          if (res && res.success) {
            var mode = res.gpu_mode || res.live_device || 'auto';
            selectDevice.val(mode);
            appliedDeviceMode = mode;
            if (selectEngine.length && res.engine) selectEngine.val(res.engine);
            updateDeviceVisibility(mode);
            if (res.gpu_name) {
              gpuNameEl.text('抠图运行时设备：' + res.gpu_name);
            } else if (!res.service_online) {
              gpuNameEl.text('AI 服务尚未连接');
            } else if (!res.session_initialized) {
              gpuNameEl.text('抠图模型尚未加载，首次使用后显示运行设备');
            } else {
              gpuNameEl.text('抠图运行时设备：CPU');
            }
            var threads = res.live_threads || res.threads || 8;
            selectCpu.val(String(threads));
            cpuHint.html('<i class="fa fa-info-circle"></i> 纯 CPU 多核推理模式 · ' + threads + ' 核心并行计算');
          }
        },
        error: function error() {
          var fallbackThreads = config.rembg && config.rembg.cpu_threads ? config.rembg.cpu_threads : 8;
          selectCpu.val(String(fallbackThreads));
        }
      });
    }
    selectDevice.on('change', function () {
      var mode = String($(this).val() || 'auto');
      var previousMode = appliedDeviceMode;
      var isCpu = mode === 'cpu';
      updateDeviceVisibility(mode);
      var payload = {
        gpu_mode: mode
      };
      if (isCpu) payload.threads = parseInt(selectCpu.val(), 10) || 8;
      selectDevice.prop('disabled', true);
      $.ajax({
        url: 'api/rembgCpuConfig.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        dataType: 'json'
      }).done(function (res) {
        if (res && res.success) {
          appliedDeviceMode = mode;
          if (config.rembg) config.rembg.gpu_mode = mode;
          return;
        }
        selectDevice.val(previousMode);
        updateDeviceVisibility(previousMode);
        if (res && res.error) window.alert(res.error);
      }).fail(function (jqXHR) {
        selectDevice.val(previousMode);
        updateDeviceVisibility(previousMode);
        var error = jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.error;
        if (error) window.alert(error);
      }).always(function () {
        selectDevice.prop('disabled', false);
      });
    });
    selectEngine.on('change', function () {
      var engine = String($(this).val() || 'birefnet');
      selectEngine.prop('disabled', true);
      $.ajax({
        url: 'api/rembgCpuConfig.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          engine: engine
        }),
        dataType: 'json'
      }).done(function (res) {
        if (res && res.success && config.rembg) config.rembg.engine = engine;
      }).always(function () {
        selectEngine.prop('disabled', false);
      });
    });
    if (selectCpu.length) {
      loadDeviceConfig();
      selectCpu.on('change', function () {
        var newThreads = parseInt($(this).val(), 10) || 8;
        cpuHint.html('<i class="fa fa-spinner fa-spin"></i> 正在即时应用核心配置...');
        selectCpu.prop('disabled', true);
        $.ajax({
          url: 'api/rembgCpuConfig.php',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            gpu_mode: selectDevice.val() || 'cpu',
            threads: newThreads
          }),
          dataType: 'json',
          success: function success(res) {
            selectCpu.prop('disabled', false);
            if (res && res.success) {
              if (config.rembg) {
                config.rembg.cpu_threads = newThreads;
              }
              cpuHint.html('<i class="fa fa-circle-check" style="color: #10b981; font-weight: bold;"></i> ' + (res.message || '已即时生效为 ' + newThreads + ' 核心并行计算'));
            } else {
              cpuHint.html('<i class="fa fa-circle-exclamation" style="color: #ef4444;"></i> 设置失败：' + (res.error || '未知错误'));
            }
          },
          error: function error() {
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
      if (typeof window.loadQuickSettingsBeauty === 'function') {
        window.loadQuickSettingsBeauty();
      }
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
  var updateFilterPreviews = function updateFilterPreviews() {
    $('.filter-preview-img').attr('src', window.PhotoboothCatalog.sample);
  };
  api.navbar = {
    open: function open() {
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
    close: function close() {
      filternav.removeClass('sidenav--open');
    },
    toggle: function toggle() {
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
  var setFiltersEnabled = function setFiltersEnabled(enabled) {
    filternav.css('pointer-events', enabled ? '' : 'none');
    filternav.toggleClass('filters--disabled', !enabled);
    $('#studioFiltersGallery button, #paneFilters input').prop('disabled', !enabled);
  };
  api.stopPreviewAndCaptureFromVideo = function () {
    if (config.preview.camTakesPic) {
      var vid = previewVideo.get(0);
      var canvas = videoSensor.get(0);
      var beautyCanvas = document.getElementById('preview--beauty-canvas');
      var p = liveBeautyParams || {};
      var beautyEnabled = config.beauty && config.beauty.enabled !== false && config.beauty.auto_apply !== false;
      var hasBeauty = beautyEnabled && (p.smooth > 0 || p.white > 0 || p.rosy > 0 || p.clarity > 0 || p.eye > 0 || p.slim > 0);
      var currentMode = window.sessionPhotoboothMode || window.photoboothMode || $('body').attr('data-studio-mode');
      // For ai_swap, capture the pristine raw camera frame so Inswapper extracts true identity and natural skin tone without double-whitening
      var sourceEl = hasBeauty && currentMode !== 'ai_swap' && beautyCanvas && beautyCanvas.width > 0 && beautyCanvas.height > 0 && $(beautyCanvas).is(':visible') ? beautyCanvas : vid;
      if (sourceEl && (sourceEl.videoWidth > 0 || sourceEl.width > 0)) {
        var w = sourceEl.videoWidth || sourceEl.width;
        var h = sourceEl.videoHeight || sourceEl.height;
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(sourceEl, 0, 0);
      } else if (canvas && (canvas.width <= 0 || canvas.height <= 0)) {
        canvas.width = 1280;
        canvas.height = 720;
        var ctx = canvas.getContext('2d');
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
    create: function create() {
      if (api.countdown.element === null) {
        var element = document.createElement('div');
        element.classList.add('countdown');
        document.body.append(element);
        api.countdown.element = element;
      }
      if (api.countdown.audioElement === null) {
        var audioElement = document.createElement('audio');
        document.body.append(audioElement);
        api.countdown.audioElement = audioElement;
      }
    },
    destroy: function destroy() {
      if (api.countdown.element !== null) {
        api.countdown.element.remove();
        api.countdown.element = null;
      }
      if (api.countdown.audioElement !== null) {
        api.countdown.audioElement.remove();
        api.countdown.audioElement = null;
      }
    },
    start: function start(seconds) {
      photoboothTools.console.log('Countdown started. Set to ' + seconds + ' seconds.');
      api.countdown.create();
      return new Promise(function (resolve) {
        var stop = parseInt(config.preview.stop_time, 10) > seconds ? 0 : parseInt(config.preview.stop_time, 10);
        photoboothTools.console.logDev('Preview: core: stop at ' + stop);
        var startTime = performance.now();
        var targetTime = startTime + seconds * 1000;
        var lastSecondShown = null;
        var _tick = function tick() {
          var now = performance.now();
          var remainingSeconds = Math.ceil((targetTime - now) / 1000);

          // Only update when we moved to the next integer second
          if (remainingSeconds !== lastSecondShown) {
            lastSecondShown = remainingSeconds;
            photoboothTools.console.logDev('Preview: core: countdown seconds ' + remainingSeconds);
            api.countdown.element.innerHTML = '';
            if (remainingSeconds > 0) {
              // dont show the 0 as countdown number
              var numberElement = document.createElement('div');
              numberElement.classList.add('countdown-number');
              numberElement.textContent = Number(remainingSeconds).toString();
              api.countdown.element.appendChild(numberElement);
            }
            if (config.sound.enabled && config.sound.countdown_enabled) {
              var soundfile = photoboothTools.getSound('counter-' + Number(remainingSeconds).toString());
              if (soundfile !== null) {
                api.countdown.audioElement.src = soundfile;
                api.countdown.audioElement.play()["catch"](function (error) {
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
              window.requestAnimationFrame(_tick);
            } else {
              setTimeout(_tick, 50);
            }
          }
        };
        _tick();
      });
    }
  };
  api.cheese = {
    element: null,
    audioElement: null,
    create: function create() {
      if (api.cheese.audioElement === null) {
        var audioElement = document.createElement('audio');
        document.body.append(audioElement);
        api.cheese.audioElement = audioElement;
      }
      if (api.cheese.element === null) {
        var element = document.createElement('div');
        element.classList.add('cheese');
        if (config.ui.shutter_cheese_img != null && config.ui.shutter_cheese_img !== '') {
          var image = document.createElement('img');
          image.src = config.ui.shutter_cheese_img;
          var imageElement = document.createElement('div');
          imageElement.classList.add('cheese-image');
          imageElement.appendChild(image);
          element.appendChild(imageElement);
        } else if (api.photoStyle === PhotoStyle.VIDEO) {
          var labelElement = document.createElement('div');
          labelElement.classList.add('cheese-label');
          labelElement.textContent = config.video.cheese;
          element.appendChild(labelElement);
        } else {
          var _labelElement = document.createElement('div');
          _labelElement.classList.add('cheese-label');
          _labelElement.textContent = photoboothTools.getTranslation('cheese');
          element.appendChild(_labelElement);
        }
        document.body.append(element);
        api.cheese.element = element;
      }
    },
    destroy: function destroy() {
      if (api.cheese.audioElement !== null) {
        api.cheese.audioElement.remove();
        api.cheese.audioElement = null;
      }
      if (api.cheese.element !== null) {
        api.cheese.element.remove();
        api.cheese.element = null;
      }
    },
    start: function start() {
      photoboothTools.console.log('Cheese: Start');
      api.cheese.create();
      return new Promise(function (resolve) {
        if (config.sound.enabled && config.sound.cheese_enabled) {
          var soundfile = photoboothTools.getSound('cheese');
          if (soundfile !== null) {
            api.cheese.audioElement.src = soundfile;
            api.cheese.audioElement.play()["catch"](function (error) {
              photoboothTools.console.log('Error with audio.play: ' + error);
            });
          }
        }
        setTimeout(function () {
          photoboothTools.console.log('Cheese: End');
          resolve();
        }, config.picture.cheese_time);
      });
    }
  };
  api.shutter = {
    element: null,
    create: function create() {
      if (api.shutter.element === null) {
        var flash = document.createElement('div');
        flash.classList.add('shutter-flash');
        var aperture = document.createElement('div');
        aperture.classList.add('shutter-aperture');
        var element = document.createElement('div');
        element.classList.add('shutter');
        element.appendChild(flash);
        element.appendChild(aperture);
        document.body.append(element);
        api.shutter.element = element;
      }
    },
    destroy: function destroy() {
      if (api.shutter.element !== null) {
        api.shutter.element.remove();
        api.shutter.element = null;
      }
    },
    start: function start() {
      api.shutter.create();
      return new Promise(function (resolve) {
        photoboothTools.console.log('Shutter: Start');
        var flash = api.shutter.element.querySelector('.shutter-flash');
        flash.style.transition = 'opacity 0.5s';
        var flashAnimation = flash.animate([{}, {
          opacity: 1
        }], {
          duration: 500,
          fill: 'forwards'
        });
        flashAnimation.onfinish = function () {
          resolve();
        };
      });
    },
    stop: function stop() {
      api.shutter.create();
      return new Promise(function (resolve) {
        photoboothTools.console.log('Shutter: Stop');
        var aperture = api.shutter.element.querySelector('.shutter-aperture');
        aperture.style.transition = 'width 0.5s, padding-bottom 0.5s';
        var apertureAnimation = aperture.animate([{}, {
          width: 0,
          paddingBottom: 0
        }], {
          duration: 500,
          fill: 'forwards'
        });
        apertureAnimation.onfinish = function () {
          api.shutter.destroy();
          resolve();
        };
      });
    }
  };
  api.clearLoaderImage = function () {
    loaderImage.css({
      display: 'none',
      'background-image': ''
    });
    loaderImage.removeAttr('data-img');
  };
  api.shellCommand = function (cmd) {
    var file = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    command = {
      mode: cmd,
      filename: file
    };
    photoboothTools.console.log('Run', cmd);
    photoboothTools.ajaxWithCsrf({
      url: environment.publicFolders.api + '/shellCommand.php',
      method: 'POST',
      data: command
    }).done(function (result) {
      photoboothTools.console.log(cmd, 'result: ', result);
    }).fail(function (xhr, status, errorThrown) {
      if (photoboothTools.isCsrfErrorResponse(xhr)) {
        photoboothTools.handleCsrfMismatch(environment.publicFolders.api + '/shellCommand.php');
        return;
      }
      photoboothTools.console.log(cmd, 'result: ', errorThrown);
    });
  };
  api.thrill = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(photoStyle) {
      var retry,
        savedMode,
        captureRecipe,
        studioSelectVal,
        storedCountdown,
        customSec,
        countdownTime,
        maxGetMediaRetry,
        getMode,
        getUrl,
        _args = arguments,
        _t,
        _t2,
        _t3;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            retry = _args.length > 1 && _args[1] !== undefined ? _args[1] : 0;
            if (!api.takingPic) {
              _context.n = 1;
              break;
            }
            photoboothTools.console.logDev('ERROR: Taking picture in progress already!');
            return _context.a(2);
          case 1:
            if (!config.selfie_mode) {
              _context.n = 2;
              break;
            }
            photoboothTools.console.logDev('ERROR: Taking picture unsupported on selfie mode!');
            return _context.a(2);
          case 2:
            savedMode = window.photoboothMode || 'classic';
            captureRecipe = {
              filter: (_typeof(imgFilter) === 'object' ? imgFilter.value : imgFilter) || 'plain',
              beauty: _objectSpread({}, config.beauty)
            };
            window.sessionPhotoboothMode = savedMode;
            _context.p = 3;
            api.navbar.close();
            api.reset();
            window.photoboothMode = savedMode;
            api.captureRecipe = captureRecipe;
            setFiltersEnabled(false);
            api.closeGallery();
            api.clearLoaderImage();
            remoteBuzzerClient.inProgress(photoStyle);
            api.takingPic = true;
            $('body').addClass('is-capturing');
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
            studioSelectVal = $('#studioCountdownSelect').val();
            storedCountdown = localStorage.getItem('photobooth_custom_countdown');
            customSec = parseInt(studioSelectVal || storedCountdown, 10);
            if (!(customSec && customSec >= 1 && customSec <= 10)) {
              _context.n = 4;
              break;
            }
            countdownTime = customSec;
            _context.n = 8;
            break;
          case 4:
            _t = api.photoStyle;
            _context.n = _t === PhotoStyle.VIDEO ? 5 : _t === PhotoStyle.CUSTOM ? 6 : _t === PhotoStyle.PHOTO ? 7 : 7;
            break;
          case 5:
            countdownTime = parseInt(config.video.cntdwn_time, 10) || 3;
            return _context.a(3, 8);
          case 6:
            countdownTime = parseInt(config.custom.cntdwn_time, 10) || 3;
            return _context.a(3, 8);
          case 7:
            countdownTime = parseInt(config.picture.cntdwn_time, 10) || 3;
            return _context.a(3, 8);
          case 8:
            photoboothTools.console.log('Resolved countdownTime: ' + countdownTime + ' seconds.');
            maxGetMediaRetry = Math.max(countdownTime - 1, 0);
            if (config.commands.preview_kill && maxGetMediaRetry > 0) {
              maxGetMediaRetry = Math.max(countdownTime - parseInt(config.preview.stop_time, 10), 0);
            }
            photoboothPreview.startVideo(CameraDisplayMode.COUNTDOWN, retry, maxGetMediaRetry);
            if ((window.sessionPhotoboothMode || window.photoboothMode) === 'ai_swap') {
              $('#aiPoseGuide').fadeIn(200);
            } else {
              $('#aiPoseGuide').hide();
            }
            if (config.preview.mode !== PreviewMode.NONE.valueOf() && (config.preview.style === PreviewStyle.CONTAIN.valueOf() || config.preview.style === PreviewStyle.SCALE_DOWN.valueOf()) && config.preview.showFrame) {
              if ((api.photoStyle === PhotoStyle.PHOTO || api.photoStyle === PhotoStyle.CUSTOM) && config.picture.take_frame) {
                previewFramePicture.show();
              }
            }
            videoBackground.hide();
            startPage.removeClass('stage--active');
            loader.addClass('stage--active');
            api.screensaver.hide();
            if (!config.get_request.countdown) {
              _context.n = 13;
              break;
            }
            _t2 = api.photoStyle;
            _context.n = _t2 === PhotoStyle.VIDEO ? 9 : _t2 === PhotoStyle.CUSTOM ? 10 : _t2 === PhotoStyle.PHOTO ? 11 : 11;
            break;
          case 9:
            getMode = config.get_request.video;
            return _context.a(3, 12);
          case 10:
            getMode = config.get_request.custom;
            return _context.a(3, 12);
          case 11:
            getMode = config.get_request.picture;
            return _context.a(3, 12);
          case 12:
            getUrl = config.get_request.server + '/' + getMode;
            photoboothTools.getRequest(getUrl);
          case 13:
            _context.n = 14;
            return api.countdown.start(countdownTime);
          case 14:
            _context.n = 15;
            return api.cheese.start();
          case 15:
            if (config.preview.camTakesPic && !photoboothPreview.stream && !config.dev.demo_images) {
              api.errorPic({
                error: 'No preview by device cam available!'
              });
            } else if (api.photoStyle === PhotoStyle.VIDEO) {
              api.takeVideo(retry);
            } else {
              api.takePic(retry);
            }
            _context.n = 17;
            break;
          case 16:
            _context.p = 16;
            _t3 = _context.v;
            photoboothTools.console.log('thrill: unexpected error:', _t3);
            api.errorPic({
              error: _t3.message || 'Unexpected error in thrill'
            });
          case 17:
            return _context.a(2);
        }
      }, _callee, null, [[3, 16]]);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();
  api.takeVideo = function (retry) {
    remoteBuzzerClient.inProgress('in-progress');
    var data = {
      style: api.photoStyle
    };
    api.callTakeVideoApi(data, retry);
  };
  api.takePic = function (retry) {
    try {
      remoteBuzzerClient.inProgress('in-progress');
      api.stopPreviewAndCaptureFromVideo();
      var canvasData = '';
      try {
        canvasData = videoSensor.get(0).toDataURL('image/jpeg', 0.95);
      } catch (canvasErr) {
        photoboothTools.console.log('Failed to export canvas dataURL:', canvasErr);
      }
      var data = {
        filter: 'plain',
        captureRecipe: api.captureRecipe || {
          filter: (_typeof(imgFilter) === 'object' ? imgFilter.value : imgFilter) || 'plain',
          beauty: _objectSpread({}, config.beauty)
        },
        style: api.photoStyle,
        canvasimg: canvasData
      };
      if (api.photoStyle === PhotoStyle.CHROMA) {
        data.file = chromaFile;
      }
      loader.css('--stage-background', 'var(--background-countdown-color)');

      // Seamless Stage Transition: Immediately show high-tech loading overlay on shutter release
      // to eliminate the gap while capture.php is saving/processing the raw image
      if (!window.burstModeActive) {
        var currentMode = window.sessionPhotoboothMode || window.photoboothMode;
        if (currentMode === 'ai_swap') {
          $('#classicLoaderOverlay').removeClass('is-active').hide();
          $('#aiShuttleOverlay').addClass('is-active').show();
          $('#aiShuttleProgressBar').css('width', '5%');
          $('#aiShuttlePercent').text('5%');
          $('#aiShuttleTicker').html('<span class="ai-ticker-step active"><i class="fa fa-camera"></i> 正在读取快门原片，准备开启 AI 时空折跃...</span>');
        } else {
          $('#aiShuttleOverlay').removeClass('is-active').hide();
          $('#classicLoaderOverlay').addClass('is-active').show();
          $('#classicProgressBar').css('width', '10%');
          $('#classicProgressPercent').text('10%');
          $('#classicLoaderTicker').html('<span class="ai-ticker-step active"><i class="fa fa-camera"></i> 正在读取快门原片，准备智能精修…</span>');
        }
      }
      api.callTakePicApi(data, retry);
    } catch (error) {
      photoboothTools.console.log('takePic: unexpected error:', error);
      api.errorPic({
        error: error.message || 'Unexpected error in takePic'
      });
    }
  };
  api.retryTakePic = function (retry) {
    api.takingPic = false;
    retry += 1;
    loaderMessage.text(photoboothTools.getTranslation('retry_message') + ' ' + retry + '/' + config.picture.retry_on_error);
    photoboothTools.console.logDev('Retry to capture image: ' + retry);
    setTimeout(function () {
      api.thrill(api.photoStyle, retry);
    }, retryTimeout);
  };
  api.callTakePicApi = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(data) {
      var retry,
        captureSession,
        _args4 = arguments;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            retry = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : 0;
            captureSession = editSession;
            startTime = new Date().getTime();
            if (typeof api.stopFacePoseAlignmentLoop === 'function') {
              api.stopFacePoseAlignmentLoop();
            }
            $('#aiPoseGuide').hide();
            photoboothTools.console.logDev('Capture image.');
            photoboothTools.ajaxWithCsrf({
              url: environment.publicFolders.api + '/capture.php',
              method: 'POST',
              data: data,
              timeout: 25000
            }).done(/*#__PURE__*/function () {
              var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(result) {
                var _t4;
                return _regenerator().w(function (_context2) {
                  while (1) switch (_context2.p = _context2.n) {
                    case 0:
                      if (!(captureSession !== editSession)) {
                        _context2.n = 1;
                        break;
                      }
                      return _context2.a(2);
                    case 1:
                      _context2.p = 1;
                      api.cheese.destroy();
                      if (!config.ui.shutter_animation) {
                        _context2.n = 3;
                        break;
                      }
                      _context2.n = 2;
                      return api.shutter.start();
                    case 2:
                      _context2.n = 3;
                      return api.shutter.stop();
                    case 3:
                      endTime = new Date().getTime();
                      totalTime = endTime - startTime;
                      photoboothTools.console.log('Took ' + data.style, result);
                      if (!(captureSession !== editSession)) {
                        _context2.n = 4;
                        break;
                      }
                      return _context2.a(2);
                    case 4:
                      result.captureRecipe = data.captureRecipe;
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
                      _context2.n = 6;
                      break;
                    case 5:
                      _context2.p = 5;
                      _t4 = _context2.v;
                      photoboothTools.console.log('callTakePicApi.done: unexpected error:', _t4);
                      api.errorPic({
                        error: _t4.message || 'Unexpected error processing capture result'
                      });
                    case 6:
                      return _context2.a(2);
                  }
                }, _callee2, null, [[1, 5]]);
              }));
              return function (_x3) {
                return _ref3.apply(this, arguments);
              };
            }()).fail(/*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(xhr, status, result) {
                var _t5;
                return _regenerator().w(function (_context3) {
                  while (1) switch (_context3.p = _context3.n) {
                    case 0:
                      _context3.p = 0;
                      if (!(captureSession !== editSession)) {
                        _context3.n = 1;
                        break;
                      }
                      return _context3.a(2);
                    case 1:
                      if (!photoboothTools.isCsrfErrorResponse(xhr)) {
                        _context3.n = 2;
                        break;
                      }
                      photoboothTools.handleCsrfMismatch(environment.publicFolders.api + '/capture.php');
                      return _context3.a(2);
                    case 2:
                      endTime = new Date().getTime();
                      totalTime = endTime - startTime;
                      api.cheese.destroy();
                      if (result === null || result === undefined || typeof result === 'string') {
                        result = {
                          error: result || 'Unexpected error: result is null or undefined'
                        };
                      } else if (!result.error) {
                        result.error = 'Unknown error occurred';
                      }
                      photoboothTools.console.log('Took ' + data.style, result);
                      photoboothTools.console.logDev('Failed after ' + totalTime + 'ms');
                      if (config.picture.retry_on_error > 0 && retry < config.picture.retry_on_error) {
                        photoboothTools.console.logDev('ERROR: Taking picture failed. Retrying. Retry: ' + retry + ' / ' + config.picture.retry_on_error);
                        api.retryTakePic(retry);
                      } else {
                        api.errorPic(result);
                      }
                      _context3.n = 4;
                      break;
                    case 3:
                      _context3.p = 3;
                      _t5 = _context3.v;
                      photoboothTools.console.log('Unexpected error in .fail block', _t5);
                      api.errorPic({
                        error: _t5.message || 'An unexpected error occurred during failure handling'
                      });
                    case 4:
                      return _context3.a(2);
                  }
                }, _callee3, null, [[0, 3]]);
              }));
              return function (_x4, _x5, _x6) {
                return _ref4.apply(this, arguments);
              };
            }());
          case 1:
            return _context4.a(2);
        }
      }, _callee4);
    }));
    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }();
  api.callTakeVideoApi = function (data) {
    var captureSession = editSession;
    if (config.video.animation) {
      videoAnimation.show();
    }
    startTime = new Date().getTime();
    photoboothTools.ajaxWithCsrf({
      url: environment.publicFolders.api + '/capture.php',
      method: 'POST',
      data: data,
      timeout: 25000
    }).done(/*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(result) {
        var defVideoFilter;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              if (!(captureSession !== editSession)) {
                _context5.n = 1;
                break;
              }
              return _context5.a(2);
            case 1:
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
                defVideoFilter = _typeof(imgFilter) === 'object' && imgFilter !== null && imgFilter.value ? imgFilter.value : imgFilter;
                $('#filternav .filter-card, #filternav .sidenav-list-item, .filter-card, .sidenav-list-item').removeClass('filter-card--active sidenav-list-item--active focused');
                $("#filternav .filter-card[data-filter=\"".concat(defVideoFilter, "\"], #filternav .sidenav-list-item[data-filter=\"").concat(defVideoFilter, "\"]")).addClass('filter-card--active sidenav-list-item--active');
                if (result.error) {
                  api.errorPic(result);
                } else {
                  api.processVideo(result);
                }
              } catch (error) {
                photoboothTools.console.log('callTakeVideoApi.done: unexpected error:', error);
                api.errorPic({
                  error: error.message || 'Unexpected error processing video result'
                });
              }
            case 2:
              return _context5.a(2);
          }
        }, _callee5);
      }));
      return function (_x7) {
        return _ref5.apply(this, arguments);
      };
    }()).fail(function (xhr, status, result) {
      try {
        if (captureSession !== editSession) return;
        if (photoboothTools.isCsrfErrorResponse(xhr)) {
          photoboothTools.handleCsrfMismatch(environment.publicFolders.api + '/capture.php');
          return;
        }
        api.cheese.destroy();
        if (result === null || result === undefined || typeof result === 'string') {
          result = {
            error: result || 'Unexpected error: result is null or undefined'
          };
        } else if (!result.error) {
          result.error = 'Unknown error occurred';
        }
        api.errorPic(result);
      } catch (error) {
        photoboothTools.console.log('Unexpected error in .fail block', error);
        api.errorPic({
          error: error.message || 'An unexpected error occurred during failure handling'
        });
      }
    });
  };
  api.errorPic = function (data) {
    setTimeout(function () {
      try {
        api.cheese.destroy();
        api.shutter.destroy();
        setFiltersEnabled(true);
        $('#aiShuttleOverlay, #classicLoaderOverlay').removeClass('is-active').hide();
        $('body').removeClass('is-capturing');
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
        } catch (_unused) {
          // ignore UI update failure
        }
        setTimeout(function () {
          photoboothTools.reloadPage();
        }, notificationTimeout || 5000);
      } else {
        var reloadButton = $('<button type="button" class="button rotaryfocus">');
        reloadButton.append('<span class="button--icon"><i class="' + config.icons.refresh + '"></i></span>');
        reloadButton.append('<span class="button--label">' + photoboothTools.getTranslation('reload') + '</span>');
        reloadButton.appendTo(loaderButtonBar).on('click', function () {
          photoboothTools.reloadPage();
        });
      }
    }, 500);
  };
  api.prepareBurstPhoto = /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(result, recipe, session) {
      var _window$selectedClass;
      var check, data, _i, _arr, _recipe$beauty, _recipe$beauty2, key, processed, blob, form, saved;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            check = function check() {
              if (session !== editSession) throw new Error('拍摄已取消');
            };
            data = {
              file: result.file,
              source_file: result.file,
              filter: 'plain',
              style: 'photo',
              template: ((_window$selectedClass = window.selectedClassicTemplate) === null || _window$selectedClass === void 0 ? void 0 : _window$selectedClass.image) || ''
            };
            var beautyActive = recipe.beauty && recipe.beauty.enabled !== false && recipe.beauty.auto_apply !== false;
            for (_i = 0, _arr = ['smooth', 'white', 'rosy', 'clarity', 'eye', 'slim']; _i < _arr.length; _i++) {
              key = _arr[_i];
              data[key] = beautyActive ? (_recipe$beauty = (_recipe$beauty2 = recipe.beauty) === null || _recipe$beauty2 === void 0 ? void 0 : _recipe$beauty2['default_' + key]) !== null && _recipe$beauty !== void 0 ? _recipe$beauty : 0 : 0;
            }
            _context6.n = 1;
            return photoboothTools.ajaxWithCsrf({
              method: 'POST',
              url: environment.publicFolders.api + '/applyEffects.php',
              data: data
            });
          case 1:
            processed = _context6.v;
            check();
            if (!(!processed.file || processed.error)) {
              _context6.n = 2;
              break;
            }
            throw new Error(processed.error || '连拍处理失败');
          case 2:
            if (!(!recipe.filter || recipe.filter === 'plain')) {
              _context6.n = 3;
              break;
            }
            return _context6.a(2, processed.file);
          case 3:
            _context6.n = 4;
            return PhotoboothCompositeRenderer.render({
              baseUrl: environment.publicFolders.images + '/' + processed.file,
              filterCss: filterCssMap[recipe.filter] || 'none',
              frameUrl: null,
              previewHeight: 800,
              layers: []
            }, {
              signal: new AbortController().signal,
              check: check
            });
          case 4:
            blob = _context6.v;
            check();
            form = new FormData();
            form.append('photo', blob, 'burst.png');
            _context6.n = 5;
            return photoboothTools.ajaxWithCsrf({
              method: 'POST',
              url: environment.publicFolders.api + '/uploadPhoto.php',
              data: form,
              processData: false,
              contentType: false
            });
          case 5:
            saved = _context6.v;
            check();
            if (!(!saved.success || !saved.file)) {
              _context6.n = 6;
              break;
            }
            throw new Error(saved.error || '连拍滤镜保存失败');
          case 6:
            return _context6.a(2, saved.file);
        }
      }, _callee6);
    }));
    return function (_x8, _x9, _x0) {
      return _ref6.apply(this, arguments);
    };
  }();
  api.processPic = /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(result) {
      var processSession, recipe, activeCaptureMode, tickerTimer, tplPath, classicTpl, bSmooth, bWhite, bRosy, bClarity, bEye, bSlim, classicTimer, applyData, _t6, beautyActive;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.p = _context7.n) {
          case 0:
            processSession = editSession;
            recipe = result.captureRecipe || {
              filter: 'plain',
              beauty: {}
            };
            startTime = new Date().getTime();
            loader.addClass('stage--active');
            startPage.removeClass('stage--active');
            studioPage.removeClass('stage--active');
            resultPage.removeClass('stage--active');
            setFiltersEnabled(false);

            // Stage 4: Burst Shooting Pipeline
            if (!window.burstModeActive) {
              _context7.n = 7;
              break;
            }
            _context7.p = 1;
            _context7.n = 2;
            return api.prepareBurstPhoto(result, recipe, processSession);
          case 2:
            result.file = _context7.v;
            _context7.n = 4;
            break;
          case 3:
            _context7.p = 3;
            _t6 = _context7.v;
            if (processSession === editSession) {
              setFiltersEnabled(true);
              api.errorPic({
                error: _t6.message || '连拍照片处理失败'
              });
            }
            return _context7.a(2);
          case 4:
            if (!(processSession !== editSession)) {
              _context7.n = 5;
              break;
            }
            return _context7.a(2);
          case 5:
            setFiltersEnabled(true);
            if (!(window.burstRetakeIndex >= 0)) {
              _context7.n = 6;
              break;
            }
            // Single Retake Mode
            window.burstPhotos[window.burstRetakeIndex] = result.file;
            window.burstRetakeIndex = -1;
            loader.removeClass('stage--active');
            api.renderBurstWorkbench();
            return _context7.a(2);
          case 6:
            window.burstPhotos.push(result.file);
            window.burstCurrentShot++;
            if (window.burstCurrentShot < window.burstTotalShots) {
              loaderMessage.html('<h2 style="font-size:2rem;color:#F472B6;margin-bottom:0.5rem;"><i class="fa fa-camera-retro"></i> 第 ' + window.burstCurrentShot + ' 张已捕捉！</h2>' + '<p style="font-size:1.2rem;color:#FFF;">请变换 Pose，第 ' + (window.burstCurrentShot + 1) + ' 张即将抓拍...</p>');
              setTimeout(function () {
                if (processSession === editSession) api.startBurstShot(window.burstCurrentShot);
              }, 2200);
            } else {
              loader.removeClass('stage--active');
              api.renderBurstWorkbench();
            }
            return _context7.a(2);
          case 7:
            // Stage 3.4: Dual Mode Post-Processing Pipeline
            activeCaptureMode = window.sessionPhotoboothMode || window.photoboothMode || 'classic';
            if (!(activeCaptureMode === 'ai_swap')) {
              _context7.n = 9;
              break;
            }

            // Fallback for tplPath: check selectedAiTemplate, active card in grid, first card, or default
            tplPath = window.selectedAiTemplate && window.selectedAiTemplate.id || $('#studioAiTplGrid .wb-tpl-card.active').data('id') || $('#studioAiTplGrid .wb-tpl-card').first().data('id') || 'male_hanfu_01';
            if (!window.selectedAiTemplate) {
              var fallbackCard = $('#studioAiTplGrid .wb-tpl-card.active').first();
              if (!fallbackCard.length) fallbackCard = $('#studioAiTplGrid .wb-tpl-card').first();
              if (fallbackCard.length) {
                window.selectedAiTemplate = {
                  id: fallbackCard.data('id') || tplPath,
                  title: fallbackCard.data('title') || '写真模板',
                  image: fallbackCard.data('image') || '',
                  path: fallbackCard.data('image') || ''
                };
              }
            }
            $('#classicLoaderOverlay').removeClass('is-active').hide();
            $('#aiShuttleOverlay').addClass('is-active').show();
            var aiProgress = 12;
            $('#aiShuttleProgressBar').css('width', aiProgress + '%');
            $('#aiShuttlePercent').text(aiProgress + '%');
            var aiSteps = ['正在定位面部 5 维几何关键点…', '正在提取高精度人像身份特征…', '正在对齐写真姿态与面部朝向…', '正在融合骨相与光影材质…', '正在增强发丝质感与高分辨率成片…'];
            var aiStepIdx = 0;
            $('#aiShuttleTicker').html('<span class="ai-ticker-step active"><i class="fa fa-wand-magic-sparkles"></i> ' + aiSteps[0] + '</span>');
            clearInterval(tickerTimer);
            tickerTimer = setInterval(function () {
              if (aiProgress < 92) {
                aiProgress += Math.floor(Math.random() * 5) + 3;
                if (aiProgress > 92) aiProgress = 92;
                $('#aiShuttleProgressBar').css('width', aiProgress + '%');
                $('#aiShuttlePercent').text(aiProgress + '%');
                var stepTarget = Math.min(Math.floor(aiProgress / 90 * aiSteps.length), aiSteps.length - 1);
                if (stepTarget !== aiStepIdx) {
                  aiStepIdx = stepTarget;
                  $('#aiShuttleTicker').html('<span class="ai-ticker-step active"><i class="fa fa-wand-magic-sparkles"></i> ' + aiSteps[aiStepIdx] + '</span>');
                }
              }
            }, 380);
            _context7.n = 8;
            break;
          case 8:
            var showAiErrorModal = function showAiErrorModal(errMsg) {
              photoboothTools.modal.open('error');
              var mEl = $('.modal[data-type="error"]');
              var mBody = mEl.find('.modal-body');
              mBody.empty();
              mBody.append($('<div style="text-align:center;padding:1.2rem 0.5rem;"></div>').append($('<div style="font-size:3.2rem;margin-bottom:0.8rem;color:#EF4444;"><i class="fa fa-triangle-exclamation"></i></div>'), $('<h3 style="font-size:1.6rem;font-weight:900;margin-bottom:0.8rem;color:#1E293B;">变身拍照提示</h3>'), $('<p style="font-size:1.15rem;margin-bottom:1.8rem;color:#475569;line-height:1.6;max-width:440px;margin-left:auto;margin-right:auto;">').text(errMsg), $('<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:1.2rem;"></div>').append($('<button type="button" class="button" style="background:#8B5CF6;color:#fff;border-radius:9999px;padding:0.75rem 1.8rem;font-weight:800;cursor:pointer;border:none;box-shadow:0 4px 12px rgba(139,92,246,0.35);">📸 重新拍摄</button>').on('click', function () {
                photoboothTools.modal.close();
                api.enterStudio('ai_swap');
                setTimeout(function () {
                  api.thrill(PhotoStyle.PHOTO);
                }, 300);
              }), $('<button type="button" class="button" style="background:#10B981;color:#fff;border-radius:9999px;padding:0.75rem 1.8rem;font-weight:800;cursor:pointer;border:none;box-shadow:0 4px 12px rgba(16,185,129,0.35);">🎨 更换写真模板</button>').on('click', function () {
                photoboothTools.modal.close();
                api.enterStudio('ai_swap');
                $('#tabBtnTemplates').trigger('click');
              }), $('<button type="button" class="button" style="background:#64748B;color:#fff;border-radius:9999px;padding:0.75rem 1.8rem;font-weight:800;cursor:pointer;border:none;">🏠 返回首页</button>').on('click', function () {
                photoboothTools.modal.close();
                api.exitStudio();
              }))));
              mEl.find('.modal-button--close').off('click').on('click', function (e) {
                e.preventDefault();
                photoboothTools.modal.close();
                api.enterStudio('ai_swap');
              });
            };
            beautyActive = recipe.beauty && recipe.beauty.enabled !== false && recipe.beauty.auto_apply !== false;
            bSmooth = beautyActive ? recipe.beauty && recipe.beauty.default_smooth !== undefined ? recipe.beauty.default_smooth : parseInt($('#studioSmoothSlider').val() || 20, 10) : 0;
            bWhite = beautyActive ? recipe.beauty && recipe.beauty.default_white !== undefined ? recipe.beauty.default_white : parseInt($('#studioWhiteSlider').val() || 15, 10) : 0;
            bRosy = beautyActive ? recipe.beauty && recipe.beauty.default_rosy !== undefined ? recipe.beauty.default_rosy : parseInt($('#studioRosySlider').val() || 20, 10) : 0;
            bClarity = beautyActive ? recipe.beauty && recipe.beauty.default_clarity !== undefined ? recipe.beauty.default_clarity : parseInt($('#studioClaritySlider').val() || 15, 10) : 0;
            bEye = beautyActive ? recipe.beauty && recipe.beauty.default_eye !== undefined ? recipe.beauty.default_eye : parseInt($('#studioEyeSlider').val() || 15, 10) : 0;
            bSlim = beautyActive ? recipe.beauty && recipe.beauty.default_slim !== undefined ? recipe.beauty.default_slim : parseInt($('#studioSlimSlider').val() || 15, 10) : 0;
            photoboothTools.ajaxWithCsrf({
              method: 'POST',
              url: environment.publicFolders.api + '/faceswapProcess.php',
              data: {
                file: result.file,
                capture_token: result.capture_token,
                template: tplPath,
                mode: $('#aiFaceMode').val() || 'neural',
                smooth: bSmooth,
                white: bWhite,
                rosy: bRosy,
                clarity: bClarity,
                eye: bEye,
                slim: bSlim
              }
            }).done(function (swapData) {
              if (processSession !== editSession) return;
              if (swapData && swapData.success) {
                clearInterval(tickerTimer);
                $('#aiShuttleProgressBar').css('width', '100%');
                $('#aiShuttlePercent').text('100%');
                $('#aiShuttleTicker').html('<span class="ai-ticker-step active"><i class="fa fa-circle-check"></i> 写真变身完成，正在呈现大片…</span>');
                window.lastAiSourceFile = result.file;
                window.lastAiSwapFile = swapData.file;
                photoboothTools.console.log('AI Face Swap Success:', swapData);
                api.renderPic(swapData.file, swapData.images, result.file, null, recipe.filter);
                $('#aiResultControlBar').show();
                if (window.selectedAiTemplate && window.selectedAiTemplate.title) {
                  $('#aiResultTemplateName').text('变身完成：' + window.selectedAiTemplate.title);
                }
              } else {
                clearInterval(tickerTimer);
                $('#aiShuttleOverlay').removeClass('is-active').hide();
                $('body').removeClass('is-capturing');
                setFiltersEnabled(true);
                var errMsg = swapData && swapData.error ? swapData.error : 'AI 变身换脸处理失败，请重试';
                showAiErrorModal(errMsg);
              }
            }).fail(function (jqXHR, textStatus) {
              clearInterval(tickerTimer);
              if (processSession !== editSession) return;
              $('#aiShuttleOverlay').removeClass('is-active').hide();
              $('body').removeClass('is-capturing');
              setFiltersEnabled(true);
              var serverError = jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.error;
              var errMsg = serverError || 'AI 换脸处理超时或网络异常，请重试';
              showAiErrorModal(errMsg);
            });
            return _context7.a(2);
          case 9:
            // Classic Photobooth Pipeline: Beauty Retouching + Background Template Matting
            classicTpl = window.selectedClassicTemplate && window.selectedClassicTemplate.id && window.selectedClassicTemplate.id !== 'none' ? window.selectedClassicTemplate.image || window.selectedClassicTemplate.path || '' : '';
            beautyActive = recipe.beauty && recipe.beauty.enabled !== false && recipe.beauty.auto_apply !== false;
            bSmooth = beautyActive ? recipe.beauty && recipe.beauty.default_smooth !== undefined ? recipe.beauty.default_smooth : parseInt($('#studioSmoothSlider').val() || 20, 10) : 0;
            bWhite = beautyActive ? recipe.beauty && recipe.beauty.default_white !== undefined ? recipe.beauty.default_white : parseInt($('#studioWhiteSlider').val() || 15, 10) : 0;
            bRosy = beautyActive ? recipe.beauty && recipe.beauty.default_rosy !== undefined ? recipe.beauty.default_rosy : parseInt($('#studioRosySlider').val() || 20, 10) : 0;
            bClarity = beautyActive ? recipe.beauty && recipe.beauty.default_clarity !== undefined ? recipe.beauty.default_clarity : parseInt($('#studioClaritySlider').val() || 15, 10) : 0;
            bEye = beautyActive ? recipe.beauty && recipe.beauty.default_eye !== undefined ? recipe.beauty.default_eye : parseInt($('#studioEyeSlider').val() || 15, 10) : 0;
            bSlim = beautyActive ? recipe.beauty && recipe.beauty.default_slim !== undefined ? recipe.beauty.default_slim : parseInt($('#studioSlimSlider').val() || 15, 10) : 0;
            $('#aiShuttleOverlay').removeClass('is-active').hide();
            $('#classicLoaderOverlay').addClass('is-active').show();
            var cProgress = Math.max(parseInt($('#classicProgressBar').css('width'), 10) || 15, 15);
            $('#classicProgressBar').css('width', cProgress + '%');
            $('#classicProgressPercent').text(cProgress + '%');
            $('#classicLoaderTicker').text('正在进行发丝级抠图与光影融合…');
            clearInterval(classicTimer);
            classicTimer = setInterval(function () {
              if (cProgress < 90) {
                cProgress += Math.floor(Math.random() * 5) + 3;
                if (cProgress > 90) cProgress = 90;
                $('#classicProgressBar').css('width', cProgress + '%');
                $('#classicProgressPercent').text(cProgress + '%');
                if (cProgress > 30 && cProgress < 65) {
                  $('#classicLoaderTicker').text('正在精确分离人像与发丝轮廓…');
                } else if (cProgress >= 65) {
                  $('#classicLoaderTicker').text('正在融合艺术背景与质感调色…');
                }
              }
            }, 160);
            applyData = {
              file: result.file,
              source_file: result.file,
              filter: 'plain',
              style: api.photoStyle,
              template: classicTpl,
              smooth: bSmooth,
              white: bWhite,
              rosy: bRosy,
              clarity: bClarity,
              eye: bEye,
              slim: bSlim
            };
            photoboothTools.ajaxWithCsrf({
              method: 'POST',
              url: environment.publicFolders.api + '/applyEffects.php',
              data: applyData
            }).done(function (data) {
              if (processSession !== editSession) return;
              clearInterval(classicTimer);
              $('#classicProgressBar').css('width', '100%');
              $('#classicProgressPercent').text('100%');
              $('#classicLoaderTicker').text('发丝级抠图与光影融合完成，正在呈现…');
              try {
                photoboothTools.console.log(api.photoStyle + ' processed', data);
                endTime = new Date().getTime();
                totalTime = endTime - startTime;
                photoboothTools.console.logDev('Processing ' + api.photoStyle + ' took ' + totalTime + 'ms for filter `' + imgFilter + '`');
                photoboothTools.console.logDev('Images:', data.images);
                if (config.get_request.processed) {
                  var getUrl = config.get_request.server + '/' + api.photoStyle;
                  photoboothTools.getRequest(getUrl);
                }
                if (data.error) {
                  $('#classicLoaderOverlay').removeClass('is-active').hide();
                  $('body').removeClass('is-capturing');
                  setFiltersEnabled(true);
                  api.errorPic(data);
                } else if (api.photoStyle === PhotoStyle.CHROMA && window.photoboothMode !== 'classic' && window.photoboothMode !== 'ai_swap' && window.sessionPhotoboothMode !== 'classic' && window.sessionPhotoboothMode !== 'ai_swap') {
                  $('#classicLoaderOverlay').removeClass('is-active').hide();
                  $('body').removeClass('is-capturing');
                  setFiltersEnabled(true);
                  api.renderChroma(data.file);
                } else {
                  api.renderPic(data.file, data.images, data.raw_file, data.raw_path, recipe.filter);
                }
              } catch (error) {
                $('#classicLoaderOverlay').removeClass('is-active').hide();
                $('body').removeClass('is-capturing');
                setFiltersEnabled(true);
                photoboothTools.console.log('processPic.success: unexpected error:', error);
                api.errorPic({
                  error: error.message || 'Unexpected error processing picture'
                });
              }
            }).fail(function (jqXHR, textStatus) {
              clearInterval(classicTimer);
              if (processSession !== editSession) return;
              $('#classicLoaderOverlay').removeClass('is-active').hide();
              $('body').removeClass('is-capturing');
              if (photoboothTools.isCsrfErrorResponse(jqXHR)) {
                photoboothTools.handleCsrfMismatch(environment.publicFolders.api + '/applyEffects.php');
                return;
              }
              setFiltersEnabled(true);
              var serverError = jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.error;
              api.errorPic({
                error: serverError || '大头贴精修处理网络请求失败: ' + textStatus
              });
            });
          case 10:
            return _context7.a(2);
        }
      }, _callee7, null, [[1, 3]]);
    }));
    return function (_x1) {
      return _ref7.apply(this, arguments);
    };
  }();
  api.processVideo = function (result) {
    startTime = new Date().getTime();
    videoSensor.hide();
    previewVideo.hide();
    videoBackground.hide();
    loader.css('--stage-background', 'var(--background-countdown-color)');
    loaderMessage.html('<i class="' + config.icons.spinner + '"></i><br>' + photoboothTools.getTranslation('busyVideo'));
    photoboothTools.ajaxWithCsrf({
      method: 'POST',
      url: environment.publicFolders.api + '/applyVideoEffects.php',
      data: {
        file: result.file
      }
    }).done(function (data) {
      try {
        photoboothTools.console.log('video processed', data);
        endTime = new Date().getTime();
        totalTime = endTime - startTime;
        photoboothTools.console.logDev('Processing video took ' + totalTime + 'ms');
        photoboothTools.console.logDev('Video:', data.file);
        if (config.get_request.processed) {
          var getUrl = config.get_request.server + '/video';
          photoboothTools.getRequest(getUrl);
        }
        if (data.error) {
          api.errorPic(data);
        } else {
          api.renderPic(data.file, data.images);
          var file = environment.publicFolders.images + '/' + data.file;
          if (config.video.gif) {
            resultVideo.attr('src', file);
          } else {
            var source = document.createElement('source');
            source.setAttribute('src', file);
            source.setAttribute('type', 'video/mp4');
            resultVideo.append(source);
            resultVideo.get(0).play();
          }
          resultVideo.show();
          if (config.video.qr) {
            resultVideoQR.attr('src', environment.publicFolders.api + '/qrcode.php?filename=' + data.file);
            resultVideoQR.show();
          }
        }
      } catch (error) {
        photoboothTools.console.log('processVideo.success: unexpected error:', error);
        api.errorPic({
          error: error.message || 'Unexpected error processing video'
        });
      }
    }).fail(function (jqXHR, textStatus) {
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
    var chromaimage = environment.publicFolders.keying + '/' + filename;
    processChromaImage(chromaimage, true, filename);
    rotaryController.focusSet(resultPage);
    api.takingPic = false;
    remoteBuzzerClient.inProgress(false);
    photoboothTools.console.logDev('Taking picture in progress: ' + api.takingPic);
    api.resetTimeOut();
  };
  api.showMailForm = function (image) {
    photoboothTools.modal.open('mail');
    var body = photoboothTools.modal.element.querySelector('.modal-body');
    var buttonbar = photoboothTools.modal.element.querySelector('.modal-buttonbar');

    // Text
    var text = document.createElement('p');
    text.textContent = config.mail.send_all_later ? photoboothTools.getTranslation('insertMailToDB') : photoboothTools.getTranslation('insertMail');
    body.appendChild(text);

    // Form
    var form = document.createElement('form');
    form.id = 'send-mail-form';
    form.classList.add('form');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (document.querySelector('#send-mail-message')) {
        document.querySelector('#send-mail-message').remove();
      }
      var message = document.createElement('div');
      message.id = 'send-mail-message';
      message.classList.add('form-message');
      form.appendChild(message);
      var submitButton = document.querySelector('#send-mail-submit');
      submitButton.disabled = true;
      var fd = new FormData(form);
      if (typeof csrf !== 'undefined') {
        fd.append(csrf.key, csrf.token);
      }
      fetch(environment.publicFolders.api + '/sendPic.php', {
        method: 'post',
        body: fd
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
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
      })["catch"](function () {
        message.classList.add('text-danger');
        message.textContent = photoboothTools.getTranslation('mailError');
        submitButton.disabled = false;
      });
    });
    body.appendChild(form);

    // Image
    var imageInput = document.createElement('input');
    imageInput.type = 'hidden';
    imageInput.name = 'image';
    imageInput.value = image;
    form.appendChild(imageInput);

    // Recipient
    var recipientInput = document.createElement('input');
    recipientInput.classList.add('form-input');
    recipientInput.id = 'send-mail-recipient';
    recipientInput.type = 'text';
    recipientInput.name = 'recipient';
    recipientInput.addEventListener('focusin', function (event) {
      // workaround for photoswipe blocking input
      event.stopImmediatePropagation();
    });
    form.appendChild(recipientInput);
    if (config.mail.virtualKeyboard) {
      virtualKeyboard.initialize(config.mail.keyboardLayout, '#send-mail-recipient', '#send-mail-form');
    }

    // Submit
    var submitLabel = config.mail.send_all_later ? photoboothTools.getTranslation('add') : photoboothTools.getTranslation('send');
    var submitButton = photoboothTools.button.create(submitLabel, 'fa fa-check', 'primary', 'modal-');
    submitButton.id = 'send-mail-submit';
    submitButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      } else {
        var tmpSubmit = document.createElement('button');
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
    var body = photoboothTools.modal.element.querySelector('.modal-body');
    var image = document.createElement('img');
    image.src = environment.publicFolders.api + '/qrcode.php?filename=' + filename;
    body.appendChild(image);
    var qrHelpText = config.qr.custom_text ? config.qr.text : photoboothTools.getTranslation('qrHelp') + '<br><b>' + config.webserver.ssid + '</b>';
    var text = document.createElement('p');
    text.innerHTML = qrHelpText;
    body.appendChild(text);
  };
  api.resetEditSession = function () {
    editSession++;
    if (window.PhotoboothInk) window.PhotoboothInk.cancel();
    if (api.closeEditorDrawers) api.closeEditorDrawers();
    api.frameId = null;
    $('.editor-drawer').hide();
    if (typeof window.beautyReset === 'function') window.beautyReset();
    if (typeof window.rembgReset === 'function') window.rembgReset();
    window.photoEditState.begin('session-reset');
    compositeSaves.reset();
    pendingComposite = null;
    deliveryActions = new Set();
    baseImageSize = null;
    clearTimeout(autoPrintTimer);
    if (activeGestureCancel) activeGestureCancel();
    $(document).off('.stickerDrag');
    $('#resultQR').remove();
    window.lastClassicRawFile = null;
    window.lastClassicRawUrl = null;
    window.lastClassicBaseFile = null;
    window.lastClassicDecoratedFile = null;
    window.lastRenderedComposite = null;
    window.currentActiveFilter = 'plain';
    resultPage.removeClass('is-comparing-raw');
    document.documentElement.style.setProperty('--stage-result-filter', 'none');
    if (resultPage[0]) resultPage[0].style.setProperty('--stage-result-filter', 'none');
    resultPage.css('--stage-result-filter', 'none');
    resultPage.removeClass(allFilterClasses);
    resultPage.removeClass('has-classic-frame');
    if (resultPage[0]) {
      resultPage[0].style.removeProperty('--stage-frame-inner-left');
      resultPage[0].style.removeProperty('--stage-frame-inner-top');
      resultPage[0].style.removeProperty('--stage-frame-inner-width');
      resultPage[0].style.removeProperty('--stage-frame-inner-height');
    }
    $('#classicFrameOverlay').hide().css('visibility', '');
    $('#stickerCanvasOverlay').empty().css('visibility', '');
    $('.classic-result-action').removeClass('active');
    $('.classic-qfilter-chip').removeClass('active');
    $('.classic-qfilter-chip[data-filter="plain"]').addClass('active');
    $('#classicFilterQuickBar').hide();
    $('#stickerModal').hide();
    $('#signatureModal').hide().attr('aria-hidden', 'true');
    $('#stickerModal').attr('aria-hidden', 'true');

    // X-06: Thoroughly reset signature input & chip selections
    $('#signatureTextInput').val('');
    $('.signature-preset-chip').removeClass('active');
    if (typeof api.initUndoStack === 'function') {
      api.initUndoStack();
    }
  };
  api.setBaseImage = function (newFilename, rawUrl) {
    api.invalidateComposite();
    baseImageSize = null;
    window.lastClassicBaseFile = newFilename;
    window.lastClassicDecoratedFile = newFilename;
    window.lastRenderedComposite = null;
    api.filename = newFilename;
    resultPage.attr('data-img', newFilename);
    window.photoEditState.setCurrent(newFilename);
    var session = editSession;
    var image = new Image();
    image.onload = function () {
      if (session !== editSession || window.lastClassicBaseFile !== newFilename) return;
      baseImageSize = {
        width: image.naturalWidth,
        height: image.naturalHeight
      };
      api.layoutEditLayers();
      api.initUndoStack();
    };
    image.onerror = function () {
      if (session === editSession && window.lastClassicBaseFile === newFilename) api.reportEditError(new Error('处理后的照片加载失败，请重新操作'));
    };
    image.src = environment.publicFolders.images + '/' + newFilename;
    if (rawUrl) {
      window.lastClassicRawUrl = rawUrl;
    }
    if (typeof api.updateFilterThumbnails === 'function') {
      api.updateFilterThumbnails(environment.publicFolders.images + '/' + newFilename);
    }
  };
  api.ensureCompositeSaved = function (callback) {
    var promise = api.bakeComposite();
    if (typeof callback === 'function') promise.then(callback)["catch"](api.reportEditError);
    return promise;
  };
  api.reportEditError = function (error) {
    if (error.code !== 'CANCELLED') photoboothTools.showNotification('error', error.message || '成片未保存，请重试');
  };
  api.deliverComposite = /*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(kind, action) {
      var actions, epoch, file, check, _t7;
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.p = _context8.n) {
          case 0:
            if (!deliveryActions.has(kind)) {
              _context8.n = 1;
              break;
            }
            return _context8.a(2);
          case 1:
            if (!(kind === 'print' && photoboothTools.isPrinting)) {
              _context8.n = 2;
              break;
            }
            return _context8.a(2);
          case 2:
            actions = deliveryActions;
            actions.add(kind);
            epoch = compositeSaves.epoch;
            _context8.p = 3;
            _context8.n = 4;
            return api.ensureCompositeSaved();
          case 4:
            file = _context8.v;
            check = function check() {
              if (epoch !== compositeSaves.epoch) throw editTools.error('CANCELLED', '照片已修改，请重新领取');
            };
            check();
            _context8.n = 5;
            return action(file, check);
          case 5:
            _context8.n = 7;
            break;
          case 6:
            _context8.p = 6;
            _t7 = _context8.v;
            api.reportEditError(_t7);
          case 7:
            _context8.p = 7;
            actions["delete"](kind);
            return _context8.f(7);
          case 8:
            return _context8.a(2);
        }
      }, _callee8, null, [[3, 6, 7, 8]]);
    }));
    return function (_x10, _x11) {
      return _ref8.apply(this, arguments);
    };
  }();
  api.renderPic = function (filename, files, rawFile, rawPath) {
    var captureFilter = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'plain';
    api.resetEditSession();
    var renderSession = editSession;
    api.filename = filename;
    files = Array.isArray(files) ? files : files ? [files] : [filename];
    studioPage.removeClass('stage--active');
    $('body').removeClass('mode--studio');
    if (config.print.auto && config.filters.enabled === false) {
      autoPrintTimer = setTimeout(function () {
        if (renderSession !== editSession) return;
        api.deliverComposite('print', function (file) {
          return new Promise(function (resolve) {
            photoboothTools.printImage(file, 1, function () {
              remoteBuzzerClient.inProgress(false);
              resolve();
            });
          });
        });
      }, config.print.auto_delay);
    }
    buttonPrint.off('click').on('click', /*#__PURE__*/function () {
      var _ref9 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(event) {
        return _regenerator().w(function (_context0) {
          while (1) switch (_context0.n) {
            case 0:
              event.preventDefault();
              event.stopPropagation();
              api.deliverComposite('print', /*#__PURE__*/function () {
                var _ref0 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(currentFile, check) {
                  var copies, _t8;
                  return _regenerator().w(function (_context9) {
                    while (1) switch (_context9.n) {
                      case 0:
                        if (!(config.print.max_multi === 1)) {
                          _context9.n = 1;
                          break;
                        }
                        _t8 = 1;
                        _context9.n = 3;
                        break;
                      case 1:
                        _context9.n = 2;
                        return photoboothTools.askCopies();
                      case 2:
                        _t8 = _context9.v;
                      case 3:
                        copies = _t8;
                        check();
                        if (!(copies && !isNaN(copies))) {
                          _context9.n = 4;
                          break;
                        }
                        _context9.n = 4;
                        return new Promise(function (resolve) {
                          return photoboothTools.printImage(currentFile, copies, function () {
                            remoteBuzzerClient.inProgress(false);
                            buttonPrint.trigger('blur');
                            resolve();
                          });
                        });
                      case 4:
                        return _context9.a(2);
                    }
                  }, _callee9);
                }));
                return function (_x13, _x14) {
                  return _ref0.apply(this, arguments);
                };
              }());
            case 1:
              return _context0.a(2);
          }
        }, _callee0);
      }));
      return function (_x12) {
        return _ref9.apply(this, arguments);
      };
    }());
    resultPage.find('[data-command="qrbtn"]').off('click').on('click', function (event) {
      event.preventDefault();
      api.deliverComposite('qr', function (currentFile) {
        api.showQrCode(currentFile);
      });
    });
    resultPage.find('.deletebtn').off('click').on('click', /*#__PURE__*/function () {
      var _ref1 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(ev) {
        var really, _t9;
        return _regenerator().w(function (_context1) {
          while (1) switch (_context1.n) {
            case 0:
              ev.preventDefault();
              if (!config["delete"].no_request) {
                _context1.n = 1;
                break;
              }
              _t9 = true;
              _context1.n = 3;
              break;
            case 1:
              _context1.n = 2;
              return photoboothTools.confirm(filename + ' ' + photoboothTools.getTranslation('really_delete_image'));
            case 2:
              _t9 = _context1.v;
            case 3:
              really = _t9;
              if (really) {
                if (window.lastRenderedComposite && window.lastRenderedComposite.file && !files.includes(window.lastRenderedComposite.file)) {
                  api.deleteImage(window.lastRenderedComposite.file, function () {
                    return;
                  });
                  window.lastRenderedComposite = null;
                }
                files.forEach(function (file, index, array) {
                  photoboothTools.console.logDev('Index:', index);
                  photoboothTools.console.logDev('Array:', array);
                  api.deleteImage(file, function () {
                    return;
                  });
                });
                setTimeout(function () {
                  photoboothTools.reloadPage();
                }, notificationTimeout);
              } else {
                buttonDelete.trigger('blur');
              }
            case 4:
              return _context1.a(2);
          }
        }, _callee1);
      }));
      return function (_x15) {
        return _ref1.apply(this, arguments);
      };
    }());

    // gallery doesn't support videos atm
    if (!photoboothTools.isVideoFile(filename)) {
      api.addImage(filename);
    }

    // if image is a video render the qr code as image (video should be displayed over this)
    var imageUrl = photoboothTools.isVideoFile(filename) ? environment.publicFolders.api + '/qrcode.php?filename=' + filename : environment.publicFolders.images + '/' + filename;
    var preloadImage = new Image();
    preloadImage.onload = function () {
      if (renderSession !== editSession) return;
      baseImageSize = {
        width: preloadImage.naturalWidth,
        height: preloadImage.naturalHeight
      };
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
      if (window.photoEditState) {
        window.photoEditState.rawFile = rawFile || filename;
        window.photoEditState.setCurrent(filename);
        window.photoEditState.background = '';
        window.photoEditState.filter = 'plain';
        window.photoEditState.beauty = {};
      }
      resultPage.removeAttr('data-matted-composite');
      resultPage.removeClass(allFilterClasses);
      $('#stageCutoutViewport').removeClass(allFilterClasses);
      $('#stageCutoutPerson').removeClass(allFilterClasses);
      document.documentElement.style.setProperty('--stage-result-filter', 'none');
      if (resultPage[0]) resultPage[0].style.setProperty('--stage-result-filter', 'none');
      var initialVp = document.getElementById('stageCutoutViewport');
      if (initialVp) initialVp.style.removeProperty('filter');
      var initialCp = document.getElementById('stageCutoutPerson');
      if (initialCp) initialCp.style.removeProperty('filter');
      resultPage.css({
        '--stage-background-image': "url(\"".concat(imageUrl, "?filter=").concat(imgFilter, "\")")
      });
      if (resultPage[0]) {
        resultPage[0].style.setProperty('--stage-background-image', "url(\"".concat(imageUrl, "?filter=").concat(imgFilter, "\")"));
      }
      resultPage.attr('data-img', filename);
      resultPage.addClass('stage--active');
      $('body').removeClass('is-capturing').addClass('mode--result');
      var currentActiveMode = window.sessionPhotoboothMode || window.photoboothMode;
      $('#resultSidebar .rembgbtn, #resultSidebar .beautybtn').toggle(currentActiveMode !== 'ai_swap');
      $('#resultSidebar .classic-result-action, #resultSidebar .sidebar-section--edit').show();
      $('#aiResultControlBar').toggle(currentActiveMode === 'ai_swap');
      var currentLayout = window.studioClassicLayout || 'single';
      if (window.burstActive || currentLayout === 'life4cuts' || window.burstLayout === '1x4_strip') {
        $('#lblResultPaperTitle').text('韩国人生四格双条胶片 (2" × 6" × 2条)');
        $('#lblResultPaperDetail').text('300 DPI 富士高光冲印 · 600×1800px × 2条');
      } else if (currentLayout === 'burst' || window.burstLayout === '2x2') {
        $('#lblResultPaperTitle').text('2×2 经典四格方形相纸 (4" × 6")');
        $('#lblResultPaperDetail').text('300 DPI 富士晶彩冲印 · 1800×1200px');
      } else {
        $('#lblResultPaperTitle').text('6寸标准相纸 (4" × 6")');
        $('#lblResultPaperDetail').text('300 DPI 富士晶彩冲印 · 1800×1200px');
      }
      $('#classicPaperSpecBadge').show();
      if (api.closeEditorDrawers) api.closeEditorDrawers();else $('#classicFilterQuickBar, #stickerModal, #signatureModal').hide();
      $('#stickerCanvasOverlay').show();
      window.lastClassicBaseFile = filename;
      window.lastClassicRawUrl = rawPath || (rawFile ? environment.publicFolders.tmp + '/' + rawFile : null);
      window.lastClassicRawFile = rawFile || filename;
      window.lastClassicDecoratedFile = filename;
      api.layoutEditLayers();
      api.applyEditFilter(captureFilter, true);
      api.updateFilterThumbnails();
      api.initUndoStack();
      loader.removeClass('stage--active showBackgroundImage');
      loader.css('background-image', '');
      $('#aiShuttleOverlay, #classicLoaderOverlay').removeClass('is-active').hide();
      setFiltersEnabled(true);
      if (config.qr.enabled && config.qr.result != 'hidden') {
        var qrEpoch = compositeSaves.epoch;
        if (document.getElementById('resultQR')) {
          document.getElementById('resultQR').remove();
        }
        var qrWrapper = document.createElement('div');
        qrWrapper.id = 'resultQR';
        qrWrapper.setAttribute('class', 'stage-code ' + config.qr.result);
        var qrResultImage = document.createElement('img');
        qrResultImage.addEventListener('load', function () {
          if (renderSession !== editSession || qrEpoch !== compositeSaves.epoch) return;
          resultPage.append(qrWrapper);
        });
        qrResultImage.src = environment.publicFolders.api + '/qrcode.php?filename=' + filename;
        qrResultImage.alt = 'QR-Code';
        qrResultImage.classList.add('stage-code__image');
        qrWrapper.append(qrResultImage);
        var qrShortText = config.qr.short_text;
        if (qrShortText && qrShortText.length > 0) {
          var qrCaption = document.createElement('p');
          qrCaption.classList.add('stage-code__caption');
          qrCaption.textContent = qrShortText;
          qrWrapper.append(qrCaption);
        }
      }
      if (!filternav.hasClass('sidenav--open')) {
        rotaryController.focusSet(resultPage);
      }
    };
    preloadImage.onerror = function () {
      if (renderSession !== editSession) return;
      photoboothTools.console.log('ERROR: Failed to preload image: ' + imageUrl);
      loader.removeClass('stage--active showBackgroundImage');
      loader.css('background-image', '');
      $('#aiShuttleOverlay, #classicLoaderOverlay').removeClass('is-active').hide();
      $('body').removeClass('is-capturing');
      setFiltersEnabled(true);
      photoboothTools.modal.open('error');
      photoboothTools.modal.empty();
      var modalMessage = $('<p>').text(photoboothTools.getTranslation('error'));
      photoboothTools.modal.append(modalMessage);
      var closeBtn = photoboothTools.button.create('close', 'fa fa-times', 'default', 'close');
      closeBtn.on('click', function () {
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
    var useThumb = config.gallery.use_thumb;
    var thumbImg = new Image();
    var bigImg = new Image();
    var thumbSize = '';
    var bigSize = '';
    var bigSizeW = '';
    var bigSizeH = '';
    var maxSizeW = config.gallery.picture_width || 800;
    var maxSizeH = config.gallery.picture_height || 600;
    var imgtoLoad = 2;
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
      var aspectRatio = bigSizeW / bigSizeH;
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
    var thumbUrl = (useThumb ? environment.publicFolders.thumbs : environment.publicFolders.images) + '/' + imageName;
    thumbImg.src = thumbUrl;
    function allLoaded() {
      var linkElement = $('<a>').html(thumbImg);
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
    setTimeout(function () {
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
    var errorMsg = photoboothTools.getTranslation('error') + '</br>' + photoboothTools.getTranslation('auto_reload');
    $.ajax({
      url: environment.publicFolders.api + '/deletePhoto.php',
      method: 'POST',
      data: _defineProperty({
        file: imageName
      }, csrf.key, csrf.token),
      success: function success(data) {
        if (data.success) {
          var msg = data.file + ' ' + photoboothTools.getTranslation('deleted_successfully') + '</br>' + photoboothTools.getTranslation('auto_reload');
          photoboothTools.console.log('Deleted ' + data.file);
          photoboothTools.overlay.showSuccess(msg);
        } else {
          photoboothTools.console.log('Error while deleting ' + data.file);
          photoboothTools.console.log('Failed: ' + data.failed);
          photoboothTools.overlay.showError(errorMsg);
        }
        setTimeout(function () {
          return photoboothTools.overlay.close();
        }, notificationTimeout);
        cb(data);
      },
      error: function error(jqXHR, textStatus) {
        photoboothTools.console.log('Error while deleting image: ', textStatus);
        photoboothTools.overlay.showError(errorMsg);
        setTimeout(function () {
          return photoboothTools.reloadPage();
        }, notificationTimeout);
      }
    });
  };
  $('.imageFilter').on('click', function (e) {
    e.preventDefault();
    api.navbar.toggle();
  });
  var filterCssMap = window.PhotoboothCatalog.filterMap;
  var allFilterClasses = Object.keys(filterCssMap).map(function (f) {
    return 'filter-effect-' + f;
  }).join(' ');
  $(document).on('click', '.filter-card[data-filter], .sidenav-list-item[data-filter]', function (e) {
    e.preventDefault();
    var selected = $(this).data('filter') || 'plain';
    if (resultPage.hasClass('stage--active')) api.applyEditFilter(selected);else {
      imgFilter = selected;
      api.applyStudioBeautyPreview();
    }
  });
  $('.takePic, .stage--start .newpic').on('click', function (e) {
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
    var file = this.files[0];
    var fileInput = this;
    if (typeof window.rembgReset === 'function') {
      window.rembgReset();
    }
    var formData = new FormData();
    formData.append('photo', file);
    if (window.photoboothTools && window.photoboothTools.overlay) {
      photoboothTools.overlay.showWaiting('正在上传图片，请稍候...');
    }
    photoboothTools.ajaxWithCsrf({
      url: 'api/uploadPhoto.php',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      dataType: 'json',
      success: function success(res) {
        fileInput.value = '';
        if (window.photoboothTools && window.photoboothTools.overlay) {
          photoboothTools.overlay.close();
        }
        if (res && res.success && res.file) {
          api.renderPic(res.file);
        } else {
          var errMsg = res && res.error ? res.error : '上传图片失败，请重试';
          if (window.photoboothTools && window.photoboothTools.showNotification) {
            photoboothTools.showNotification('error', errMsg);
          } else {
            alert(errMsg);
          }
        }
      },
      error: function error(xhr, status, _error) {
        fileInput.value = '';
        if (window.photoboothTools && window.photoboothTools.overlay) {
          photoboothTools.overlay.close();
        }
        var errMsg = '上传失败: ' + (_error || status);
        if (xhr && xhr.responseJSON && xhr.responseJSON.error) {
          errMsg = '上传失败: ' + xhr.responseJSON.error;
        } else if (xhr && xhr.responseText) {
          try {
            var parsed = JSON.parse(xhr.responseText);
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
  $('.mailbtn').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    api.deliverComposite('mail', function (currentFile) {
      api.showMailForm(currentFile);
    });
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
    var url = "http://".concat(location.hostname, ":631/jobs/");
    var features = 'width=1024,height=600,left=0,top=0,screenX=0,screenY=0,resizable=NO,scrollbars=NO';
    window.open(url, 'newwin', features);
  });
  $('.print-unlock-button').on('click', function (e) {
    var _this = this;
    e.preventDefault();
    photoboothTools.overlay.showWaiting(photoboothTools.getTranslation('wait_message'));
    $.ajax({
      method: 'GET',
      url: environment.publicFolders.api + '/printDB.php',
      data: _defineProperty({
        action: 'unlockPrint'
      }, csrf.key, csrf.token),
      success: function success(data) {
        if (data.success) {
          photoboothTools.overlay.showSuccess(photoboothTools.getTranslation('success'));
          $(_this).addClass('hidden');
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
      if (config.picture.key && parseInt(config.picture.key, 10) === ev.keyCode || config.custom.key && parseInt(config.custom.key, 10) === ev.keyCode) {
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
          photoboothTools.console.logDev('Picture key pressed, but taking pictures disabled. Please enable picture in your config.');
        }
      }

      // custom
      if (config.custom.key && parseInt(config.custom.key, 10) === ev.keyCode) {
        if (config.custom.enabled) {
          api.thrill(PhotoStyle.CUSTOM);
        } else {
          photoboothTools.console.logDev('Custom key pressed, but custom action disabled. Please enable custom action in your config.');
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
    var videoEl = ev.target;
    var newWidth = videoEl.offsetWidth;
    var newHeight = videoEl.offsetHeight;
    if (config.preview.style === PreviewStyle.SCALE_DOWN.valueOf()) {
      newWidth = videoEl.videoWidth;
      newHeight = videoEl.videoHeight;
    }
    if (newWidth !== 0 && newHeight !== 0) {
      previewFramePicture.css({
        width: newWidth,
        height: newHeight
      });
    }
  });

  // ==========================================
  // Commercial Dual-Mode State Machine & AI Portal
  // ==========================================
  window.photoboothMode = 'classic'; // 'classic' | 'ai_swap'
  window.selectedAiTemplate = null;
  api.setPhotoboothMode = function (mode) {
    window.photoboothMode = mode;
    photoboothTools.console.log('Photobooth mode switched to:', mode);
  };

  // ==========================================
  // Studio Independent Stage Architecture (独立全屏摄影工作台)
  // ==========================================
  window.studioClassicLayout = 'single'; // 'single' | 'burst' | 'life4cuts'

  // --------------------------------------------------------
  // Studio Pose Inspiration Card (趣味拍照姿势灵感卡)
  // --------------------------------------------------------
  var studioPoseList = [{
    title: '猫咪萌爪爪',
    icon: '🐱',
    desc: '双手半握拳放脸颊两侧，歪头微抿嘴笑'
  }, {
    title: '比心三连击',
    icon: '🫰',
    desc: '单手比手指心或双手合十比爱心，眼神灵动俏皮'
  }, {
    title: '微托腮托下巴',
    icon: '🌸',
    desc: '单手轻托下巴显脸小，侧脸45度面对镜头'
  }, {
    title: '元气剪刀手',
    icon: '✌️',
    desc: '双手放眼睛前做剪刀手框住眼睛，眨眼微笑'
  }, {
    title: '酷飒拽姐墨镜',
    icon: '🕶️',
    desc: '手扶墨镜框或插兜，下巴微抬神情专注自信'
  }, {
    title: '脸颊小爱心',
    icon: '🫶',
    desc: '双手在脸颊比出心形轮廓，笑容甜度拉满'
  }, {
    title: '捂脸捉迷藏',
    icon: '🙈',
    desc: '双手轻遮半边脸，从指缝探出充满好奇的眼神'
  }, {
    title: '背靠背合影',
    icon: '👯',
    desc: '若有多人可侧身微靠，回头相视一笑氛围感满满'
  }];
  var studioPoseIndex = 0;
  var studioPoseTimer = null;
  api.renderStudioPose = function (index) {
    if (!studioPoseList || studioPoseList.length === 0) return;
    studioPoseIndex = (index + studioPoseList.length) % studioPoseList.length;
    var pose = studioPoseList[studioPoseIndex];
    $('#lblPoseCounter').text("".concat(studioPoseIndex + 1, "/").concat(studioPoseList.length));
    $('#lblPoseIcon').text(pose.icon);
    $('#lblPoseTitle').text(pose.title);
    $('#lblPoseDesc').text(pose.desc);
  };
  api.startStudioPoseCarousel = function () {
    api.renderStudioPose(studioPoseIndex);
    clearInterval(studioPoseTimer);
    studioPoseTimer = setInterval(function () {
      if (!$('#studioPoseCard').hasClass('is-collapsed')) {
        api.renderStudioPose(studioPoseIndex + 1);
      }
    }, 6000);
  };
  api.stopStudioPoseCarousel = function () {
    clearInterval(studioPoseTimer);
    studioPoseTimer = null;
  };
  $(document).on('click', '#btnPosePrev', function (e) {
    e.preventDefault();
    e.stopPropagation();
    api.renderStudioPose(studioPoseIndex - 1);
  });
  $(document).on('click', '#btnPoseNext', function (e) {
    e.preventDefault();
    e.stopPropagation();
    api.renderStudioPose(studioPoseIndex + 1);
  });
  $(document).on('click', '#btnPoseToggle', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $('#studioPoseCard').toggleClass('is-collapsed');
  });
  api.enterStudio = function (mode) {
    mode = mode || 'ai_swap';
    api.setPhotoboothMode(mode);
    $('body').attr('data-studio-mode', mode);
    $('.wb-section--beauty').show();
    if (typeof api.resetEditSession === 'function') {
      api.resetEditSession();
    }
    startPage.removeClass('stage--active');
    loader.removeClass('stage--active');
    resultPage.removeClass('stage--active');
    studioPage.addClass('stage--active');
    $('body').addClass('mode--studio');

    // Start live camera in left viewport
    photoboothPreview.startVideo(CameraDisplayMode.BACKGROUND);
    if (mode === 'ai_swap') {
      $('#studioPaperGuide').hide();
      $('#studioModePill').removeClass('classic');
      $('#studioModePillText').text('AI 魔法变身照');
      $('#workbenchIcon').removeClass('classic').html('<i class="fa fa-wand-magic-sparkles"></i>');
      $('#workbenchTitle').text('AI 魔法变身工作室');
      $('#workbenchSubtitle').text('保留本人五官 · 实时滤镜与写真模板');
      $('#tabTemplatesLabel').text('挑选模板');
      $('#studioAiTplContainer').show();
      $('#studioClassicTplContainer').hide();
      $('#aiPoseGuide').show();

      // Default AI template
      if (!window.selectedAiTemplate) {
        var firstCard = $('#studioAiTplGrid .wb-tpl-card').first();
        if (firstCard.length) {
          firstCard.addClass('active');
          window.selectedAiTemplate = {
            id: firstCard.data('id'),
            title: firstCard.data('title'),
            image: firstCard.data('image'),
            path: firstCard.data('image')
          };
        }
      }
      if (window.selectedAiTemplate) {
        $('#studioCurrentTplName').text(window.selectedAiTemplate.title || '已选写真');
        if (window.selectedAiTemplate.image) {
          $('#studioCurrentTplThumb').attr('src', window.selectedAiTemplate.image).show();
        }
        $('#studioAiTplGrid .wb-tpl-card').removeClass('active');
        $('#studioAiTplGrid .wb-tpl-card[data-id="' + window.selectedAiTemplate.id + '"]').addClass('active');
      } else {
        $('#studioCurrentTplName').text('请先上传可用写真模板');
        $('#studioCurrentTplThumb').removeAttr('src').hide();
      }
      if (typeof api.filterStudioAiTemplates === 'function') {
        api.filterStudioAiTemplates();
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

      // 大头照模式显示相纸物理版式辅助框
      $('#studioPaperGuide').show();
      var curLayout = window.studioClassicLayout || 'single';
      if (curLayout === 'burst') {
        $('#studioPaperGuideBadge span').text('经典四格相纸 (2×2 拍立得拼图)');
        $('#studioGuide2x2').show();
        $('#studioGuideStrip').hide();
      } else if (curLayout === 'life4cuts') {
        $('#studioPaperGuideBadge span').text('韩国人生四格双条胶片 (2"×6" 51×152mm × 2条)');
        $('#studioGuide2x2').hide();
        $('#studioGuideStrip').show();
      } else {
        $('#studioPaperGuideBadge span').text('6寸标准相纸 (4"×6" 102×152mm)');
        $('#studioGuide2x2, #studioGuideStrip').hide();
      }

      // 大头照模式不显示姿态引导，但仍然需要实时人脸追踪美颜。
      $('#aiPoseGuide').hide();
      var firstBg = $('#studioClassicTplGrid .wb-classic-card.active').first();
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

    // 两种工作室模式都使用同一套实时人脸追踪和美颜渲染。
    api.startFacePoseAlignmentLoop();

    // Restore custom countdown preference
    var savedCntdwn = localStorage.getItem('photobooth_custom_countdown');
    if (savedCntdwn) {
      var parsedVal = parseInt(savedCntdwn, 10);
      if (parsedVal >= 1 && parsedVal <= 10) {
        $('#studioCountdownSelect').val(parsedVal);
        config.picture = config.picture || {};
        config.picture.cntdwn_time = parsedVal;
      }
    }

    // Start pose inspiration carousel
    api.startStudioPoseCarousel();

    // Synchronize beauty controls with runtime configuration if available
    if (typeof window.syncBeautyToRuntime === 'function' && window.defaultBeautyConfig) {
      window.syncBeautyToRuntime(window.defaultBeautyConfig);
    } else if (typeof window.syncBeautyToRuntime === 'function' && window.config && window.config.beauty) {
      window.syncBeautyToRuntime(window.config.beauty);
    } else {
      // Apply selected filter and real-time beauty to live preview
      api.applyStudioBeautyPreview();
    }
  };
  api.exitStudio = function () {
    studioPage.removeClass('stage--active');
    $('body').removeClass('mode--studio');
    startPage.addClass('stage--active');
    api.stopStudioPoseCarousel();
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
    if ($(e.target).closest('#btnClassicUpload, .uploadBtn').length > 0) {
      return;
    }
    e.preventDefault();
    window.studioClassicLayout = 'single';
    api.enterStudio('classic');
  });
  $(document).on('click', '#btnClassicStart', function (e) {
    e.preventDefault();
    e.stopPropagation();
    window.studioClassicLayout = 'single';
    api.enterStudio('classic');
  });

  // Mode Card AI Click -> Enter Studio (AI Mode)
  $(document).on('click', '#cardModeAi, #btnEnterAiMode', function (e) {
    e.preventDefault();
    api.enterStudio('ai_swap');
  });

  // Selected Template Chip Click -> Switch to Templates Tab
  $(document).on('click', '.wb-selected-chip', function (e) {
    e.preventDefault();
    $('#tabBtnTemplates').trigger('click');
  });

  // Studio Back Button -> Return Home
  $(document).on('click', '#btnStudioBack', function (e) {
    e.preventDefault();
    api.exitStudio();
  });

  // Studio Mirror Flip Button
  $(document).on('click', '#btnStudioFlip', function (e) {
    e.preventDefault();
    var vid = $('#preview--video');
    var isFlipped = vid.hasClass('flip-horizontal');
    photoboothPreview.setFlip(!isFlipped);
  });

  // Studio Tabs (Filters & Beauty VS Templates)
  $(document).on('click', '.wb-tab-btn', function (e) {
    e.preventDefault();
    var tab = $(this).data('tab');
    $('.wb-tab-btn').removeClass('active');
    $(this).addClass('active');
    $('.wb-tab-pane').removeClass('active');
    if (tab === 'filters') {
      $('#paneFilters').addClass('active');
    } else if (tab === 'templates') {
      $('#paneTemplates').addClass('active');
    }
  });

  // Live Studio Lighting & Realtime Face Beauty Pipeline
  var trackedFace = {
    detected: false,
    x: 0.5,
    y: 0.48,
    w: 0.28,
    h: 0.38,
    lastSeen: 0
  };
  var trackedFaces = [];
  var liveBeautyRaf = null;
  var initBeautyActive = config.beauty && config.beauty.enabled !== false && config.beauty.auto_apply !== false;
  var liveBeautyParams = {
    smooth: initBeautyActive ? config.beauty.default_smooth !== undefined ? config.beauty.default_smooth : 20 : 0,
    white: initBeautyActive ? config.beauty.default_white !== undefined ? config.beauty.default_white : 15 : 0,
    rosy: initBeautyActive ? config.beauty.default_rosy !== undefined ? config.beauty.default_rosy : 20 : 0,
    clarity: initBeautyActive ? config.beauty.default_clarity !== undefined ? config.beauty.default_clarity : 15 : 0,
    eye: initBeautyActive ? config.beauty.default_eye !== undefined ? config.beauty.default_eye : 15 : 0,
    slim: initBeautyActive ? config.beauty.default_slim !== undefined ? config.beauty.default_slim : 15 : 0,
    baseFilter: ''
  };
  var beautyGlInitialized = false;
  var _renderLiveBeautyFrame = function renderLiveBeautyFrame() {
    var canvas = document.getElementById('preview--beauty-canvas');
    var video = document.getElementById('preview--video');
    if (!canvas || !video || !video.videoWidth || !video.videoHeight) {
      liveBeautyRaf = window.requestAnimationFrame(_renderLiveBeautyFrame);
      return;
    }
    var p = liveBeautyParams;
    var hasBeauty = p.smooth > 0 || p.white > 0 || p.rosy > 0 || p.clarity > 0 || p.eye > 0 || p.slim > 0;
    if (!hasBeauty) {
      canvas.style.opacity = '0';
      canvas.style.display = 'none';
      liveBeautyRaf = window.requestAnimationFrame(_renderLiveBeautyFrame);
      return;
    }

    // Initialize WebGL engine on the preview beauty canvas
    if (!beautyGlInitialized && window.beautyGl) {
      beautyGlInitialized = window.beautyGl.init(canvas);
    }
    if (beautyGlInitialized && window.beautyGl) {
      canvas.style.filter = p.baseFilter || 'none';
      canvas.style.opacity = '1';
      canvas.style.display = 'block';
      var primaryFace = trackedFaces && trackedFaces.length > 0 ? trackedFaces[0] : null;
      var renderFace = primaryFace;
      if (primaryFace && primaryFace.bounds && primaryFace.bounds.center && primaryFace._vx !== undefined && primaryFace._time) {
        var elapsed = (Date.now() - primaryFace._time) / 1000.0;
        if (elapsed > 0 && elapsed < 0.16) {
          var shiftX = primaryFace._vx * elapsed * 0.72;
          var shiftY = primaryFace._vy * elapsed * 0.72;
          renderFace = {
            bounds: {
              center: [primaryFace.bounds.center[0] + shiftX, primaryFace.bounds.center[1] + shiftY],
              size: primaryFace.bounds.size
            },
            eyes: primaryFace.eyes && primaryFace.eyes.left && primaryFace.eyes.right ? {
              left: {
                center: [primaryFace.eyes.left.center[0] + shiftX, primaryFace.eyes.left.center[1] + shiftY],
                width: primaryFace.eyes.left.width,
                height: primaryFace.eyes.left.height
              },
              right: {
                center: [primaryFace.eyes.right.center[0] + shiftX, primaryFace.eyes.right.center[1] + shiftY],
                width: primaryFace.eyes.right.width,
                height: primaryFace.eyes.right.height
              }
            } : primaryFace.eyes,
            jaw: primaryFace.jaw ? {
              left: [primaryFace.jaw.left[0] + shiftX, primaryFace.jaw.left[1] + shiftY],
              right: [primaryFace.jaw.right[0] + shiftX, primaryFace.jaw.right[1] + shiftY],
              chin: [primaryFace.jaw.chin[0] + shiftX, primaryFace.jaw.chin[1] + shiftY]
            } : primaryFace.jaw
          };
        }
      }
      window.beautyGl.render(video, p, renderFace);
    }
    liveBeautyRaf = window.requestAnimationFrame(_renderLiveBeautyFrame);
  };
  var updateTrackedFaces = function updateTrackedFaces(state) {
    trackedFaces = state && Array.isArray(state.faces) ? state.faces : [];
    var primary = trackedFaces[0];
    if (primary && primary.bounds) {
      trackedFace.detected = true;
      trackedFace.x = primary.bounds.center[0];
      trackedFace.y = primary.bounds.center[1];
      trackedFace.w = primary.bounds.size[0];
      trackedFace.h = primary.bounds.size[1];
      trackedFace.lastSeen = Date.now();
    } else {
      trackedFace.detected = false;
    }
  };
  api.applyStudioBeautyPreview = function () {
    var bCfg = window.config && window.config.beauty || typeof config !== 'undefined' && config.beauty || {};
    var beautyEnabled = bCfg.enabled !== false;
    var autoApply = beautyEnabled && bCfg.auto_apply !== false;
    var defSmooth = bCfg.default_smooth !== undefined ? bCfg.default_smooth : 20;
    var defWhite = bCfg.default_white !== undefined ? bCfg.default_white : 15;
    var defRosy = bCfg.default_rosy !== undefined ? bCfg.default_rosy : 20;
    var defClarity = bCfg.default_clarity !== undefined ? bCfg.default_clarity : 15;
    var defEye = bCfg.default_eye !== undefined ? bCfg.default_eye : 15;
    var defSlim = bCfg.default_slim !== undefined ? bCfg.default_slim : 15;
    var smooth = beautyEnabled ? $('#studioSmoothSlider').length ? parseInt($('#studioSmoothSlider').val(), 10) : defSmooth : 0;
    var white = beautyEnabled ? $('#studioWhiteSlider').length ? parseInt($('#studioWhiteSlider').val(), 10) : defWhite : 0;
    var rosy = beautyEnabled ? $('#studioRosySlider').length ? parseInt($('#studioRosySlider').val(), 10) : defRosy : 0;
    var clarity = beautyEnabled ? $('#studioClaritySlider').length ? parseInt($('#studioClaritySlider').val(), 10) : defClarity : 0;
    var eye = beautyEnabled ? $('#studioEyeSlider').length ? parseInt($('#studioEyeSlider').val(), 10) : defEye : 0;
    var slim = beautyEnabled ? $('#studioSlimSlider').length ? parseInt($('#studioSlimSlider').val(), 10) : defSlim : 0;
    var studioSliders = $('#studioSmoothSlider, #studioWhiteSlider, #studioRosySlider, #studioClaritySlider, #studioEyeSlider, #studioSlimSlider');
    var studioPresets = $('.wb-preset-pill, #btnResetStudioBeauty');
    var beautySection = $('.wb-section--beauty');
    if (!beautyEnabled) {
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

    // Synchronize percentage labels with actual slider values
    if ($('#studioSmoothSlider').length) $('#valStudioSmooth').text(smooth + '%');
    if ($('#studioWhiteSlider').length) $('#valStudioWhite').text(white + '%');
    if ($('#studioRosySlider').length) $('#valStudioRosy').text(rosy + '%');
    if ($('#studioClaritySlider').length) $('#valStudioClarity').text(clarity + '%');
    if ($('#studioEyeSlider').length) $('#valStudioEye').text(eye + '%');
    if ($('#studioSlimSlider').length) $('#valStudioSlim').text(slim + '%');

    // Dynamically highlight active preset pill matching the current parameter values
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
    if (_typeof2(window.config) === 'object' && window.config !== null) {
      window.config.beauty = window.config.beauty || {};
    }
    if ((typeof config === "undefined" ? "undefined" : _typeof2(config)) === 'object' && config !== null) {
      config.beauty = config.beauty || {};
    }
    if (beautyEnabled) {
      if ((typeof config === "undefined" ? "undefined" : _typeof2(config)) === 'object' && config !== null) {
        config.beauty.default_smooth = smooth;
        config.beauty.default_white = white;
        config.beauty.default_rosy = rosy;
        config.beauty.default_clarity = clarity;
        config.beauty.default_eye = eye;
        config.beauty.default_slim = slim;
      }
      if (window.config && window.config.beauty) {
        window.config.beauty.default_smooth = smooth;
        window.config.beauty.default_white = white;
        window.config.beauty.default_rosy = rosy;
        window.config.beauty.default_clarity = clarity;
        window.config.beauty.default_eye = eye;
        window.config.beauty.default_slim = slim;
      }
    }
    var activeFilter = imgFilter || 'plain';
    var filterVal = _typeof(activeFilter) === 'object' && activeFilter !== null && activeFilter.value ? activeFilter.value : activeFilter;
    var baseColorFilter = filterCssMap && filterCssMap[filterVal] && filterCssMap[filterVal] !== 'none' ? filterCssMap[filterVal] : '';
    liveBeautyParams = {
      smooth: smooth,
      white: white,
      rosy: rosy,
      clarity: clarity,
      eye: eye,
      slim: slim,
      baseFilter: baseColorFilter
    };
    var video = $('#preview--video');
    if (video.length) {
      video.css({
        filter: baseColorFilter
      });
      $('#preview--beauty-canvas').css('filter', baseColorFilter);
    }
    var beautyPill = $('#studioBeautyPill');
    var beautyPillText = $('#studioBeautyPillText');
    if (beautyPill.length) {
      if (smooth > 0 || white > 0 || rosy > 0 || eye > 0 || slim > 0 || clarity > 0) {
        var trackingText = trackedFaces.length ? '人脸追踪中' : '实时美颜生效中';
        beautyPillText.text("".concat(trackingText, " · 磨皮").concat(smooth, "% 美白").concat(white, "% 大眼").concat(eye, "% 瘦脸").concat(slim, "%"));
        beautyPill.stop(true, true).fadeIn(150);
      } else {
        beautyPill.stop(true, true).fadeOut(150);
      }
    }
  };
  api.startFacePoseAlignmentLoop = function () {
    $('#aiPoseGuide').hide();
    if (liveBeautyRaf === null) liveBeautyRaf = window.requestAnimationFrame(_renderLiveBeautyFrame);
    if (window.faceBeautyTracker && typeof window.faceBeautyTracker.start === 'function') {
      window.faceBeautyTracker.start(function (state) {
        updateTrackedFaces(state);
        api.applyStudioBeautyPreview();
      });
    }
    api.applyStudioBeautyPreview();
  };
  api.stopFacePoseAlignmentLoop = function () {
    $('#aiPoseGuide').hide();
    if (window.faceBeautyTracker && typeof window.faceBeautyTracker.stop === 'function') window.faceBeautyTracker.stop();
    trackedFaces = [];
    trackedFace.detected = false;
    if (liveBeautyRaf !== null) {
      window.cancelAnimationFrame(liveBeautyRaf);
      liveBeautyRaf = null;
    }
    if (window.beautyGl && typeof window.beautyGl.stop === 'function') {
      window.beautyGl.stop();
    }
    var canvas = document.getElementById('preview--beauty-canvas');
    if (canvas) {
      canvas.style.opacity = '0';
      canvas.style.display = 'none';
    }
    api.applyStudioBeautyPreview();
  };

  // Beauty Presets Click
  $(document).on('click', '.wb-preset-pill', function (e) {
    e.preventDefault();
    $('.wb-preset-pill').removeClass('active');
    $(this).addClass('active');
    var preset = $(this).data('preset');
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
    var val = $(this).val();
    $('#valStudioSmooth').text(val + '%');
    config.beauty = config.beauty || {};
    config.beauty.default_smooth = parseInt(val, 10);
    api.applyStudioBeautyPreview();
  });
  $(document).on('input', '#studioWhiteSlider', function () {
    var val = $(this).val();
    $('#valStudioWhite').text(val + '%');
    config.beauty = config.beauty || {};
    config.beauty.default_white = parseInt(val, 10);
    api.applyStudioBeautyPreview();
  });
  $(document).on('input', '#studioRosySlider', function () {
    var val = $(this).val();
    $('#valStudioRosy').text(val + '%');
    config.beauty = config.beauty || {};
    config.beauty.default_rosy = parseInt(val, 10);
    api.applyStudioBeautyPreview();
  });
  $(document).on('input', '#studioClaritySlider', function () {
    var val = $(this).val();
    $('#valStudioClarity').text(val + '%');
    config.beauty = config.beauty || {};
    config.beauty.default_clarity = parseInt(val, 10);
    api.applyStudioBeautyPreview();
  });
  $(document).on('input', '#studioEyeSlider', function () {
    var val = $(this).val();
    $('#valStudioEye').text(val + '%');
    config.beauty = config.beauty || {};
    config.beauty.default_eye = parseInt(val, 10);
    api.applyStudioBeautyPreview();
  });
  $(document).on('input', '#studioSlimSlider', function () {
    var val = $(this).val();
    $('#valStudioSlim').text(val + '%');
    config.beauty = config.beauty || {};
    config.beauty.default_slim = parseInt(val, 10);
    api.applyStudioBeautyPreview();
  });
  $(document).on('click', '#btnResetStudioBeauty', function (e) {
    e.preventDefault();
    if (typeof window.syncBeautyToRuntime === 'function' && window.defaultBeautyConfig) {
      window.syncBeautyToRuntime(window.defaultBeautyConfig);
    } else if (typeof window.syncBeautyToRuntime === 'function' && window.config && window.config.beauty) {
      window.syncBeautyToRuntime(window.config.beauty);
    } else {
      $('.wb-preset-pill').removeClass('active');
      $('.wb-preset-pill[data-preset="natural"]').addClass('active');
      $('#studioSmoothSlider').val(30).trigger('input');
      $('#studioWhiteSlider').val(25).trigger('input');
      $('#studioRosySlider').val(20).trigger('input');
      $('#studioClaritySlider').val(15).trigger('input');
      $('#studioEyeSlider').val(15).trigger('input');
      $('#studioSlimSlider').val(15).trigger('input');
      api.applyStudioBeautyPreview();
    }
  });

  // Studio Filter Item Click -> Real-Time WYSIWYG Camera Preview
  $(document).on('click', '.wb-filter-item', function (e) {
    e.preventDefault();
    $('.wb-filter-item').removeClass('active');
    $(this).addClass('active');
    var filter = $(this).data('filter') || 'plain';
    imgFilter = filter;
    api.applyStudioBeautyPreview();
  });

  // Stage 3.6: Custom Countdown Dropdown Handler
  $(document).on('change', '#studioCountdownSelect', function () {
    var val = parseInt($(this).val(), 10) || 3;
    config.picture = config.picture || {};
    config.picture.cntdwn_time = val;
    localStorage.setItem('photobooth_custom_countdown', val);
    photoboothTools.console.logDev('Studio Custom Countdown set to: ' + val + 's');
  });

  // Stage 3.5: Studio AI Template Unified Single-Row Filtering (精简单排分类，区分男女专区与风格)
  api.filterStudioAiTemplates = function () {
    var sex = ($('#aiSexFilter').val() || 'all').toLowerCase(),
      category = ($('#aiCategoryFilter').val() || 'all').toLowerCase(),
      age = ($('#aiAgeFilter').val() || 'all').toLowerCase();
    var count = 0;
    $('#studioAiTplGrid .wb-tpl-card').each(function () {
      var cardSex = (this.dataset.sex || 'unisex').toLowerCase();
      var cardCat = (this.dataset.cat || 'custom').toLowerCase();
      var cardAge = (this.dataset.age || 'unspecified').toLowerCase();
      var isCardMale = cardSex === 'male' || cardSex === 'man';
      var isCardFemale = cardSex === 'female' || cardSex === 'woman';

      // Gender filter matching
      var matchSex = sex === 'all' || sex === 'male' && isCardMale || sex === 'man' && isCardMale || sex === 'female' && isCardFemale || sex === 'woman' && isCardFemale || cardSex === 'unisex';

      // Category filter matching (also supports direct male/female category selection)
      var matchCat = category === 'all' || cardCat === category || category === 'male' && isCardMale || category === 'man' && isCardMale || category === 'female' && isCardFemale || category === 'woman' && isCardFemale;

      // Age filter matching
      var matchAge = age === 'all' || cardAge === age || cardAge === 'unspecified';
      var visible = matchSex && matchCat && matchAge;
      $(this).toggle(visible);
      if (visible) count++;
    });
    $('#aiTemplateCount').text(count + ' 张模板');
    $('#aiTemplateEmpty').prop('hidden', count > 0);

    // If currently active card is filtered out, automatically select the first visible card
    var visibleCards = $('#studioAiTplGrid .wb-tpl-card:visible');
    if (visibleCards.length && !$('#studioAiTplGrid .wb-tpl-card.active:visible').length) {
      visibleCards.first().trigger('click');
    }
  };
  $(document).on('change', '#aiSexFilter, #aiCategoryFilter, #aiAgeFilter', api.filterStudioAiTemplates);

  // Studio AI Template Card Selection
  $(document).on('click', '#studioAiTplGrid .wb-tpl-card', function (e) {
    e.preventDefault();
    $('#studioAiTplGrid .wb-tpl-card').removeClass('active');
    $(this).addClass('active');
    var tplId = $(this).data('id');
    var tplTitle = $(this).data('title');
    var tplImage = $(this).data('image') || $(this).find('.wb-tpl-img').attr('src');
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
    // Sync to start modal
    $('#aiCurrentTemplateName').text(tplTitle);
    if (tplImage) {
      $('#aiCurrentTemplateThumb').attr('src', tplImage).show();
    }
    $('#aiTemplateGrid .ai-template-card').removeClass('active');
    $('#aiTemplateGrid .ai-template-card[data-id="' + tplId + '"]').addClass('active');
  });

  // AI Template Modal (Start Screen): Category and Gender Filtering
  api.filterAiModalTemplates = function () {
    var activeSex = $('.ai-sex-tab.active').data('sex') || 'all';
    var activeCat = $('.ai-cat-tab.active').data('category') || 'all';
    var count = 0;
    $('#aiTemplateGrid .ai-template-card').each(function () {
      var cardSex = $(this).data('sex') || 'unisex';
      var cardCat = $(this).data('category') || 'custom';
      var matchSex = activeSex === 'all' || cardSex === activeSex || cardSex === 'unisex';
      var matchCat = activeCat === 'all' || cardCat === activeCat;
      var visible = matchSex && matchCat;
      $(this).toggle(visible);
      if (visible) count++;
    });
    if (count === 0) {
      $('#aiTemplateModalEmpty').show();
    } else {
      $('#aiTemplateModalEmpty').hide();
    }
  };
  $(document).on('click', '.ai-sex-tab', function (e) {
    e.preventDefault();
    $('.ai-sex-tab').removeClass('active');
    $(this).addClass('active');
    api.filterAiModalTemplates();
  });
  $(document).on('click', '.ai-cat-tab:not(.ai-cat-tab--upload)', function (e) {
    e.preventDefault();
    $('.ai-cat-tab').removeClass('active');
    $(this).addClass('active');
    api.filterAiModalTemplates();
  });
  $(document).on('click', '#aiTemplateGrid .ai-template-card', function (e) {
    e.preventDefault();
    $('#aiTemplateGrid .ai-template-card').removeClass('active');
    $(this).addClass('active');
    var tplId = $(this).data('id');
    var tplTitle = $(this).data('title');
    var tplImage = $(this).data('image') || $(this).find('.ai-tpl-thumb').attr('src');
    window.selectedAiTemplate = {
      id: tplId,
      title: tplTitle,
      image: tplImage,
      path: tplImage
    };
    $('#aiCurrentTemplateName').text(tplTitle);
    if (tplImage) {
      $('#aiCurrentTemplateThumb').attr('src', tplImage).show();
    }

    // Also sync to Studio workbench
    $('#studioCurrentTplName').text(tplTitle);
    if (tplImage) {
      $('#studioCurrentTplThumb').attr('src', tplImage).show();
    }
    $('#studioAiTplGrid .wb-tpl-card').removeClass('active');
    $('#studioAiTplGrid .wb-tpl-card[data-id="' + tplId + '"]').addClass('active');
  });
  $(document).on('click', '#btnAiTemplateConfirm', function (e) {
    e.preventDefault();
    if (!window.selectedAiTemplate) {
      var firstVisible = $('#aiTemplateGrid .ai-template-card:visible').first();
      if (firstVisible.length) {
        firstVisible.trigger('click');
      } else {
        alert('请先挑选一张心仪的写真模板');
        return;
      }
    }
    $('#aiTemplateModal').fadeOut(150, function () {
      api.enterStudio('ai_swap');
    });
  });
  $(document).on('click', '#btnAiTemplateClose, #btnAiTemplateBack, #aiTemplateBackdrop', function (e) {
    e.preventDefault();
    $('#aiTemplateModal').fadeOut(150);
  });

  // Delete Custom AI Template
  $(document).on('click', '.wb-tpl-del-btn', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var btn = $(this);
    var tplId = btn.data('id');
    var card = btn.closest('.wb-tpl-card');
    if (!confirm('确定要删除此自定义写真模板吗？')) {
      return;
    }
    photoboothTools.ajaxWithCsrf({
      url: environment.publicFolders.api + '/deleteAiTemplate.php',
      type: 'POST',
      data: {
        id: tplId
      }
    }).done(function (res) {
      if (res && res.success) {
        var wasActive = card.hasClass('active');
        card.fadeOut(200, function () {
          $(this).remove();
          api.filterStudioAiTemplates();
          if (wasActive) {
            window.selectedAiTemplate = null;
            $('#studioCurrentTplName').text('请选择写真模板');
            $('#studioCurrentTplThumb').removeAttr('src').hide();
            var next = $('#studioAiTplGrid .wb-tpl-card:visible').first();
            (next.length ? next : $('#studioAiTplGrid .wb-tpl-card').first()).trigger('click');
          }
        });
      } else {
        alert(res.error || '删除模板失败');
      }
    }).fail(function () {
      alert('网络异常，删除失败');
    });
  });

  // Studio Upload Custom AI Template
  $(document).on('click', '#btnStudioUploadAiTemplate', function (e) {
    e.preventDefault();
    $('#studioAiTemplateUploadInput').trigger('click');
  });
  $(document).on('change', '#studioAiTemplateUploadInput', function () {
    var _this2 = this;
    if (!this.files || !this.files[0]) {
      return;
    }
    var file = this.files[0];
    var formData = new FormData();
    formData.append('template', file);
    var uploadBtn = $('#btnStudioUploadAiTemplate');
    uploadBtn.prop('disabled', true).addClass('loading').find('span').text('AI正脸质检中...');
    photoboothTools.ajaxWithCsrf({
      url: environment.publicFolders.api + '/uploadAiTemplate.php',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false
    }).done(function (res) {
      uploadBtn.prop('disabled', false).removeClass('loading').find('span').text('上传写真');
      if (res && res.success) {
        var newCard = $("\n                    <div class=\"wb-tpl-card active wb-tpl-card--custom\" data-id=\"".concat(res.id, "\" data-cat=\"custom\" data-sex=\"unisex\" data-age=\"unspecified\" data-custom=\"1\" data-title=\"").concat(res.title, "\" data-image=\"").concat(res.path, "\" role=\"button\" tabindex=\"0\">\n                        <div class=\"wb-tpl-thumb-box\">\n                            <img src=\"").concat(res.path, "\" alt=\"").concat(res.title, "\" class=\"wb-tpl-img\">\n                            <span class=\"wb-tpl-chip\" style=\"background:#8B5CF6;color:#fff;\">\u6211\u7684\u5199\u771F</span>\n                            <div class=\"wb-tpl-check\"><i class=\"fa fa-circle-check\"></i></div>\n                            <button type=\"button\" class=\"wb-tpl-del-btn\" data-id=\"").concat(res.id, "\" title=\"\u5220\u9664\u8BE5\u81EA\u5B9A\u4E49\u6A21\u677F\">\n                                <i class=\"fa fa-trash-can\"></i>\n                            </button>\n                        </div>\n                        <div class=\"wb-tpl-meta\">\n                            <div class=\"wb-tpl-title\">").concat(res.title, "</div>\n                            <div class=\"wb-tpl-tags\"><span class=\"tag-sex\">\u81EA\u5B9A\u4E49</span><span class=\"tag-feat\">\u6700\u65B0</span></div>\n                        </div>\n                    </div>\n                "));
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
        if (!$('#aiCategoryFilter option[value="custom"]').length) {
          $('#aiCategoryFilter').append($('<option>').val('custom').text('我的上传'));
        }
        // Ensure all or custom shows the new card
        $('#aiSexFilter, #aiCategoryFilter, #aiAgeFilter').val('all').trigger('change');
      } else {
        alert(res.error || '上传模板失败，请检查是否为五官清晰的正脸写真');
      }
    }).fail(function (xhr) {
      uploadBtn.prop('disabled', false).removeClass('loading').find('span').text('上传写真');
      alert(xhr.responseJSON && xhr.responseJSON.error || '网络异常，上传模板失败');
    }).always(function () {
      _this2.value = '';
    });
  });

  // Classic Studio Layout Mode Chips
  $(document).on('click', '#btnStudioModeSingle', function (e) {
    e.preventDefault();
    $('.wb-layout-chip').removeClass('active');
    $(this).addClass('active');
    window.studioClassicLayout = 'single';
    $('#studioFrameBar').slideUp(150);
    $('#studioPaperGuide').show();
    $('#studioPaperGuideBadge span').text('6寸标准相纸 (4"×6" 102×152mm)');
    $('#studioGuide2x2, #studioGuideStrip').hide();
    var curTitle = $('#studioClassicTplGrid .wb-classic-card.active').data('title') || '实景原生 (不换背景)';
    $('#studioCurrentTplName').text(curTitle);
  });
  $(document).on('click', '#btnStudioModeBurst', function (e) {
    e.preventDefault();
    $('.wb-layout-chip').removeClass('active');
    $(this).addClass('active');
    window.studioClassicLayout = 'burst';
    $('#studioFrameBar').slideDown(150);
    $('#studioPaperGuide').show();
    $('#studioPaperGuideBadge span').text('经典四格相纸 (2×2 拍立得拼图)');
    $('#studioGuide2x2').show();
    $('#studioGuideStrip').hide();
    $('#studioCurrentTplName').text('经典四格 (2x2方形)');
  });
  $(document).on('click', '#btnStudioModeLife4', function (e) {
    e.preventDefault();
    $('.wb-layout-chip').removeClass('active');
    $(this).addClass('active');
    window.studioClassicLayout = 'life4cuts';
    $('#studioFrameBar').slideDown(150);
    $('#studioPaperGuide').show();
    $('#studioPaperGuideBadge span').text('韩国人生四格双条胶片 (2"×6" 51×152mm × 2条)');
    $('#studioGuide2x2').hide();
    $('#studioGuideStrip').show();
    $('#studioCurrentTplName').text('人生四格 (2x6双条相纸)');
  });

  // Custom Classic Frame Color Selection
  $(document).on('click', '.wb-frame-chip', function (e) {
    e.preventDefault();
    $('.wb-frame-chip').removeClass('active');
    $(this).addClass('active');
    var color = $(this).data('color') || '#111827';
    var name = $(this).data('name') || '';
    window.studioClassicFrameColor = color;
    if (name.includes('黑')) window.studioClassicFrameTheme = 'black';else if (name.includes('白')) window.studioClassicFrameTheme = 'white';else if (name.includes('灰')) window.studioClassicFrameTheme = 'gray';else if (name.includes('咖')) window.studioClassicFrameTheme = 'coffee';else window.studioClassicFrameTheme = color;
  });

  // Classic Background Template Selection
  $(document).on('click', '#studioClassicTplGrid .wb-classic-card', function (e) {
    e.preventDefault();
    $('#studioClassicTplGrid .wb-classic-card').removeClass('active');
    $(this).addClass('active');
    var title = $(this).data('title');
    var img = $(this).data('image');
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
    var file = this.files[0];
    var formData = new FormData();
    formData.append('template', file);
    photoboothTools.ajaxWithCsrf({
      url: environment.publicFolders.api + '/uploadTemplate.php',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false
    }).done(function (res) {
      if (res && res.success) {
        var newCard = $("\n                    <div class=\"wb-classic-card active\" data-id=\"".concat(res.id, "\" data-title=\"").concat(res.title, "\" data-image=\"").concat(res.path, "\" role=\"button\" tabindex=\"0\">\n                        <div class=\"wb-classic-thumb-box\">\n                            <img src=\"").concat(res.path, "\" alt=\"").concat(res.title, "\" class=\"wb-classic-img\">\n                            <div class=\"wb-tpl-check\"><i class=\"fa fa-circle-check\"></i></div>\n                        </div>\n                        <div class=\"wb-classic-name\">").concat(res.title, "</div>\n                    </div>\n                "));
        $('#studioClassicTplGrid .wb-classic-card').removeClass('active');
        $('#studioClassicTplGrid').prepend(newCard);
        window.selectedClassicTemplate = {
          id: res.id,
          title: res.title,
          image: res.path
        };
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
    var customSec = parseInt($('#studioCountdownSelect').val() || localStorage.getItem('photobooth_custom_countdown') || 3, 10);
    if (customSec >= 1 && customSec <= 10) {
      config.picture = config.picture || {};
      config.picture.cntdwn_time = customSec;
      localStorage.setItem('photobooth_custom_countdown', customSec);
    }
    api.stopStudioPoseCarousel();
    if (window.photoboothMode === 'classic' && (window.studioClassicLayout === 'burst' || window.studioClassicLayout === 'life4cuts')) {
      studioPage.removeClass('stage--active');
      $('body').removeClass('mode--studio');
      if (window.studioClassicLayout === 'life4cuts') {
        window.burstLayout = '1x4_strip';
        window.burstTheme = window.studioClassicFrameTheme || 'black';
      } else {
        window.burstLayout = '2x2';
        window.burstTheme = window.studioClassicFrameTheme || 'white';
      }
      api.startBurstFlow();
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

  // Frame and handwriting are typed, serializable editor layers.
  api.frameId = null;
  api.setFrame = function (id) {
    var restoring = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (id && !baseImageSize) throw new Error('照片正在加载，请稍候');
    var overlay = $('#classicFrameOverlay');
    if (id) overlay.attr('src', window.PhotoboothCatalog.svgUrl(window.PhotoboothCatalog.frameSvg(id, baseImageSize.width, baseImageSize.height)));
    api.frameId = id || null;
    overlay.toggle(!!id).css('visibility', '');
    resultPage.toggleClass('has-classic-frame', !!id);
    $('[data-frame]').each(function () {
      $(this).toggleClass('active', (this.dataset.frame || null) === api.frameId);
    });
    api.layoutEditLayers();
    if (!restoring) api.pushEditState();
  };
  api.fillLayerContent = function (node, layer) {
    var content = node.find('.placed-sticker-content').empty();
    if (layer.asset) {
      node.addClass('placed-sticker--image').data('asset', layer.asset).data('ratio', layer.ratio || 1).data('strokes', layer.strokes || null);
      if (layer.type === 'handwriting') node.addClass('placed-sticker--signature');
      content.css({
        width: (layer.ratio || 1) + 'em',
        height: '1em'
      }).append($('<img alt="" draggable="false">').attr('src', layer.asset));
    } else {
      content.text(layer.content || '');
      if (layer.type === 'text') node.addClass('placed-sticker--text');
      if (layer.fontFamily) {
        content.css('font-family', layer.fontFamily);
        node.attr('data-font', layer.fontFamily);
      }
      if (layer.color) {
        content.css('color', layer.color);
        node.attr('data-color', layer.color);
      }
    }
  };
  api.addImageLayer = function (asset) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'image';
    var geometry = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    api.photoRect(); // Refuse edits before the base image is ready.
    var state = api.captureEditState();
    state.stickers.push(_objectSpread({
      type: type,
      asset: asset,
      ratio: 1,
      x: .5,
      y: .35,
      fontSize: .15,
      rotation: 0
    }, geometry));
    api.restoreEditState(state);
    $('#stickerCanvasOverlay').show();
    api.pushEditState();
  };

  // Drawer visibility is owned by editor-ui; previews always use the fixed sample.
  api.updateFilterThumbnails = function () {
    var imageUrl = window.PhotoboothCatalog.sample;
    $('.classic-qfilter-chip').each(function () {
      var $chip = $(this);
      var filterName = $chip.data('filter') || 'plain';
      var cssFilter = filterCssMap[filterName] || 'none';
      var $preview = $chip.find('.qfilter-preview');
      $preview.css({
        'background-image': "url(\"".concat(imageUrl, "\")"),
        'background-size': 'cover',
        'background-position': 'center',
        'filter': cssFilter
      });
    });
  };
  $(document).on('click', '.classic-qfilter-chip', function (e) {
    e.preventDefault();
    api.applyEditFilter($(this).data('filter') || 'plain');
  });

  // --------------------------------------------------------
  // Action Undo/Redo History Stack (小节点 4.2)
  // --------------------------------------------------------
  api.photoRect = function () {
    if (!baseImageSize) throw editTools.error('NOT_READY', '照片正在加载，请稍候');
    return editTools.contain(baseImageSize.width, baseImageSize.height, document.getElementById('stickerCanvasOverlay').getBoundingClientRect());
  };
  api.captureEditState = function () {
    var stickers = [];
    if (baseImageSize) {
      var photo = api.photoRect();
      $('#stickerCanvasOverlay .placed-sticker').each(function () {
        var content = this.querySelector('.placed-sticker-content');
        var style = getComputedStyle(content);
        var rect = content.getBoundingClientRect();
        var point = editTools.pointToPhoto(rect.left + rect.width / 2, rect.top + rect.height / 2, photo);
        stickers.push({
          type: this.getAttribute('data-type') || 'emoji',
          content: content.textContent,
          x: point.x,
          y: point.y,
          asset: $(this).data('asset') || null,
          ratio: $(this).data('ratio') || 1,
          strokes: $(this).data('strokes') || null,
          fontSize: parseFloat(style.fontSize) / photo.height,
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          color: style.color,
          letterSpacing: (parseFloat(style.letterSpacing) || 0) / photo.height,
          width: content.offsetWidth / photo.width,
          height: content.offsetHeight / photo.height,
          rotation: editTools.normalizeAngle(parseFloat(this.getAttribute('data-rotation')) || 0)
        });
      });
    }
    return {
      base: window.lastClassicBaseFile || api.filename || '',
      filter: window.currentActiveFilter || 'plain',
      frame: api.frameId,
      stickers: stickers
    };
  };
  api.updateHistoryButtons = function () {
    $('#btnClassicUndo').prop('disabled', !editHistory.past.length).toggleClass('has-undo', !!editHistory.past.length);
    $('#btnClassicRedo').prop('disabled', !editHistory.future.length).toggleClass('has-undo', !!editHistory.future.length);
  };
  api.pushEditState = function () {
    if (editHistory.commit(api.captureEditState())) api.invalidateComposite();
    api.updateHistoryButtons();
  };
  api.initUndoStack = function () {
    editHistory.reset(api.captureEditState());
    api.updateHistoryButtons();
  };
  api.applyEditFilter = function (filter) {
    var restoring = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (!Object.prototype.hasOwnProperty.call(filterCssMap, filter)) return;
    window.currentActiveFilter = filter;
    window.photoEditState.filter = filter;
    resultPage.removeClass(allFilterClasses).css('--stage-result-filter', filterCssMap[filter]);
    document.documentElement.style.setProperty('--stage-result-filter', filterCssMap[filter]);
    $('.classic-qfilter-chip').each(function () {
      $(this).toggleClass('active', $(this).data('filter') === filter);
    });
    $('.filter-card[data-filter], .sidenav-list-item[data-filter]').each(function () {
      $(this).toggleClass('filter-card--active sidenav-list-item--active', $(this).data('filter') === filter);
    });
    if (!restoring) api.pushEditState();
  };
  api.positionLayer = function (element, layer, photo) {
    var overlay = document.getElementById('stickerCanvasOverlay').getBoundingClientRect();
    var content = element.querySelector('.placed-sticker-content');
    content.style.fontSize = layer.fontSize * photo.height + 'px';
    var angle = layer.rotation * Math.PI / 180;
    var halfW = (Math.abs(Math.cos(angle)) * element.offsetWidth + Math.abs(Math.sin(angle)) * element.offsetHeight) / 2;
    var halfH = (Math.abs(Math.sin(angle)) * element.offsetWidth + Math.abs(Math.cos(angle)) * element.offsetHeight) / 2;
    var clamp = function clamp(center, size, half) {
      return half * 2 >= size ? size / 2 : Math.min(size - half, Math.max(half, center));
    };
    var x = clamp(layer.x * photo.width, photo.width, halfW);
    var y = clamp(layer.y * photo.height, photo.height, halfH);
    element.style.left = photo.left - overlay.left + x - element.offsetWidth / 2 + 'px';
    element.style.top = photo.top - overlay.top + y - element.offsetHeight / 2 + 'px';
    element.style.transform = 'rotate(' + layer.rotation + 'deg)';
    element.setAttribute('data-rotation', layer.rotation);
  };
  api.constrainLayer = function (element) {
    var index = $('#stickerCanvasOverlay .placed-sticker').index(element);
    var layer = api.captureEditState().stickers[index];
    if (layer) api.positionLayer(element, layer, api.photoRect());
  };
  api.layoutEditLayers = function () {
    if (!baseImageSize || !resultPage.hasClass('stage--active')) return;
    var photo = api.photoRect();
    var stage = resultPage[0].getBoundingClientRect();
    var overlay = document.getElementById('stickerCanvasOverlay').getBoundingClientRect();
    var frame = document.getElementById('classicFrameOverlay');
    for (var _i2 = 0, _Object$entries = Object.entries({
        left: photo.left - stage.left,
        top: photo.top - stage.top,
        width: photo.width,
        height: photo.height
      }); _i2 < _Object$entries.length; _i2++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
        key = _Object$entries$_i[0],
        value = _Object$entries$_i[1];
      frame.style.setProperty(key, value + 'px', 'important');
    }
    frame.style.setProperty('right', 'auto', 'important');
    frame.style.setProperty('bottom', 'auto', 'important');
    if (api.frameId && window.PhotoboothCatalog && typeof window.PhotoboothCatalog.frameGeometry === 'function') {
      var geom = window.PhotoboothCatalog.frameGeometry(api.frameId, baseImageSize.width, baseImageSize.height);
      var scaleX = photo.width / baseImageSize.width;
      var scaleY = photo.height / baseImageSize.height;
      var innerLeft = photo.left - stage.left + geom.innerX * scaleX;
      var innerTop = photo.top - stage.top + geom.innerY * scaleY;
      var innerW = geom.innerWidth * scaleX;
      var innerH = geom.innerHeight * scaleY;
      resultPage[0].style.setProperty('--stage-frame-inner-left', innerLeft + 'px');
      resultPage[0].style.setProperty('--stage-frame-inner-top', innerTop + 'px');
      resultPage[0].style.setProperty('--stage-frame-inner-width', innerW + 'px');
      resultPage[0].style.setProperty('--stage-frame-inner-height', innerH + 'px');
      resultPage.addClass('has-classic-frame');
    } else {
      resultPage.removeClass('has-classic-frame');
      if (resultPage[0]) {
        resultPage[0].style.removeProperty('--stage-frame-inner-left');
        resultPage[0].style.removeProperty('--stage-frame-inner-top');
        resultPage[0].style.removeProperty('--stage-frame-inner-width');
        resultPage[0].style.removeProperty('--stage-frame-inner-height');
      }
    }
    document.getElementById('stickerCanvasOverlay').style.clipPath = 'inset(' + (photo.top - overlay.top) + 'px ' + (overlay.right - photo.left - photo.width) + 'px ' + (overlay.bottom - photo.top - photo.height) + 'px ' + (photo.left - overlay.left) + 'px)';
    var layers = editHistory.present && editHistory.present.stickers || [];
    $('#stickerCanvasOverlay .placed-sticker').each(function (index) {
      if (layers[index]) api.positionLayer(this, layers[index], photo);
    });
  };
  api.restoreEditState = function (state) {
    if (activeGestureCancel) activeGestureCancel();
    if (!state || state.base !== (window.lastClassicBaseFile || api.filename || '')) return;
    api.applyEditFilter(state.filter, true);
    api.setFrame(state.frame, true);
    var overlay = $('#stickerCanvasOverlay').empty().css('visibility', '');
    state.stickers.forEach(function (layer) {
      var node = $('<div class="placed-sticker"><button type="button" class="sticker-del-btn" title="删除"><i class="fa fa-times"></i></button><div class="sticker-rotate-btn" title="旋转"><i class="fa fa-rotate"></i></div><div class="placed-sticker-content"></div><div class="sticker-resize-btn" title="缩放"><i class="fa fa-up-right-and-down-left-from-center"></i></div></div>');
      if (layer.type === 'signature' || layer.type === 'stamp') node.addClass('placed-sticker--' + layer.type);
      if (layer.type === 'text') node.addClass('placed-sticker--text');
      node.attr('data-type', layer.type).attr('data-content', layer.content);
      api.fillLayerContent(node, layer);
      overlay.append(node);
      api.positionLayer(node[0], layer, api.photoRect());
      api.initPlacedStickerInteraction(node);
    });
    api.invalidateComposite();
    api.updateHistoryButtons();
  };
  api.undoEditState = function () {
    api.restoreEditState(editHistory.undo());
  };
  api.redoEditState = function () {
    api.restoreEditState(editHistory.redo());
  };
  $(document).on('click', '#btnClassicUndo', function (e) {
    e.preventDefault();
    api.undoEditState();
  });
  $(document).on('click', '#btnClassicRedo', function (e) {
    e.preventDefault();
    api.redoEditState();
  });
  if (typeof ResizeObserver !== 'undefined') {
    var stickerViewport = document.getElementById('stickerCanvasOverlay');
    if (stickerViewport) new ResizeObserver(function () {
      if (activeGestureCancel) activeGestureCancel();
      api.layoutEditLayers();
    }).observe(stickerViewport);
  } else $(window).on('resize', api.layoutEditLayers);

  // 3. Stickers Drawer & Interactive Overlay
  $(document).on('click', '.sticker-tab-pill', function (e) {
    e.preventDefault();
    $('.sticker-tab-pill').removeClass('active');
    $(this).addClass('active');
    var cat = $(this).data('category');
    $('#stickerGridCute, #stickerGridProps, #stickerGridText').hide();
    if (cat === 'cute') $('#stickerGridCute').show();else if (cat === 'props') $('#stickerGridProps').show();else if (cat === 'text') $('#stickerGridText').show();
  });

  // T-04: Clear stickers only, preserving personalized signatures
  $(document).on('click', '#btnStickerClear', function (e) {
    e.preventDefault();
    $('#stickerCanvasOverlay .placed-sticker:not(.placed-sticker--signature)').remove();
    window.lastRenderedComposite = null;
    api.pushEditState();
    if (window.photoboothTools && window.photoboothTools.showNotification) {
      photoboothTools.showNotification('info', '已清空装饰贴纸（个性签名已保留）');
    }
  });

  // Add Sticker to Overlay
  // Add Sticker to Overlay (Drawer remains open for multi-selection)
  $(document).on('click', '.sticker-item', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.dataset.asset) {
      try {
        api.addImageLayer(this.dataset.asset);
        if (window.photoboothTools && window.photoboothTools.showNotification) {
          photoboothTools.showNotification('success', '✨ 贴纸已添加！点击画面上的贴纸可旋转缩放');
        }
      } catch (error) {
        api.reportEditError(error);
      }
      return;
    }
    var type = $(this).data('type') || 'emoji';
    var content = $(this).data('content') || '';
    var isStamp = type === 'stamp';
    var stampClass = isStamp ? 'placed-sticker--stamp' : '';
    var initialSize = isStamp ? 26 : 48;
    var overlay = $('#stickerCanvasOverlay');
    overlay.show();
    var overlayW = overlay.width() || 600;
    var overlayH = overlay.height() || 800;
    var posX = Math.round(overlayW * 0.45 + (Math.random() * 60 - 30));
    var posY = Math.round(overlayH * 0.28 + (Math.random() * 60 - 30));
    var $sticker = $("\n            <div class=\"placed-sticker is-active ".concat(stampClass, "\" style=\"left: ").concat(posX, "px; top: ").concat(posY, "px;\">\n                <button type=\"button\" class=\"sticker-del-btn\" title=\"\u5220\u9664\u8D34\u7EB8\"><i class=\"fa fa-times\"></i></button>\n                <div class=\"sticker-rotate-btn\" role=\"button\" tabindex=\"0\" title=\"\u65CB\u8F6C\u8D34\u7EB8\"><i class=\"fa fa-rotate\"></i></div>\n                <div class=\"placed-sticker-content\" style=\"font-size: ").concat(initialSize, "px;\"></div>\n                <div class=\"sticker-resize-btn\" role=\"button\" tabindex=\"0\" title=\"\u7F29\u653E\u8D34\u7EB8\"><i class=\"fa fa-up-right-and-down-left-from-center\"></i></div>\n            </div>\n        "));
    $sticker.attr('data-type', type).data('type', type);
    $sticker.attr('data-content', content).data('content', content);
    $sticker.find('.placed-sticker-content').text(content);
    $('.placed-sticker').removeClass('is-active');
    overlay.append($sticker);
    api.constrainLayer($sticker[0]);
    api.initPlacedStickerInteraction($sticker);
    window.lastRenderedComposite = null;
    api.pushEditState();
    if (window.photoboothTools && window.photoboothTools.showNotification) {
      photoboothTools.showNotification('success', '✨ 贴纸已添加！点击画面上的贴纸可旋转缩放');
    }
  });
  $(document).on('click', '.sticker-del-btn', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).closest('.placed-sticker').remove();
    window.lastRenderedComposite = null;
    api.pushEditState();
  });

  // Tap outside to deselect active sticker
  $(document).on('pointerdown', function (e) {
    if (!$(e.target).closest('.placed-sticker, .sticker-drawer, .signature-drawer, .result-sidebar, .classic-filter-quickbar, #frameDrawer').length) {
      $('.placed-sticker').removeClass('is-active');
    }
  });
  api.initPlacedStickerInteraction = function ($sticker) {
    var $rotateBtn = $sticker.find('.sticker-rotate-btn');
    var $resizeBtn = $sticker.find('.sticker-resize-btn');

    // 1. Dedicated Rotate Handle Interaction
    $rotateBtn.on('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      $('.placed-sticker').removeClass('is-active');
      $sticker.addClass('is-active');
      api.invalidateComposite();
      var targetEl = e.target;
      if (targetEl.setPointerCapture && e.pointerId !== undefined) {
        try {
          targetEl.setPointerCapture(e.pointerId);
        } catch (err) {}
      }
      var rect = $sticker[0].getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;
      var initialRot = parseFloat($sticker.attr('data-rotation') || $sticker.data('rotation')) || 0;
      var startPointerAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      var pointerId = e.pointerId;
      var moved = false;
      function onPointerMove(ev) {
        if (ev.pointerId !== pointerId) return;
        var curAngle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX);
        var diffDeg = (curAngle - startPointerAngle) * (180 / Math.PI);
        if (Math.abs(diffDeg) > 2) moved = true;
        var deg = Math.round((initialRot + diffDeg) % 360);
        if (deg < 0) deg += 360;
        $sticker.attr('data-rotation', deg).data('rotation', deg);
        $sticker.css('transform', "rotate(".concat(deg, "deg)"));
      }
      function onPointerUp(ev) {
        if (ev.pointerId !== pointerId) return;
        $(document).off('.stickerRotateDrag');
        if (!moved) {
          // Tap to rotate clockwise 15 deg
          var deg = Math.round((initialRot + 15) % 360);
          $sticker.attr('data-rotation', deg).data('rotation', deg);
          $sticker.css('transform', "rotate(".concat(deg, "deg)"));
        }
        api.pushEditState();
      }
      $(document).on('pointermove.stickerRotateDrag', onPointerMove);
      $(document).on('pointerup.stickerRotateDrag pointercancel.stickerRotateDrag', onPointerUp);
    });

    // 2. Dedicated Resize Handle Interaction
    $resizeBtn.on('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      $('.placed-sticker').removeClass('is-active');
      $sticker.addClass('is-active');
      api.invalidateComposite();
      var targetEl = e.target;
      if (targetEl.setPointerCapture && e.pointerId !== undefined) {
        try {
          targetEl.setPointerCapture(e.pointerId);
        } catch (err) {}
      }
      var startX = e.clientX;
      var startY = e.clientY;
      var $content = $sticker.find('.placed-sticker-content');
      var initialFontSize = parseFloat($content.css('font-size')) || 36;
      var pointerId = e.pointerId;
      var moved = false;
      function onPointerMove(ev) {
        if (ev.pointerId !== pointerId) return;
        var dx = ev.clientX - startX;
        var dy = ev.clientY - startY;
        var delta = (dx + dy) * 0.75;
        if (Math.abs(delta) > 3) moved = true;
        var newSize = Math.max(16, Math.min(220, Math.round(initialFontSize + delta)));
        $content.css('font-size', "".concat(newSize, "px"));
        api.constrainLayer($sticker[0]);
      }
      function onPointerUp(ev) {
        if (ev.pointerId !== pointerId) return;
        $(document).off('.stickerResizeDrag');
        if (!moved) {
          // Tap to scale step (cycle +12px)
          var curSize = parseFloat($content.css('font-size')) || initialFontSize;
          var nextSize = curSize >= 120 ? 32 : curSize + 16;
          $content.css('font-size', "".concat(nextSize, "px"));
          api.constrainLayer($sticker[0]);
        }
        api.pushEditState();
      }
      $(document).on('pointermove.stickerResizeDrag', onPointerMove);
      $(document).on('pointerup.stickerResizeDrag pointercancel.stickerResizeDrag', onPointerUp);
    });

    // 3. Sticker Body Dragging Interaction
    $sticker.on('pointerdown', function (e) {
      if ($(e.target).closest('.sticker-del-btn, .sticker-rotate-btn, .sticker-resize-btn').length) return;
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      $('.placed-sticker').removeClass('is-active');
      $sticker.addClass('is-active');
      api.invalidateComposite();
      var startX = e.clientX;
      var startY = e.clientY;
      var initialLeft = parseFloat($sticker.css('left')) || 0;
      var initialTop = parseFloat($sticker.css('top')) || 0;
      var pointerId = e.pointerId;
      function onPointerMove(ev) {
        if (ev.pointerId !== pointerId) return;
        var dx = ev.clientX - startX;
        var dy = ev.clientY - startY;
        $sticker.css({
          left: "".concat(initialLeft + dx, "px"),
          top: "".concat(initialTop + dy, "px")
        });
        api.constrainLayer($sticker[0]);
      }
      function onPointerUp(ev) {
        if (ev.pointerId !== pointerId) return;
        $(document).off('.stickerBodyDrag');
        api.pushEditState();
      }
      $(document).on('pointermove.stickerBodyDrag', onPointerMove);
      $(document).on('pointerup.stickerBodyDrag pointercancel.stickerBodyDrag', onPointerUp);
    });
  };
  api.compositeInput = function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : api.captureEditState();
    var photo = api.photoRect();
    return {
      baseUrl: environment.publicFolders.images + '/' + state.base,
      filterCss: filterCssMap[state.filter] || 'none',
      frameUrl: state.frame ? window.PhotoboothCatalog.svgUrl(window.PhotoboothCatalog.frameSvg(state.frame, baseImageSize.width, baseImageSize.height)) : null,
      frame: state.frame,
      previewHeight: photo.height,
      layers: state.stickers
    };
  };
  api.bakeComposite = function () {
    try {
      if (activeGestureCancel) throw new Error('请先完成当前拖动，再领取成片');
      if (window.PhotoboothInk && window.PhotoboothInk.active()) throw new Error('请先完成或取消手写签名');
      if ($('#beautyModal').hasClass('active') || resultPage.hasClass('cutout-mode-active')) {
        throw new Error('请先完成美颜或背景调整，再领取成片');
      }
      var state = api.captureEditState();
      if (!state.base) throw new Error('没有可保存的照片');
      if (!baseImageSize) throw new Error('照片正在加载，请稍候再领取');
      if (!state.stickers.length && !state.frame && state.filter === 'plain') return Promise.resolve(state.base);
      var photo = api.photoRect();
      var signature = JSON.stringify({
        session: editSession,
        state: state
      });
      var frozen = api.compositeInput(state);
      return compositeSaves.run(signature, frozen, /*#__PURE__*/function () {
        var _ref10 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(input, context) {
          var sequence, closeWaiting, blob, bytes, data, response, result, attempt, refreshed;
          return _regenerator().w(function (_context10) {
            while (1) switch (_context10.p = _context10.n) {
              case 0:
                sequence = ++saveSequence;
                photoboothTools.overlay.showWaiting('正在保存当前成片，请稍候…');
                closeWaiting = function closeWaiting() {
                  if (sequence === saveSequence) photoboothTools.overlay.close();
                };
                context.signal.addEventListener('abort', closeWaiting, {
                  once: true
                });
                _context10.p = 1;
                if (!(!pendingComposite || pendingComposite.signature !== signature)) {
                  _context10.n = 3;
                  break;
                }
                _context10.n = 2;
                return window.PhotoboothCompositeRenderer.render(input, context);
              case 2:
                blob = _context10.v;
                context.check();
                bytes = new Uint8Array(16);
                crypto.getRandomValues(bytes);
                pendingComposite = {
                  signature: signature,
                  blob: blob,
                  saveId: Array.from(bytes, function (_byte) {
                    return _byte.toString(16).padStart(2, '0');
                  }).join('')
                };
              case 3:
                context.check();
                data = new FormData();
                data.append('photo', pendingComposite.blob, 'composite.png');
                data.append('composite_save_id', pendingComposite.saveId);
                attempt = 0;
              case 4:
                if (!(attempt < 2)) {
                  _context10.n = 11;
                  break;
                }
                context.check();
                photoboothTools.addCsrfToPayload(data);
                _context10.n = 5;
                return fetch(environment.publicFolders.api + '/uploadPhoto.php', {
                  method: 'POST',
                  body: data,
                  credentials: 'same-origin',
                  signal: context.signal
                });
              case 5:
                response = _context10.v;
                _context10.n = 6;
                return response.json();
              case 6:
                result = _context10.v;
                context.check();
                if (!(attempt === 0 && photoboothTools.isCsrfErrorResponse({
                  status: response.status,
                  responseJSON: result
                }))) {
                  _context10.n = 9;
                  break;
                }
                _context10.n = 7;
                return photoboothTools.refreshCsrfToken();
              case 7:
                refreshed = _context10.v;
                context.check();
                if (refreshed) {
                  _context10.n = 8;
                  break;
                }
                throw new Error('会话校验更新失败，请检查连接后重试');
              case 8:
                return _context10.a(3, 10);
              case 9:
                return _context10.a(3, 11);
              case 10:
                attempt++;
                _context10.n = 4;
                break;
              case 11:
                if (!(!response.ok || !result.success || !result.file)) {
                  _context10.n = 12;
                  break;
                }
                throw new Error(result.error || '成片保存失败，请重试');
              case 12:
                window.lastRenderedComposite = {
                  signature: signature,
                  file: result.file
                };
                api.addImage(result.file);
                return _context10.a(2, result.file);
              case 13:
                _context10.p = 13;
                context.signal.removeEventListener('abort', closeWaiting);
                closeWaiting();
                return _context10.f(13);
              case 14:
                return _context10.a(2);
            }
          }, _callee10, null, [[1,, 13, 14]]);
        }));
        return function (_x16, _x17) {
          return _ref10.apply(this, arguments);
        };
      }());
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // Save Stickers (Close drawer, deselect handles, and notify ready for delivery)
  $(document).on('click', '#btnStickerSave', function (e) {
    e.preventDefault();
    if (api.closeEditorDrawers) api.closeEditorDrawers();else $('#stickerModal').attr('aria-hidden', 'true').fadeOut(150);
    $('.placed-sticker').removeClass('is-active');
    if (window.photoboothTools && window.photoboothTools.showNotification) {
      photoboothTools.showNotification('success', '✨ 潮流装扮已就绪，可直接打印或扫码出片');
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
    e.stopPropagation();
    e.stopImmediatePropagation();
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
    var file = this.files[0];
    var fileInput = this;
    var formData = new FormData();
    formData.append('template', file);
    if (window.photoboothTools && window.photoboothTools.overlay) {
      photoboothTools.overlay.showWaiting('正在上传自定义换脸模板，请稍候...');
    }
    photoboothTools.ajaxWithCsrf({
      url: environment.publicFolders.api + '/uploadAiTemplate.php',
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
        var newCardHtml = "\n                    <div class=\"ai-template-card active\" data-id=\"".concat(data.id, "\" data-category=\"custom\" data-title=\"").concat(data.title, "\" data-image=\"").concat(data.image, "\">\n                        <div class=\"ai-tpl-badge\" style=\"background:#FDE047; color:#854D0E;\">\u2B50 \u81EA\u5B9A\u4E49</div>\n                        <div class=\"ai-tpl-thumb-wrap\">\n                            <img class=\"ai-tpl-thumb\" src=\"").concat(data.image, "\" alt=\"").concat(data.title, "\">\n                        </div>\n                        <div class=\"ai-tpl-info\">\n                            <div class=\"ai-tpl-name\">").concat(data.title, "</div>\n                            <div class=\"ai-tpl-tags\"><span>\u7528\u6237\u4E0A\u4F20</span><span>\u4E2A\u6027\u5B9A\u5236</span></div>\n                        </div>\n                        <div class=\"ai-tpl-selected-check\"><i class=\"fa fa-circle-check\"></i></div>\n                    </div>\n                ");
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
      alert(xhr.responseJSON && xhr.responseJSON.error || '模板上传网络请求失败: ' + error);
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
    loaderMessage.html('<div style="text-align:center;">' + '<h2 style="font-size:2.2rem;color:#FBBF24;margin-bottom:0.5rem;"><i class="fa fa-film"></i> 连拍进行中</h2>' + '<p style="font-size:1.3rem;color:#FFF;">正在抓拍第 <strong style="color:#F472B6;font-size:1.8rem;">' + (shotIndex + 1) + '</strong> / ' + window.burstTotalShots + ' 张</p>' + '</div>');
    api.thrill(PhotoStyle.PHOTO);
  };
  api.renderBurstWorkbench = function () {
    loader.removeClass('stage--active');
    startPage.removeClass('stage--active');
    resultPage.removeClass('stage--active');
    var grid = $('#burstWorkbenchGrid');
    grid.empty();
    window.burstPhotos.forEach(function (file, idx) {
      var isSelected = window.burstSelectedIndices.includes(idx);
      var orderIndex = window.burstSelectedIndices.indexOf(idx);
      var badgeText = isSelected ? orderIndex + 1 : '+';
      var selectedClass = isSelected ? 'selected' : '';
      var imgUrl = environment.publicFolders.images + '/' + file + '?v=' + Date.now();
      var card = $("\n                <div class=\"burst-item-card ".concat(selectedClass, "\" data-index=\"").concat(idx, "\">\n                    <div class=\"burst-item-thumb-wrap\">\n                        <img class=\"burst-item-thumb\" src=\"").concat(imgUrl, "\" alt=\"Shot ").concat(idx + 1, "\" />\n                        <div class=\"burst-order-badge\">").concat(badgeText, "</div>\n                    </div>\n                    <div class=\"burst-item-toolbar\">\n                        <span class=\"burst-item-label\">\u7B2C ").concat(idx + 1, " \u5F20</span>\n                        <button type=\"button\" class=\"btn-retake-shot\" data-index=\"").concat(idx, "\" title=\"\u91CD\u65B0\u62CD\u6444\u6B64\u5F20\">\n                            <i class=\"fa fa-camera-rotate\"></i> \u4EC5\u91CD\u62CD\n                        </button>\n                    </div>\n                </div>\n            "));
      grid.append(card);
    });
    $('#burstSelectedCount').text("\u5DF2\u9009 ".concat(window.burstSelectedIndices.length, " / 4 \u5F20"));
    if (window.burstLayout) {
      $('.burst-layout-btn').removeClass('active');
      $(".burst-layout-btn[data-layout=\"".concat(window.burstLayout, "\"]")).addClass('active');
    }
    if (window.burstTheme) {
      $('.burst-theme-pill').removeClass('active');
      $(".burst-theme-pill[data-theme=\"".concat(window.burstTheme, "\"]")).addClass('active');
    }
    $('#burstWorkbenchModal').fadeIn(200);
  };
  api.startBurstFlow = function () {
    api.setPhotoboothMode('classic');
    window.burstModeActive = true;
    window.burstPhotos = [];
    window.burstCurrentShot = 0;
    window.burstRetakeIndex = -1;
    window.burstSelectedIndices = [0, 1, 2, 3];
    $('#burstWorkbenchModal').hide();
    api.startBurstShot(0);
  };

  // Trigger Burst Shoot
  $(document).on('click', '#btnClassicBurst', function (e) {
    e.preventDefault();
    api.startBurstFlow();
  });

  // Select / Deselect Card in Burst Workbench
  $(document).on('click', '.burst-item-card', function (e) {
    if ($(e.target).closest('.btn-retake-shot').length > 0) return;
    var idx = parseInt($(this).data('index'), 10);
    var pos = window.burstSelectedIndices.indexOf(idx);
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
    var retakeIdx = parseInt($(this).data('index'), 10);
    window.burstRetakeIndex = retakeIdx;
    $('#burstWorkbenchModal').fadeOut(150, function () {
      loaderMessage.html('<div style="text-align:center;">' + '<h2 style="font-size:2.2rem;color:#F59E0B;margin-bottom:0.5rem;"><i class="fa fa-camera-rotate"></i> 局部重拍模式</h2>' + '<p style="font-size:1.3rem;color:#FFF;">正在重拍第 <strong style="color:#F472B6;">' + (retakeIdx + 1) + '</strong> 张，请准备！</p>' + '</div>');
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
        api.startBurstFlow();
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
    var chosenFiles = window.burstSelectedIndices.map(function (i) {
      return window.burstPhotos[i];
    });
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
      data: {
        action: 'create',
        mode: mode
      },
      dataType: 'json'
    }).done(function (data) {
      if (data && data.success) {
        window.payGateActiveOrderId = data.order_id;
        $('#payGateAmount').text(data.amount);
        $('#payGateModeTitle').text(data.mode_name);
        $('#payQrWx').attr('src', data.qr_wechat);
        $('#payQrAli').attr('src', data.qr_alipay);
        var timeLeft = 120;
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
      data: {
        order_id: window.payGateActiveOrderId
      },
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

  // Commercial Print Proofing Modal Events
  $(document).on('click', '#btnCommercialPrintPreview, #btnHeaderPrintProof', function (e) {
    e.preventDefault();
    var curImg = window.lastClassicDecoratedFile ? environment.publicFolders.images + '/' + window.lastClassicDecoratedFile : resultPage.attr('data-img') ? environment.publicFolders.images + '/' + resultPage.attr('data-img') : null;
    if (!curImg) {
      var bgVal = resultPage.css('--stage-background-image') || '';
      var m = bgVal.match(/url\(["']?([^"']+)["']?\)/);
      if (m && m[1]) curImg = m[1];
    }
    if (curImg) {
      $('#printProofPhotoImg').attr('src', curImg);
    }
    var currentLayout = window.studioClassicLayout || 'single';
    if (window.burstActive || currentLayout === 'life4cuts' || window.burstLayout === '1x4_strip') {
      $('#printSpecName').text('韩国人生四格双条胶片 (2" × 6" × 2条)');
      $('#printSpecDimension').text('51mm × 152mm (300 DPI 工业干式冲印)');
      $('#printSpecResolution').text('有效像素: 600 × 1800 px (双联排版)');
    } else if (currentLayout === 'burst' || window.burstLayout === '2x2') {
      $('#printSpecName').text('2×2 经典四格方形相纸 (4" × 6")');
      $('#printSpecDimension').text('102mm × 152mm (300 DPI 工业干式冲印)');
      $('#printSpecResolution').text('有效像素: 1800 × 1200 px');
    } else {
      $('#printSpecName').text('6寸标准相纸 (4" × 6")');
      $('#printSpecDimension').text('102mm × 152mm (300 DPI 工业干式冲印)');
      $('#printSpecResolution').text('有效像素: 1800 × 1200 px');
    }
    $('#commercialPrintModal').fadeIn(200);
  });
  $(document).on('click', '#btnCommercialPrintClose, #commercialPrintBackdrop, #btnModalBackEdit', function (e) {
    e.preventDefault();
    $('#commercialPrintModal').fadeOut(150);
  });
  $(document).on('click', '.finish-chip', function (e) {
    e.preventDefault();
    $('.finish-chip').removeClass('active');
    $(this).addClass('active');
    var finish = $(this).data('finish') || 'glossy';
    $('#printPaperMockup').removeClass('print-paper-finish--glossy print-paper-finish--matte print-paper-finish--pearl').addClass('print-paper-finish--' + finish);
  });
  $(document).on('change', '#chkShowBleed', function () {
    $('#printBleedGuide').toggle(this.checked);
  });
  $(document).on('change', '#chkShowWatermark', function () {
    $('#printPaperWatermark').toggle(this.checked);
  });
  $(document).on('click', '#btnModalTriggerPrint', function (e) {
    e.preventDefault();
    $('#commercialPrintModal').fadeOut(100);
    var printBtn = $('.printbtn').first();
    if (printBtn.length) {
      printBtn.trigger('click');
    } else {
      alert('正在启动打印队列...');
    }
  });
  return api;
}();
window.photoBooth = photoBooth;
$(function () {
  photoBooth.init();
});