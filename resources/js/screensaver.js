"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * Screensaver module for Photobooth.
 * Exposes createScreensaver(deps) which returns the screensaver API.
 */
(function (window, $) {
  window.createScreensaver = function createScreensaver(deps) {
    var config = deps.config,
      environment = deps.environment,
      startPage = deps.startPage,
      overlay = deps.overlay,
      videoEl = deps.videoEl,
      imageEl = deps.imageEl,
      textTop = deps.textTop,
      textCenter = deps.textCenter,
      textBottom = deps.textBottom,
      screensaverEnabled = deps.screensaverEnabled,
      screensaverMode = deps.screensaverMode,
      screensaverTimeoutMs = deps.screensaverTimeoutMs,
      screensaverSwitchMs = deps.screensaverSwitchMs,
      urlSafe = deps.urlSafe,
      galleryFallbackSource = deps.galleryFallbackSource,
      photoboothTools = deps.photoboothTools;
    var fallbackSource = galleryFallbackSource || function () {
      return config.screensaver.image_source || '';
    };
    var screensaverTimeout;
    var screensaverSwitchTimeout;
    var screensaverFlip = false;
    var screensaverLastGallerySource = '';
    var generation = 0;
    var playlistRequest;
    var previousFocus;
    var activityBound = false;
    var suppressUntil = 0;
    var wakingKeys = new Set();
    var wakingPointer = false;
    var screensaverClockInterval = null;
    var viewport = $('<div class="screensaver-overlay__viewport" aria-hidden="true"></div>').hide().appendTo(overlay);
    // Keep the full-screen layer outside the start stage's stacking context.
    overlay.appendTo(document.body);
    var api = {};
    var reducedMotion = function reducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };
    var kenBurns = function kenBurns(photo, durationMs) {
      if (!photo || reducedMotion()) return;
      photo.animate([{
        transform: 'scale(1)'
      }, {
        transform: 'scale(1.07)'
      }], {
        duration: Math.max(2000, durationMs),
        easing: 'ease-out',
        fill: 'forwards'
      });
    };
    var startClock = function startClock() {
      var clockTime = overlay.find('.screensaver-overlay__clock-time');
      if (!clockTime.length) return;
      var tick = function tick() {
        var now = new Date();
        clockTime.text(String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'));
      };
      tick();
      clearInterval(screensaverClockInterval);
      screensaverClockInterval = setInterval(tick, 1000);
    };
    var decorateWakeText = function decorateWakeText() {
      [textTop, textCenter, textBottom].forEach(function ($slot) {
        if ($slot.css('display') !== 'none' && $.trim($slot.text()) && !$slot.find('.screensaver-overlay__wake-icon').length) {
          $slot.prepend($('<i class="fa fa-hand-pointer screensaver-overlay__wake-icon" aria-hidden="true"></i>'));
        }
      });
    };
    var canShow = function canShow() {
      return startPage.hasClass('stage--active') && !document.hidden && !$('#quickSettingsModal:visible, #payGateModal:visible, #burstWorkbenchModal:visible, .pswp--open, .gallery--open, .sidenav--open').length;
    };
    var activate = function activate() {
      if (!overlay.hasClass('screensaver-overlay--active')) previousFocus = document.activeElement;
      startPage.addClass('stage--screensaver');
      overlay.addClass('screensaver-overlay--active').attr('aria-hidden', 'false').css('display', 'flex');
      overlay.get(0).focus({
        preventScroll: true
      });
    };
    var loadPhoto = function loadPhoto(url) {
      return new Promise(function (resolve) {
        var photo = new Image();
        photo.alt = '';
        photo.className = 'screensaver-overlay__slide';
        var timeout;
        var done = function done(result) {
          clearTimeout(timeout);
          photo.onload = photo.onerror = null;
          resolve(result);
        };
        photo.onload = function () {
          var frame = document.createElement('div');
          frame.className = 'screensaver-overlay__frame';
          frame.dataset.src = photo.src;
          var backdrop = document.createElement('div');
          backdrop.className = 'screensaver-overlay__backdrop';
          backdrop.style.backgroundImage = 'url("' + photo.src + '")';
          frame.append(backdrop, photo);
          done(frame);
        };
        photo.onerror = function () {
          return done(null);
        };
        timeout = setTimeout(function () {
          return done(null);
        }, 8000);
        photo.src = url;
      });
    };
    var showFolder = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(requestId, force) {
        var controller, timeout, photos, response, result, index, current, dotsBox, setActiveDot, nextPhoto, _step, _t;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.p = _context3.n) {
            case 0:
              playlistRequest = new AbortController();
              controller = playlistRequest;
              timeout = setTimeout(function () {
                return controller.abort();
              }, 8000);
              _context3.p = 1;
              _context3.n = 2;
              return fetch(environment.publicFolders.api + '/screensaverMedia.php', {
                signal: controller.signal,
                cache: 'no-store'
              });
            case 2:
              response = _context3.v;
              if (response.ok) {
                _context3.n = 3;
                break;
              }
              throw new Error('Screensaver playlist unavailable');
            case 3:
              _context3.n = 4;
              return response.json();
            case 4:
              result = _context3.v;
              photos = Array.isArray(result.images) ? result.images : [];
              _context3.n = 6;
              break;
            case 5:
              _context3.p = 5;
              _t = _context3.v;
              photoboothTools.console.logDev('Screensaver playlist: ' + _t.message);
              photos = [];
            case 6:
              _context3.p = 6;
              clearTimeout(timeout);
              return _context3.f(6);
            case 7:
              if (!(requestId !== generation)) {
                _context3.n = 8;
                break;
              }
              return _context3.a(2);
            case 8:
              index = 0;
              current = null;
              dotsBox = overlay.find('.screensaver-overlay__dots').empty();
              if (photos.length > 1) {
                photos.forEach(function () {
                  return dotsBox.append($('<span class="screensaver-overlay__dot"></span>'));
                });
              }
              setActiveDot = function setActiveDot(activeIndex) {
                dotsBox.children().each(function (dotIndex) {
                  $(this).toggleClass('screensaver-overlay__dot--active', dotIndex === activeIndex);
                });
              }; // Bad/deleted media is skipped without replacing a good frame with black.
              nextPhoto = /*#__PURE__*/function () {
                var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
                  var photo;
                  return _regenerator().w(function (_context) {
                    while (1) switch (_context.n) {
                      case 0:
                        if (!(photos.length && requestId === generation)) {
                          _context.n = 4;
                          break;
                        }
                        index %= photos.length;
                        _context.n = 1;
                        return loadPhoto(photos[index].url);
                      case 1:
                        photo = _context.v;
                        if (!(requestId !== generation)) {
                          _context.n = 2;
                          break;
                        }
                        return _context.a(2, null);
                      case 2:
                        if (!photo) {
                          _context.n = 3;
                          break;
                        }
                        index = (index + 1) % photos.length;
                        return _context.a(2, photo);
                      case 3:
                        photos.splice(index, 1);
                        _context.n = 0;
                        break;
                      case 4:
                        return _context.a(2, null);
                    }
                  }, _callee);
                }));
                return function nextPhoto() {
                  return _ref2.apply(this, arguments);
                };
              }();
              _context3.n = 9;
              return nextPhoto();
            case 9:
              current = _context3.v;
              if (!(requestId !== generation)) {
                _context3.n = 10;
                break;
              }
              return _context3.a(2);
            case 10:
              overlay.removeAttr('aria-busy');
              if (canShow()) {
                _context3.n = 11;
                break;
              }
              api.resetTimer();
              return _context3.a(2);
            case 11:
              if (current) {
                _context3.n = 12;
                break;
              }
              if (force) {
                overlay.addClass('screensaver-overlay--folder');
                textCenter.text(photoboothTools.getTranslation('screensaver_empty')).show();
                textBottom.text(photoboothTools.getTranslation('screensaver_wake')).show();
                activate();
              } else {
                api.resetTimer();
              }
              return _context3.a(2);
            case 12:
              overlay.addClass('screensaver-overlay--folder').css('background-image', 'none');
              videoEl.hide();
              imageEl.hide();
              viewport.empty().append(current).show();
              api.toggleGalleryText();
              if (!config.screensaver.text) {
                textBottom.text(photoboothTools.getTranslation('screensaver_wake')).show();
              }
              activate();
              setActiveDot((index + photos.length - 1) % photos.length);
              decorateWakeText();
              startClock();
              kenBurns(current.querySelector('.screensaver-overlay__slide'), screensaverSwitchMs);
              _step = /*#__PURE__*/function () {
                var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
                  var next, duration, options, incoming, outgoing;
                  return _regenerator().w(function (_context2) {
                    while (1) switch (_context2.n) {
                      case 0:
                        if (!(requestId !== generation)) {
                          _context2.n = 1;
                          break;
                        }
                        return _context2.a(2);
                      case 1:
                        if (canShow()) {
                          _context2.n = 2;
                          break;
                        }
                        api.resetTimer();
                        return _context2.a(2);
                      case 2:
                        if (!(photos.length > 1)) {
                          _context2.n = 8;
                          break;
                        }
                        _context2.n = 3;
                        return nextPhoto();
                      case 3:
                        next = _context2.v;
                        if (!(requestId !== generation)) {
                          _context2.n = 4;
                          break;
                        }
                        return _context2.a(2);
                      case 4:
                        if (canShow()) {
                          _context2.n = 5;
                          break;
                        }
                        api.resetTimer();
                        return _context2.a(2);
                      case 5:
                        if (!(next && next.dataset.src !== current.dataset.src)) {
                          _context2.n = 8;
                          break;
                        }
                        viewport.append(next);
                        duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700;
                        options = {
                          duration: duration,
                          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
                        };
                        incoming = next.animate([{
                          transform: 'translateX(100%)'
                        }, {
                          transform: 'translateX(0)'
                        }], options);
                        outgoing = current.animate([{
                          transform: 'translateX(0)'
                        }, {
                          transform: 'translateX(-100%)'
                        }], options);
                        _context2.n = 6;
                        return Promise.all([incoming.finished, outgoing.finished])["catch"](function () {});
                      case 6:
                        if (!(requestId !== generation)) {
                          _context2.n = 7;
                          break;
                        }
                        return _context2.a(2);
                      case 7:
                        current.remove();
                        current = next;
                        setActiveDot((index + photos.length - 1) % photos.length);
                        kenBurns(next.querySelector('.screensaver-overlay__slide'), screensaverSwitchMs);
                      case 8:
                        screensaverSwitchTimeout = setTimeout(_step, Math.max(1000, screensaverSwitchMs));
                      case 9:
                        return _context2.a(2);
                    }
                  }, _callee2);
                }));
                return function step() {
                  return _ref3.apply(this, arguments);
                };
              }();
              screensaverSwitchTimeout = setTimeout(_step, Math.max(1000, screensaverSwitchMs));
            case 13:
              return _context3.a(2);
          }
        }, _callee3, null, [[1, 5, 6, 7]]);
      }));
      return function showFolder(_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }();
    api.resolveSource = function resolveSource() {
      var base = environment.publicFolders.api;
      switch (screensaverMode) {
        case 'video':
          return config.screensaver.video_source;
        case 'image':
          return config.screensaver.image_source;
        case 'folder':
          return base + '/randomImg.php?dir=' + encodeURIComponent('screensavers') + '&t=' + Date.now();
        case 'gallery':
          {
            var anchors = $('#galimages a');
            if (anchors.length) {
              var randomIndex = Math.floor(Math.random() * anchors.length);
              return $(anchors[randomIndex]).attr('href');
            }
            return base + '/randomImg.php?dir=' + 'data/images' + '&t=' + Date.now();
          }
        default:
          return '';
      }
    };
    api.hide = function hide() {
      generation++;
      if (playlistRequest) playlistRequest.abort();
      var wasActive = overlay.hasClass('screensaver-overlay--active');
      clearTimeout(screensaverTimeout);
      if (!overlay.length) {
        return;
      }
      overlay.removeClass('screensaver-overlay--active');
      overlay.removeClass('screensaver-overlay--folder').attr('aria-hidden', 'true');
      overlay.removeAttr('aria-busy');
      overlay.css('display', 'none');
      startPage.removeClass('stage--screensaver');
      clearInterval(screensaverSwitchTimeout);
      viewport.find('.screensaver-overlay__frame, .screensaver-overlay__slide').each(function () {
        this.getAnimations().forEach(function (animation) {
          return animation.cancel();
        });
      });
      viewport.empty().hide();
      overlay.find('.screensaver-overlay__dots').empty();
      clearInterval(screensaverClockInterval);
      screensaverClockInterval = null;
      if (wasActive && previousFocus && previousFocus.isConnected) previousFocus.focus({
        preventScroll: true
      });
      if (videoEl.length) {
        var vid = videoEl.get(0);
        vid.pause();
        vid.currentTime = 0;
        videoEl.attr('src', '');
      }
      imageEl.hide().attr('src', '');
      textTop.text('').hide();
      textCenter.text('').hide();
      textBottom.text('').hide();
    };
    api.toggleGalleryText = function toggleGalleryText() {
      var screensaverText = config.screensaver.text;
      var baseColor = config.screensaver.text_backdrop_color || '#202020';
      var alpha = parseFloat(config.screensaver.text_backdrop_opacity);
      var safeAlpha = Number.isFinite(alpha) ? Math.min(Math.max(alpha, 0), 1) : 0.55;
      var hex = baseColor.replace('#', '');
      var fullHex = hex.length === 3 ? hex.split('').map(function (c) {
        return c + c;
      }).join('') : hex;
      var r = parseInt(fullHex.substring(0, 2), 16) || 0;
      var g = parseInt(fullHex.substring(2, 4), 16) || 0;
      var b = parseInt(fullHex.substring(4, 6), 16) || 0;
      var screensaverBackdrop = "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(safeAlpha, ")");
      var buildEventText = function buildEventText() {
        var left = config.event.textLeft || '';
        var right = config.event.textRight || '';
        var symbolClass = config.event.symbol || '';
        var symbol = symbolClass ? "<i class=\"fa ".concat(symbolClass, "\" aria-hidden=\"true\"></i>") : '';
        return [left, symbol, right].filter(Boolean).join(' ').trim();
      };
      var eventText = buildEventText();
      var showEvent = screensaverMode === 'gallery';
      var hasScreensaver = !!screensaverText;
      var hasEvent = showEvent && !!eventText;
      var position = config.screensaver.text_position || 'center';
      var showTop = position === 'top-center';
      var showCenter = position === 'center';
      var showBottom = position === 'bottom-center';
      var resetSlots = function resetSlots() {
        textTop.removeClass('screensaver-overlay__text--center').hide().text('');
        textCenter.hide().text('');
        textBottom.hide().text('');
      };
      var applyContent = function applyContent($el, content) {
        var isHtml = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        if (isHtml) {
          $el.html(content);
        } else {
          $el.text(content);
        }
      };
      var setSlot = function setSlot(content) {
        var isHtml = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        resetSlots();
        [textTop, textCenter, textBottom].forEach(function ($el) {
          $el.css('background', screensaverBackdrop);
        });
        if (showCenter) {
          applyContent(textCenter, content, isHtml);
          textCenter.show();
          return;
        }
        if (showTop) {
          applyContent(textTop, content, isHtml);
          textTop.show();
        }
        if (showBottom) {
          applyContent(textBottom, content, isHtml);
          textBottom.show();
        }
      };
      if (hasScreensaver && hasEvent) {
        if (screensaverFlip) {
          setSlot(screensaverText);
          if (showTop && showBottom) {
            applyContent(textBottom, eventText, true);
            textBottom.show();
          } else if (showCenter || showTop) {
            applyContent(textBottom, eventText, true);
            textBottom.show();
          } else {
            applyContent(textTop, eventText, true);
            textTop.show();
          }
        } else {
          setSlot(eventText, true);
          if (showTop && showBottom) {
            applyContent(textBottom, screensaverText);
            textBottom.show();
          } else if (showCenter || showTop) {
            applyContent(textBottom, screensaverText);
            textBottom.show();
          } else {
            applyContent(textTop, screensaverText);
            textTop.show();
          }
        }
      } else {
        var singleText = hasScreensaver ? screensaverText : hasEvent ? eventText : '';
        if (singleText) {
          setSlot(singleText, hasEvent);
        } else {
          resetSlots();
        }
      }
      screensaverFlip = !screensaverFlip;
    };
    api.stepScreensaver = function stepScreensaver() {
      var mode = overlay.data('mode') || screensaverMode;
      photoboothTools.console.logDev('Screensaver: step in mode \'' + mode + '\'');
      var nextSource = api.resolveSource();
      if (!nextSource && mode === 'gallery') {
        nextSource = fallbackSource();
      }
      if (mode === 'gallery' || mode === 'folder') {
        var guard = 5;
        while (nextSource === screensaverLastGallerySource && guard > 0) {
          nextSource = api.resolveSource();
          guard--;
        }
        screensaverLastGallerySource = nextSource;
      }
      photoboothTools.console.logDev('Screensaver: next source \'' + nextSource + '\'');
      if (nextSource) {
        if (mode === 'folder') {
          overlay.css('background-image', nextSource ? "url(".concat(urlSafe(nextSource), ")") : 'none');
        } else if (mode === 'gallery') {
          imageEl.one('error', function () {
            var fallback = fallbackSource();
            if (fallback && fallback !== nextSource) {
              screensaverLastGallerySource = fallback;
              $(this).attr('src', urlSafe(fallback));
            }
          }).attr('src', urlSafe(nextSource)).show();
        }
      }
      if (mode === 'gallery') {
        api.toggleGalleryText();
      }
    };
    api.show = function show() {
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      if (!force && !screensaverEnabled || !overlay.length) {
        return;
      }
      var mode = screensaverMode;
      if (!canShow()) {
        api.resetTimer();
        return;
      }
      api.hide();
      var requestId = generation;
      if (mode === 'folder') {
        if (force) {
          // Manual entry owns the screen immediately. Otherwise a
          // mousemove during the first image fetch cancels entry.
          overlay.addClass('screensaver-overlay--folder').attr('aria-busy', 'true').css('background-image', 'none');
          videoEl.hide();
          imageEl.hide();
          textCenter.text('正在加载屏保…').show();
          textBottom.text(photoboothTools.getTranslation('screensaver_wake')).show();
          activate();
          startClock();
        }
        showFolder(requestId, force);
        return;
      }
      if (mode === 'gallery') {
        overlay.addClass('screensaver-overlay--gallery');
        var width = config.screensaver.gallery_width || 800;
        imageEl.css('width', width + 'px');
      } else {
        overlay.removeClass('screensaver-overlay--gallery');
        imageEl.css('width', '');
      }
      var source = api.resolveSource();
      var finalSource = source || fallbackSource();
      if (!finalSource) {
        api.resetTimer();
        return;
      }
      if (mode === 'gallery') {
        screensaverLastGallerySource = finalSource;
      }
      if (mode === 'video') {
        overlay.css('background-image', 'none');
        videoEl.attr('src', urlSafe(finalSource));
        videoEl.show();
        var vid = videoEl.get(0);
        vid.play()["catch"](function (err) {
          photoboothTools.console.logDev('Idle video play failed: ' + err);
        });
        imageEl.hide();
        api.toggleGalleryText();
      } else if (mode === 'gallery') {
        videoEl.hide();
        overlay.css('background-image', 'none');
        imageEl.one('error', function () {
          var fallback = fallbackSource();
          if (fallback && fallback !== finalSource) {
            screensaverLastGallerySource = fallback;
            $(this).attr('src', urlSafe(fallback));
          }
        }).attr('src', urlSafe(finalSource)).show();
        api.toggleGalleryText();
      } else {
        videoEl.hide();
        imageEl.hide();
        api.toggleGalleryText();
        overlay.css('background-image', finalSource ? "url(".concat(urlSafe(finalSource), ")") : 'none');
        overlay.css('background-size', 'cover');
      }
      activate();
      clearInterval(screensaverSwitchTimeout);
      if ((mode === 'folder' || mode === 'gallery') && screensaverSwitchMs > 0) {
        screensaverSwitchTimeout = setInterval(function nextIdleFrame() {
          api.stepScreensaver();
        }, screensaverSwitchMs);
      }
    };
    api.resetTimer = function resetTimer() {
      api.hide();
      if (!screensaverEnabled) {
        return;
      }
      clearTimeout(screensaverTimeout);
      screensaverTimeout = setTimeout(api.show, screensaverTimeoutMs);
    };
    api.bindActivity = function bindActivity() {
      if (activityBound) return;
      activityBound = true;
      var wake = function wake(event) {
        var active = overlay.hasClass('screensaver-overlay--active');
        var wakingGesture = wakingPointer || wakingKeys.has(event.code);
        if (active || wakingGesture || Date.now() < suppressUntil) {
          // Consume the whole waking gesture, including its synthetic click.
          if (event.cancelable) event.preventDefault();
          event.stopImmediatePropagation();
          if (event.type === 'keydown') wakingKeys.add(event.code);
          if (event.type === 'keyup') wakingKeys["delete"](event.code);
          if (['pointerdown', 'mousedown', 'touchstart'].includes(event.type)) wakingPointer = true;
          if (['pointerup', 'mouseup', 'touchend', 'pointercancel', 'touchcancel', 'click'].includes(event.type)) wakingPointer = false;
          suppressUntil = Date.now() + 600;
          if (active) {
            api.resetTimer();
          }
          return;
        }
        if (screensaverEnabled) api.resetTimer();
      };
      ['pointerdown', 'pointerup', 'pointercancel', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'touchcancel', 'click', 'keydown', 'keyup'].forEach(function (name) {
        document.addEventListener(name, wake, {
          capture: true,
          passive: false
        });
      });
      document.addEventListener('mousemove', function () {
        if (screensaverEnabled && !overlay.hasClass('screensaver-overlay--active')) api.resetTimer();
      }, {
        passive: true
      });
      document.addEventListener('visibilitychange', function () {
        wakingPointer = false;
        wakingKeys.clear();
        if (document.hidden) api.hide();else api.resetTimer();
      });
      window.addEventListener('blur', function () {
        wakingPointer = false;
        wakingKeys.clear();
      });
    };
    return api;
  };
})(window, jQuery);