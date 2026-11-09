"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/* global config, environment, photoboothTools, photoboothPreview, photoBooth */
// Independent capture session: one countdown and one real capture for each layout cell.
(function () {
  'use strict';

  var root = document.getElementById('creativeWorkshop');
  if (!root) return;
  var el = function el(id) {
    return document.getElementById(id);
  };
  var catalog = JSON.parse(el('workshopCatalog').textContent);
  var previewVideo = document.getElementById('preview--video');
  var beautyCanvas = document.getElementById('preview--beauty-canvas');
  var previewContainer = document.getElementById('preview--video-container');
  var previewOriginalParent = previewContainer === null || previewContainer === void 0 ? void 0 : previewContainer.parentElement;
  var previewOriginalNextSibling = previewContainer === null || previewContainer === void 0 ? void 0 : previewContainer.nextSibling;
  var previewSlot = document.getElementById('workshopPreviewSlot');
  var notice = el('workshopNotice');
  var studio = el('studioStage');
  var studioAnchor = document.createComment('shared studio position');
  studio.before(studioAnchor);
  var captureTools = ['workshopPreviewSlot', 'workshopCropGuide', 'workshopCountdown', 'workshopFlash', 'workshopProgress'];
  var countdownSounds = new Map();
  var audioReady = false;
  var countdownSeconds = 3;
  var backgroundTemplate = '';
  var sharedStudioMounted = false;
  function stopCountdownAudio() {
    countdownSounds.forEach(function (audio) {
      audio.pause();
      audio.currentTime = 0;
    });
  }
  function prepareAudio(_x) {
    return _prepareAudio.apply(this, arguments);
  }
  function _prepareAudio() {
    _prepareAudio = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(id) {
      var response;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            audioReady = false;
            syncCaptureButton();
            if (!(config.sound.enabled && config.sound.countdown_enabled)) {
              _context2.n = 5;
              break;
            }
            if (photoboothTools.sounds) {
              _context2.n = 4;
              break;
            }
            _context2.n = 1;
            return fetch("".concat(environment.publicFolders.api, "/sounds.php"), {
              cache: 'no-store'
            });
          case 1:
            response = _context2.v;
            if (response.ok) {
              _context2.n = 2;
              break;
            }
            throw new Error('倒数语音加载失败，请重试。');
          case 2:
            _context2.n = 3;
            return response.json();
          case 3:
            photoboothTools.sounds = _context2.v;
          case 4:
            check(id);
            _context2.n = 5;
            return Promise.all(Array.from({
              length: 10
            }, /*#__PURE__*/function () {
              var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_, index) {
                var _countdownSounds$get;
                var count, sound, audio;
                return _regenerator().w(function (_context) {
                  while (1) switch (_context.n) {
                    case 0:
                      count = index + 1;
                      sound = photoboothTools.getSound("counter-".concat(count));
                      if (sound) {
                        _context.n = 1;
                        break;
                      }
                      throw new Error('倒数语音缺失，请检查声音设置后重试。');
                    case 1:
                      if (!(((_countdownSounds$get = countdownSounds.get(count)) === null || _countdownSounds$get === void 0 ? void 0 : _countdownSounds$get.readyState) >= 3)) {
                        _context.n = 2;
                        break;
                      }
                      return _context.a(2);
                    case 2:
                      audio = new Audio();
                      audio.preload = 'auto';
                      countdownSounds.set(count, audio);
                      _context.n = 3;
                      return new Promise(function (resolve, reject) {
                        var finish = function finish(error) {
                          clearTimeout(timer);
                          audio.oncanplaythrough = audio.onerror = null;
                          if (error) reject(new Error('倒数语音加载失败，请重试。'));else resolve();
                        };
                        var timer = setTimeout(function () {
                          return finish(true);
                        }, 15000);
                        audio.oncanplaythrough = function () {
                          return finish(false);
                        };
                        audio.onerror = function () {
                          return finish(true);
                        };
                        audio.src = sound;
                        audio.load();
                      });
                    case 3:
                      return _context.a(2);
                  }
                }, _callee);
              }));
              return function (_x5, _x6) {
                return _ref3.apply(this, arguments);
              };
            }()));
          case 5:
            check(id);
            audioReady = true;
            syncCaptureButton();
          case 6:
            return _context2.a(2);
        }
      }, _callee2);
    }));
    return _prepareAudio.apply(this, arguments);
  }
  function playCountdown(count) {
    if (!config.sound.enabled || !config.sound.countdown_enabled) return;
    stopCountdownAudio();
    var audio = countdownSounds.get(count);
    if (audio) audio.play()["catch"](function (error) {
      return photoboothTools.console.log('Countdown audio: ' + error.message);
    });
  }
  function syncCaptureButton() {
    el('btnStudioDoneCapture').disabled = running || !cameraReady || !audioReady;
    el('btnStudioDoneCapture').querySelector('.wb-capture-text').textContent = running ? '正在连续拍摄…' : "\u5B8C\u6210 \xB7 \u5F00\u59CB ".concat(layout.cells.length, " \u8FDE\u62CD");
    // Freeze settings throughout a series; retry retains the selected look.
    var hasStarted = running || photos.length > 0;
    el('studioWorkbench').querySelector('.workbench-body').inert = hasStarted;
    el('studioCountdownSelect').disabled = hasStarted;
    el('btnStudioFlip').disabled = hasStarted;
  }
  function mountStudio() {
    el('workshopCapture').append(studio);
    root.classList.add('is-capturing');
    sharedStudioMounted = true;
    window.studioClassicLayout = 'single';
    photoBooth.enterStudio('classic', {
      workshop: true
    });
    el('workbenchTitle').textContent = '创意工坊拍摄工作室';
    el('workbenchSubtitle').textContent = '自然微调美颜 · 滤镜与背景 · 创意拼图';
    el('studioModePillText').textContent = "\u521B\u610F\u5DE5\u574A \xB7 ".concat(layout.name);
    el('studioPaperGuide').style.display = 'none';
    el('btnStudioBack').querySelector('span').textContent = '返回选模板';
    el('tabBtnFilters').click();
    ['workshopPreviewSlot', 'workshopCropGuide', 'workshopCountdown', 'workshopFlash'].forEach(function (id) {
      return el('studioViewport').append(el(id));
    });
    el('studioWorkbench').querySelector('.workbench-header').after(el('workshopProgress'));
    syncCaptureButton();
  }
  function restoreStudio() {
    if (!sharedStudioMounted) return;
    photoBooth.stopStudioPoseCarousel();
    captureTools.forEach(function (id) {
      return el('workshopCaptureTools').append(el(id));
    });
    studioAnchor.after(studio);
    studio.classList.remove('stage--active');
    document.body.classList.remove('mode--studio');
    root.classList.remove('is-capturing');
    el('btnStudioBack').querySelector('span').textContent = '返回首页';
    el('btnStudioDoneCapture').disabled = false;
    el('btnStudioDoneCapture').querySelector('.wb-capture-text').textContent = '完成 · 开始拍照';
    el('studioWorkbench').querySelector('.workbench-body').inert = false;
    el('studioCountdownSelect').disabled = false;
    el('btnStudioFlip').disabled = false;
    sharedStudioMounted = false;
  }
  function back() {
    if (!running || window.confirm('返回选模板会结束本轮拍摄，确定返回吗？')) selection();
  }
  var layout = catalog.layouts[0];
  var photos = [];
  var active = false;
  var running = false;
  var generation = 0;
  var request = null;
  var cameraStream = null;
  var ownsCamera = false;
  var cameraReady = false;
  var retryAction = null;
  var resultLayout = null;
  var commandCapture = function commandCapture() {
    return config.preview.mode !== 'device_cam' || config.dev.demo_images;
  };
  var wait = function wait(ms) {
    return new Promise(function (resolve) {
      return setTimeout(resolve, ms);
    });
  };
  var check = function check(id) {
    if (!active || id !== generation) throw new Error('WORKSHOP_CANCELLED');
    if (document.hidden) throw new Error('拍摄已暂停。回到页面后，点击继续拍摄。');
  };
  function paper(container, selected) {
    var shots = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var current = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;
    container.replaceChildren();
    var width = selected.width || catalog.width;
    var height = selected.height || catalog.height;
    container.style.aspectRatio = "".concat(width, " / ").concat(height);
    container.style.backgroundImage = selected.preview ? "url(\"".concat(selected.preview, "\")") : 'none';
    container.style.backgroundSize = '100% 100%';
    selected.cells.forEach(function (cellData, index) {
      var _cellData = _slicedToArray(cellData, 6),
        x = _cellData[0],
        y = _cellData[1],
        w = _cellData[2],
        h = _cellData[3],
        shape = _cellData[4],
        points = _cellData[5];
      var cell = document.createElement('span');
      cell.className = 'workshop__cell' + (index === current ? ' is-current' : '');
      Object.assign(cell.style, {
        left: "".concat(x / width * 100, "%"),
        top: "".concat(y / height * 100, "%"),
        width: "".concat(w / width * 100, "%"),
        height: "".concat(h / height * 100, "%")
      });
      if (shape === 'polygon' && Array.isArray(points)) cell.style.clipPath = "polygon(".concat(points.map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          px = _ref2[0],
          py = _ref2[1];
        return "".concat(px, "% ").concat(py, "%");
      }).join(','), ")");
      if (shots[index]) {
        var image = document.createElement('img');
        image.src = shots[index].url;
        image.alt = "\u7B2C ".concat(index + 1, " \u5F20\u7167\u7247");
        cell.append(image);
      } else {
        cell.textContent = index + 1;
        cell.setAttribute('aria-label', "\u7B2C ".concat(index + 1, " \u5F20").concat(index === current ? '，正在拍摄' : '，待拍摄'));
      }
      container.append(cell);
    });
  }
  function select(id) {
    layout = catalog.layouts.find(function (item) {
      return item.id === id;
    }) || catalog.layouts[0];
    el('workshopLayouts').querySelectorAll('button').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.layout === layout.id));
    });
    paper(el('workshopSelectedPaper'), layout);
    el('workshopSelectedName').textContent = layout.name;
    el('workshopSelectedSpec').textContent = layout.spec || '6 寸竖版 · 1200 × 1800 像素 · 300 DPI';
    el('workshopSelectedDescription').textContent = "".concat(layout.description, " \u8FDE\u7EED\u62CD ").concat(layout.cells.length, " \u5F20\u3002");
  }
  function stopCamera() {
    if (typeof photoBooth.stopFacePoseAlignmentLoop === 'function') photoBooth.stopFacePoseAlignmentLoop();
    if (previewContainer && previewOriginalParent) {
      if (previewOriginalNextSibling && previewOriginalNextSibling.parentNode === previewOriginalParent) previewOriginalParent.insertBefore(previewContainer, previewOriginalNextSibling);else previewOriginalParent.appendChild(previewContainer);
      $(previewContainer).hide();
    }
    if (ownsCamera && cameraStream) {
      cameraStream.getTracks().forEach(function (track) {
        return track.stop();
      });
      if (previewVideo) {
        previewVideo.pause();
        previewVideo.srcObject = null;
      }
    }
    cameraStream = null;
    ownsCamera = false;
    cameraReady = false;
  }
  function cancelSession() {
    generation++;
    running = false;
    if (request) request.abort();
    request = null;
    if (notice.open) notice.close();
    stopCountdownAudio();
    stopCamera();
    restoreStudio();
    photos = [];
    el('workshopCountdown').hidden = true;
    el('workshopFlash').hidden = true;
    el('workshopRetry').hidden = true;
  }
  function status(text) {
    var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    el('workshopStatus').textContent = text;
    el('workshopStatus').classList.toggle('is-error', error);
  }
  function fitViewfinder() {
    if (!sharedStudioMounted) return;
    var cell = layout.cells[Math.min(photos.length, layout.cells.length - 1)];
    var viewport = el('studioViewport');
    // The full-size live view stays identical to the studio. A frame marks
    // the center crop that this particular polygon/rectangle will use.
    var sourceWidth = previewVideo.videoWidth || 4;
    var sourceHeight = previewVideo.videoHeight || 3;
    var viewScale = Math.max(viewport.clientWidth / sourceWidth, viewport.clientHeight / sourceHeight);
    var cropScale = Math.max(cell[2] / sourceWidth, cell[3] / sourceHeight);
    Object.assign(el('workshopCropGuide').style, {
      width: "".concat(cell[2] / cropScale * viewScale, "px"),
      height: "".concat(cell[3] / cropScale * viewScale, "px")
    });
  }
  function prepareCamera(_x2) {
    return _prepareCamera.apply(this, arguments);
  }
  function _prepareCamera() {
    _prepareCamera = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(id) {
      var _navigator$mediaDevic, _cameraStream2;
      var preferred, constraints, incoming, attempt, _cameraStream;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.n) {
          case 0:
            cameraReady = false;
            syncCaptureButton();
            el('workshopCameraStatus').textContent = '正在准备摄像头，请允许浏览器使用摄像头。';
            status('正在准备摄像头…');
            // The capture API retains support for configured command cameras. This view needs a live device preview.
            if (!commandCapture()) {
              _context3.n = 1;
              break;
            }
            cameraReady = true;
            syncCaptureButton();
            el('workshopCameraStatus').textContent = config.dev.demo_images ? '当前为演示模式，准备使用演示照片。' : '已使用系统配置的相机，准备开始连拍。';
            status(config.dev.demo_images ? '演示模式已就绪。' : '每张照片前都会倒数 3、2、1。');
            return _context3.a(2);
          case 1:
            if ((_navigator$mediaDevic = navigator.mediaDevices) !== null && _navigator$mediaDevic !== void 0 && _navigator$mediaDevic.getUserMedia) {
              _context3.n = 2;
              break;
            }
            throw new Error('浏览器无法使用摄像头，请在本机 localhost 或 HTTPS 页面打开。');
          case 2:
            // Reuse the project's existing preview node and beauty pipeline so camera choice,
            // framing, mirror direction and WebGL retouching stay identical to normal capture.
            if (previewContainer && previewSlot) previewSlot.appendChild(previewContainer);
            $(previewContainer).show();
            _context3.n = 3;
            return photoboothPreview.resolveTargetDeviceId();
          case 3:
            preferred = _context3.v;
            check(id);
            constraints = preferred ? {
              deviceId: {
                exact: preferred
              }
            } : {
              facingMode: config.preview.camera_mode || 'user'
            };
            _context3.n = 4;
            return navigator.mediaDevices.getUserMedia({
              audio: false,
              video: constraints
            });
          case 4:
            incoming = _context3.v;
            if (!(!active || id !== generation)) {
              _context3.n = 5;
              break;
            }
            incoming.getTracks().forEach(function (track) {
              return track.stop();
            });
            return _context3.a(2);
          case 5:
            cameraStream = incoming;
            ownsCamera = true;
            previewVideo.srcObject = cameraStream;
            _context3.n = 6;
            return previewVideo.play();
          case 6:
            if (typeof photoBooth.startFacePoseAlignmentLoop === 'function') photoBooth.startFacePoseAlignmentLoop();
            attempt = 0;
          case 7:
            if (!((!((_cameraStream = cameraStream) !== null && _cameraStream !== void 0 && _cameraStream.active) || !previewVideo.videoWidth || previewVideo.readyState < 2) && attempt < 100)) {
              _context3.n = 10;
              break;
            }
            _context3.n = 8;
            return wait(100);
          case 8:
            check(id);
          case 9:
            attempt++;
            _context3.n = 7;
            break;
          case 10:
            check(id);
            if (!(!((_cameraStream2 = cameraStream) !== null && _cameraStream2 !== void 0 && _cameraStream2.active) || !previewVideo.videoWidth || previewVideo.readyState < 2)) {
              _context3.n = 11;
              break;
            }
            throw new Error('摄像头还没有画面，请检查连接后重试。');
          case 11:
            cameraReady = true;
            syncCaptureButton();
            fitViewfinder();
            el('workshopCameraStatus').textContent = '摄像头已就绪 · 与普通拍照使用同一套美颜与镜像设置';
            status('对准取景框，准备好后开始连拍。');
          case 12:
            return _context3.a(2);
        }
      }, _callee3);
    }));
    return _prepareCamera.apply(this, arguments);
  }
  function fail(error, retry) {
    generation++;
    running = false;
    stopCountdownAudio();
    stopCamera();
    syncCaptureButton();
    el('workshopCountdown').hidden = true;
    el('workshopFlash').hidden = true;
    if (!active || error.message === 'WORKSHOP_CANCELLED') return;
    var messages = {
      NotAllowedError: '摄像头权限未开启，请在浏览器地址栏允许使用摄像头后重试。',
      NotFoundError: '没有找到摄像头，请连接摄像头后重试。',
      NotReadableError: '摄像头被占用或无法读取，请关闭其他使用摄像头的软件后重试。',
      OverconstrainedError: '已选摄像头不可用，请在首页设置中重新选择摄像头。'
    };
    var message = messages[error.name] || error.message || '操作失败，请重试。';
    status(message, true);
    if (notice.open) notice.close();
    retryAction = retry;
    el('workshopRetry').textContent = photos.length === layout.cells.length ? '重新生成成片' : photos.length ? '继续拍摄' : '重新准备摄像头';
    el('workshopRetry').hidden = false;
  }
  function enterCapture() {
    return _enterCapture.apply(this, arguments);
  }
  function _enterCapture() {
    _enterCapture = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
      var id, _t;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.p = _context4.n) {
          case 0:
            cancelSession();
            id = generation;
            el('workshopSelection').hidden = true;
            el('workshopCapture').hidden = false;
            el('workshopBack').querySelector('span').textContent = '返回选模板';
            el('workshopShotTitle').textContent = layout.name;
            el('workshopCounter').textContent = "0 / ".concat(layout.cells.length);
            el('workshopProgressText').textContent = '拍好的照片会出现在这里';
            mountStudio();
            paper(el('workshopProgressPaper'), layout);
            fitViewfinder();
            el('workshopNoticeTitle').textContent = "\u6B64\u6B21\u62CD\u6444\u4F1A\u8FDE\u7EED\u62CD ".concat(layout.cells.length, " \u6B21");
            el('workshopNoticeText').textContent = '先调整美颜、滤镜和背景，再点击右下角开始连拍。默认每张都会语音倒数 3、2、1，拍完一张后自动开始下一张。';
            syncCaptureButton();
            notice.showModal();
            _context4.p = 1;
            _context4.n = 2;
            return Promise.all([prepareCamera(id), prepareAudio(id)]);
          case 2:
            _context4.n = 4;
            break;
          case 3:
            _context4.p = 3;
            _t = _context4.v;
            if (id === generation) fail(_t, enterCapture);
          case 4:
            return _context4.a(2);
        }
      }, _callee4, null, [[1, 3]]);
    }));
    return _enterCapture.apply(this, arguments);
  }
  function post(endpoint, data) {
    return new Promise(function (resolve, reject) {
      request = photoboothTools.ajaxWithCsrf({
        url: "".concat(environment.publicFolders.api, "/").concat(endpoint),
        method: 'POST',
        data: data,
        dataType: 'json',
        timeout: endpoint === 'createWorkshop.php' ? 600000 : 45000
      }).done(function (response) {
        if (!response || response.error) reject(new Error((response === null || response === void 0 ? void 0 : response.error) || '服务返回了无效结果，请重试。'));else resolve(response);
      }).fail(function (xhr, state) {
        var _xhr$responseJSON;
        return reject(new Error(((_xhr$responseJSON = xhr.responseJSON) === null || _xhr$responseJSON === void 0 ? void 0 : _xhr$responseJSON.error) || (state === 'abort' ? 'WORKSHOP_CANCELLED' : '连接失败，已拍照片保留，请重试。')));
      });
    });
  }
  function shoot(_x3) {
    return _shoot.apply(this, arguments);
  }
  function _shoot() {
    _shoot = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(id) {
      var _cameraStream3;
      var canvas, source, ctx, configuredFlip, flipX, flipY, response;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.n) {
          case 0:
            check(id);
            if (!commandCapture()) {
              _context5.n = 1;
              break;
            }
            return _context5.a(2, post('capture.php', {
              style: 'photo'
            }).then(function (response) {
              check(id);
              if (!response.capture_token || !response.file) throw new Error('未取得本次照片，请重试。');
              return {
                token: response.capture_token,
                url: "".concat(environment.publicFolders.tmp, "/").concat(encodeURIComponent(response.file))
              };
            }));
          case 1:
            if (!(!cameraReady || !((_cameraStream3 = cameraStream) !== null && _cameraStream3 !== void 0 && _cameraStream3.active) || previewVideo.readyState < 2 || !previewVideo.videoWidth)) {
              _context5.n = 2;
              break;
            }
            throw new Error('摄像头已断开，请重新连接后继续拍摄。');
          case 2:
            canvas = document.createElement('canvas');
            source = beautyCanvas && beautyCanvas.style.display !== 'none' && beautyCanvas.width > 0 ? beautyCanvas : previewVideo;
            canvas.width = source.videoWidth || source.width;
            canvas.height = source.videoHeight || source.height;
            ctx = canvas.getContext('2d'); // CSS preview filters are not included by drawImage; bake the same
            // filter into each photo. Compensate for capture.php's configured flip.
            ctx.filter = getComputedStyle(source).filter || 'none';
            configuredFlip = config.preview.flip || 'off';
            flipX = previewVideo.classList.contains('flip-horizontal') !== ['flip-horizontal', 'flip-both'].includes(configuredFlip);
            flipY = previewVideo.classList.contains('flip-vertical') !== ['flip-vertical', 'flip-both'].includes(configuredFlip);
            ctx.translate(flipX ? canvas.width : 0, flipY ? canvas.height : 0);
            ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
            ctx.drawImage(source, 0, 0);
            _context5.n = 3;
            return post('capture.php', {
              style: 'photo',
              canvasimg: canvas.toDataURL('image/jpeg', 0.96)
            });
          case 3:
            response = _context5.v;
            check(id);
            if (!(!response.capture_token || !response.file)) {
              _context5.n = 4;
              break;
            }
            throw new Error('未取得本次照片，请重试。');
          case 4:
            return _context5.a(2, {
              token: response.capture_token,
              url: "".concat(environment.publicFolders.tmp, "/").concat(encodeURIComponent(response.file))
            });
        }
      }, _callee5);
    }));
    return _shoot.apply(this, arguments);
  }
  function save(_x4) {
    return _save.apply(this, arguments);
  }
  function _save() {
    _save = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(id) {
      var response, completed;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            status('全部拍好了，正在拼成一张完整照片…');
            el('workshopShotTitle').textContent = '正在生成成片';
            _context6.n = 1;
            return post('createWorkshop.php', {
              layout: layout.id,
              tokens: photos.map(function (photo) {
                return photo.token;
              }),
              template: ''
            });
          case 1:
            response = _context6.v;
            check(id);
            if (!(!response.success || !response.file)) {
              _context6.n = 2;
              break;
            }
            throw new Error('成片未保存成功，请重试。');
          case 2:
            completed = layout;
            close(false);
            resultLayout = completed;
            photoBooth.setPhotoboothMode('workshop');
            window.sessionPhotoboothMode = 'workshop';
            window.studioClassicLayout = 'single';
            window.burstLayout = '';
            window.burstModeActive = false;
            window.burstActive = false;
            photoBooth.renderPic(response.file, response.images, null, null, 'plain');
          case 3:
            return _context6.a(2);
        }
      }, _callee6);
    }));
    return _save.apply(this, arguments);
  }
  function run() {
    return _run.apply(this, arguments);
  }
  function _run() {
    _run = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
      var _window$selectedClass, _window$selectedClass2, id, _cameraStream4, number, count, captured, _t2;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.p = _context7.n) {
          case 0:
            if (!(running || !active)) {
              _context7.n = 1;
              break;
            }
            return _context7.a(2);
          case 1:
            if (!photos.length) {
              countdownSeconds = Math.max(1, Math.min(10, parseInt(el('studioCountdownSelect').value, 10) || 3));
              backgroundTemplate = '';
            }
            running = true;
            syncCaptureButton();
            photoBooth.stopStudioPoseCarousel();
            id = generation;
            if (notice.open) notice.close();
            el('workshopRetry').hidden = true;
            _context7.p = 2;
            if (audioReady) {
              _context7.n = 3;
              break;
            }
            _context7.n = 3;
            return prepareAudio(id);
          case 3:
            if (!(photos.length < layout.cells.length && (!cameraReady || !((_cameraStream4 = cameraStream) !== null && _cameraStream4 !== void 0 && _cameraStream4.active)))) {
              _context7.n = 4;
              break;
            }
            stopCamera();
            _context7.n = 4;
            return prepareCamera(id);
          case 4:
            if (!(photos.length < layout.cells.length)) {
              _context7.n = 11;
              break;
            }
            check(id);
            number = photos.length + 1;
            el('workshopShotTitle').textContent = "\u7B2C ".concat(number, " \u5F20\uFF0C\u5171 ").concat(layout.cells.length, " \u5F20");
            paper(el('workshopProgressPaper'), layout, photos, photos.length);
            fitViewfinder();
            status("\u770B\u955C\u5934\uFF0C\u7B2C ".concat(number, " \u5F20\u9A6C\u4E0A\u5F00\u59CB\u3002"));
            count = countdownSeconds;
          case 5:
            if (!(count >= 1)) {
              _context7.n = 7;
              break;
            }
            check(id);
            el('workshopCountdown').textContent = count;
            el('workshopCountdown').hidden = false;
            playCountdown(count);
            _context7.n = 6;
            return wait(1000);
          case 6:
            count--;
            _context7.n = 5;
            break;
          case 7:
            check(id);
            el('workshopCountdown').hidden = true;
            stopCountdownAudio();
            status("\u6B63\u5728\u4FDD\u5B58\u7B2C ".concat(number, " \u5F20\uFF0C\u8BF7\u7A0D\u5019\u2026"));
            _context7.n = 8;
            return shoot(id);
          case 8:
            captured = _context7.v;
            photos.push(captured);
            el('workshopFlash').hidden = false;
            paper(el('workshopProgressPaper'), layout, photos);
            el('workshopCounter').textContent = "".concat(photos.length, " / ").concat(layout.cells.length);
            el('workshopProgressText').textContent = "\u5DF2\u5B8C\u6210 ".concat(photos.length, " \u5F20\uFF0C\u8FD8\u5269 ").concat(layout.cells.length - photos.length, " \u5F20");
            status(photos.length < layout.cells.length ? "\u7B2C ".concat(number, " \u5F20\u62CD\u597D\u4E86\uFF01\u6362\u4E2A\u59FF\u52BF\uFF0C\u4E0B\u4E00\u5F20\u5373\u5C06\u5F00\u59CB\u3002") : '全部拍好了！');
            _context7.n = 9;
            return wait(160);
          case 9:
            check(id);
            el('workshopFlash').hidden = true;
            if (!(photos.length < layout.cells.length)) {
              _context7.n = 10;
              break;
            }
            _context7.n = 10;
            return wait(700);
          case 10:
            _context7.n = 4;
            break;
          case 11:
            check(id);
            _context7.n = 12;
            return save(id);
          case 12:
            _context7.n = 14;
            break;
          case 13:
            _context7.p = 13;
            _t2 = _context7.v;
            if (id === generation) fail(_t2, run);
          case 14:
            _context7.p = 14;
            if (id === generation) {
              running = false;
              if (active) syncCaptureButton();
            }
            return _context7.f(14);
          case 15:
            return _context7.a(2);
        }
      }, _callee7, null, [[2, 13, 14, 15]]);
    }));
    return _run.apply(this, arguments);
  }
  function selection() {
    cancelSession();
    el('workshopSelection').hidden = false;
    el('workshopCapture').hidden = true;
    el('workshopBack').querySelector('span').textContent = '返回首页';
    select(layout.id);
    el('workshopTitle').focus();
  }
  function open() {
    photoBooth.reset();
    active = true;
    resultLayout = null;
    document.querySelectorAll('.stage--active').forEach(function (stage) {
      return stage.classList.remove('stage--active');
    });
    document.body.classList.add('mode--workshop');
    root.hidden = false;
    root.scrollTop = 0;
    selection();
  }
  function close() {
    var home = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    active = false;
    cancelSession();
    root.hidden = true;
    document.body.classList.remove('mode--workshop');
    if (home) {
      resultLayout = null;
      photoBooth.init();
      el('btnWorkshopStart').focus();
    }
  }
  catalog.layouts.forEach(function (item) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'workshop__layout';
    button.dataset.layout = item.id;
    button.setAttribute('aria-label', "".concat(item.name, "\uFF0C\u8FDE\u7EED\u62CD ").concat(item.cells.length, " \u5F20"));
    var preview = document.createElement('div');
    preview.className = 'workshop__paper';
    preview.setAttribute('aria-hidden', 'true');
    paper(preview, item);
    var name = document.createElement('strong');
    name.textContent = item.name;
    var count = document.createElement('small');
    count.textContent = "\u8FDE\u7EED\u62CD ".concat(item.cells.length, " \u5F20");
    button.append(preview, name, count);
    button.addEventListener('click', function () {
      return select(item.id);
    });
    el('workshopLayouts').append(button);
  });
  el('cardModeWorkshop').addEventListener('click', open);
  var btnWorkshop = document.getElementById('btnWorkshopStart');
  if (btnWorkshop) btnWorkshop.addEventListener('click', function (e) { e.stopPropagation(); open(); });
  el('cardModeWorkshop').addEventListener('keydown', function (event) {
    if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      open();
    }
  });
  el('workshopChoose').addEventListener('click', enterCapture);
  var directShoot = document.getElementById('workshopDirectShoot');
  if (directShoot) directShoot.addEventListener('click', function () { notice.close(); run(); });
  el('workshopStart').addEventListener('click', function () {
    notice.close();
    el('studioSmoothSlider').focus();
  });
  el('workshopChangeLayout').addEventListener('click', back);
  el('workshopRetry').addEventListener('click', function () {
    if (!running && retryAction) retryAction();
  });
  el('workshopNoticeBack').addEventListener('click', selection);
  notice.addEventListener('cancel', function (event) {
    event.preventDefault();
    selection();
  });
  el('workshopBack').addEventListener('click', function () {
    if (el('workshopCapture').hidden) close();else back();
  });
  // Any tab switch invalidates the countdown. Returning requires a deliberate resume.
  document.addEventListener('visibilitychange', function () {
    if (active && running && document.hidden) {
      generation++;
      if (request) request.abort();
      request = null;
      fail(new Error('拍摄已暂停。回到页面后，点击继续拍摄。'), run);
    }
  });
  window.addEventListener('resize', fitViewfinder);
  window.addEventListener('pagehide', function () {
    active = false;
    cancelSession();
  });
  // Update labels after the existing editor has loaded the generated photo.
  var resultStage = document.querySelector('.stage--result');
  if (resultStage) new MutationObserver(function () {
    if (resultLayout && resultStage.classList.contains('stage--active')) {
      el('lblResultPaperTitle').textContent = "\u521B\u610F\u5DE5\u574A \xB7 ".concat(resultLayout.name);
      el('lblResultPaperDetail').textContent = resultLayout.spec || '6 寸竖版 · 1200 × 1800 像素 · 300 DPI';
      var customBgBtn = document.getElementById('btnClassicCustomBg');
      if (customBgBtn) customBgBtn.style.setProperty('display', 'none', 'important');
      var resizerBgBtn = document.getElementById('btnResizerChangeBg');
      if (resizerBgBtn) resizerBgBtn.style.setProperty('display', 'none', 'important');
    }
  }).observe(resultStage, {
    attributes: true,
    attributeFilter: ['class']
  });
  window.creativeWorkshop = {
    open: open,
    close: close,
    back: back,
    start: run,
    get active() {
      return active;
    },
    get resultLayout() {
      return resultLayout;
    },
    reset: function reset() {
      if (active) close(false);
      resultLayout = null;
    }
  };
})();