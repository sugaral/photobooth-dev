"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* exported initPhotoSwipeFromDOM */
/* globals photoBooth photoboothTools rotaryController remoteBuzzerClient csrf */

// eslint-disable-next-line no-unused-vars
var globalGalleryHandle;

// eslint-disable-next-line no-unused-vars
function initPhotoSwipeFromDOM(gallerySelector) {
  var ssTimeOut,
    ssRunning = false;
  var ssDelay = config.gallery.pictureTime,
    ssButtonClass = '.pswp__button--playpause',
    actionImageClick = config.pswp.imageClickAction === 'none' ? false : config.pswp.imageClickAction,
    actionBgClick = config.pswp.bgClickAction === 'none' ? false : config.pswp.bgClickAction,
    actionTap = config.pswp.tapAction === 'none' ? false : config.pswp.tapAction,
    actionDoubleTap = config.pswp.doubleTapAction === 'none' ? false : config.pswp.doubleTapAction;
  var openPhotoSwipe = function openPhotoSwipe(selector, galIndex) {
    var gallery = new PhotoSwipeLightbox({
      mainClass: 'rotarygroup',
      gallery: selector,
      children: 'a',
      bgOpacity: config.pswp.bgOpacity,
      loop: config.pswp.loop,
      pinchToClose: config.pswp.pinchToClose,
      closeOnVerticalDrag: config.pswp.closeOnVerticalDrag,
      clickToCloseNonZoomable: config.pswp.clickToCloseNonZoomable,
      counter: config.pswp.counterEl,
      zoom: config.pswp.zoomEl,
      imageClickAction: actionImageClick,
      bgClickAction: actionBgClick,
      tapAction: actionTap,
      doubleTapAction: actionDoubleTap,
      wheelToZoom: true,
      //padding: {top: 20, bottom: 40, left: 100, right: 100},
      escKey: true,
      arrowKeys: true,
      returnFocus: true,
      initialZoomLevel: 'fit',
      maxZoomLevel: 1,
      // dynamic import is not supported in UMD version
      pswpModule: PhotoSwipe
    });

    // Slideshow not running from the start
    setSlideshowState(ssButtonClass, false);
    gallery.on('change', function () {
      photoboothTools.modal.close();
      if (ssRunning) {
        gotoNextSlide();
      }
    });
    gallery.on('close', function () {
      photoboothTools.modal.close();
      if (ssRunning) {
        setSlideshowState(ssButtonClass, false);
        $('.pswp__button--playpause i:first').toggleClass(config.icons.slideshow_toggle);
      }
      if (typeof rotaryController !== 'undefined') {
        setTimeout(function () {
          rotaryController.focusSet('#gallery');
        }, 300);
      }
    });
    gallery.on('uiRegister', function () {
      // counter - 5, zoom button - 10, info - 15, close - 20.
      var orderNumber = [7, 8, 9, 11, 12, 13, 14];
      if (config.print.from_gallery && config.print.limit > 0) {
        gallery.pswp.ui.registerElement({
          name: 'print-counter',
          order: 4,
          // eslint-disable-next-line no-unused-vars
          onInit: function onInit(el, pswp) {
            $.ajax({
              method: 'GET',
              url: 'api/printDB.php',
              data: _defineProperty({
                action: 'getPrintCount'
              }, csrf.key, csrf.token),
              success: function success(data) {
                el.innerText = photoboothTools.getTranslation('printed') + ' ' + data.count;
                if (data.locked) {
                  $('.pswp__print-counter').addClass('error');
                  $('.pswp__button--print').addClass('error');
                }
              },
              // eslint-disable-next-line no-unused-vars
              error: function error(jqXHR, textStatus) {
                $('.pswp__print-counter').addClass('warning');
                el.innerText = photoboothTools.getTranslation('printed') + ' unknown';
                $('.pswp__button--print').addClass('warning');
              }
            });
          }
        });
      }
      if (config.pswp.caption) {
        gallery.pswp.ui.registerElement({
          name: 'custom-caption',
          order: 6,
          isButton: false,
          appendTo: 'root',
          html: 'Caption text',
          // eslint-disable-next-line no-unused-vars
          onInit: function onInit(el, pswp) {
            gallery.pswp.on('change', function () {
              var currSlideElement = gallery.pswp.currSlide.data.element;
              var captionHTML = '';
              if (currSlideElement) {
                captionHTML = currSlideElement.querySelector('img').getAttribute('alt');
              }
              el.innerHTML = captionHTML || '';
            });
          }
        });
      }
      if (config.mail.enabled) {
        gallery.pswp.ui.registerElement({
          name: 'mail',
          ariaLabel: 'mail',
          order: orderNumber.shift(),
          isButton: true,
          html: '<i class="' + config.icons.mail + '"></i>',
          onClick: function onClick(event, el, pswp) {
            photoBooth.showMailForm(pswp.currSlide.data.src.split('\\').pop().split('/').pop());
          }
        });
      }
      if (config.print.from_gallery) {
        gallery.pswp.ui.registerElement({
          name: 'print',
          ariaLabel: 'print',
          order: orderNumber.shift(),
          isButton: true,
          html: '<i class="' + config.icons.print + '"></i>',
          onClick: function () {
            var _onClick = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(event, el, pswp) {
              var img, copies, _t;
              return _regenerator().w(function (_context) {
                while (1) switch (_context.n) {
                  case 0:
                    event.preventDefault();
                    event.stopPropagation();
                    if (!photoboothTools.isPrinting) {
                      _context.n = 1;
                      break;
                    }
                    photoboothTools.console.log('Printing already in progress!');
                    _context.n = 5;
                    break;
                  case 1:
                    img = pswp.currSlide.data.src.split('\\').pop().split('/').pop();
                    if (!(config.print.max_multi === 1)) {
                      _context.n = 2;
                      break;
                    }
                    _t = 1;
                    _context.n = 4;
                    break;
                  case 2:
                    _context.n = 3;
                    return photoboothTools.askCopies();
                  case 3:
                    _t = _context.v;
                  case 4:
                    copies = _t;
                    if (copies && !isNaN(copies)) {
                      photoboothTools.printImage(img, copies, function () {
                        if (typeof remoteBuzzerClient !== 'undefined') {
                          remoteBuzzerClient.inProgress(false);
                        }
                      });
                    }
                  case 5:
                    return _context.a(2);
                }
              }, _callee);
            }));
            function onClick(_x, _x2, _x3) {
              return _onClick.apply(this, arguments);
            }
            return onClick;
          }()
        });
      }
      if (config.qr.enabled) {
        gallery.pswp.ui.registerElement({
          name: 'qrcode',
          ariaLabel: 'qrcode',
          order: orderNumber.shift(),
          isButton: true,
          html: '<i class="' + config.icons.qr + '"></i>',
          onInit: function onInit(el, pswp) {
            if (config.qr.pswp != 'hidden') {
              pswp.on('change', function () {
                if (document.getElementById('pswpQR')) {
                  document.getElementById('pswpQR').remove();
                }
                var qrWrapper = document.createElement('div');
                qrWrapper.id = 'pswpQR';
                qrWrapper.setAttribute('class', 'pswp-qrcode ' + config.qr.pswp);
                var qrImage = document.createElement('img');
                qrImage.addEventListener('load', function () {
                  $('.pswp').append(qrWrapper);
                });
                qrImage.src = environment.publicFolders.api + '/qrcode.php?filename=' + pswp.currSlide.data.src.split('\\').pop().split('/').pop();
                qrImage.alt = 'QR-Code';
                qrImage.classList.add('pswp-qrcode__image');
                qrWrapper.append(qrImage);
                var qrShortText = config.qr.short_text;
                if (qrShortText && qrShortText.length > 0) {
                  var qrCaption = document.createElement('p');
                  qrCaption.classList.add('pswp-qrcode__caption');
                  qrCaption.textContent = qrShortText;
                  qrWrapper.append(qrCaption);
                }
              });
            }
          },
          onClick: function onClick(event, el, pswp) {
            var image = pswp.currSlide.data.src.split('\\').pop().split('/').pop();
            photoBooth.showQrCode(image);
          }
        });
      }
      if (config.download.enabled) {
        gallery.pswp.ui.registerElement({
          name: 'custom-download',
          tagName: 'a',
          order: orderNumber.shift(),
          isButton: true,
          html: '<i class=" center ' + config.icons.download + '"></i>',
          onInit: function onInit(el, pswp) {
            pswp.on('change', function () {
              el.href = environment.publicFolders.api + '/download.php?image=' + pswp.currSlide.data.src.split('\\').pop().split('/').pop();
            });
          }
        });
      }
      if (config.keying.enabled) {
        gallery.pswp.ui.registerElement({
          name: 'print-chroma-keying',
          tagName: 'a',
          order: orderNumber.shift(),
          isButton: true,
          html: '<i class=" center ' + config.icons.chroma + '"></i>',
          onInit: function onInit(el, pswp) {
            pswp.on('change', function () {
              el.href = environment.publicFolders.chroma + '/chromakeying.php?filename=' + pswp.currSlide.data.src.split('\\').pop().split('/').pop();
            });
          }
        });
      }
      if (config.gallery.use_slideshow) {
        gallery.pswp.ui.registerElement({
          name: 'playpause',
          ariaLabel: 'Slideshow',
          order: orderNumber.shift(),
          isButton: true,
          html: '<i class="' + config.icons.slideshow_play + '"></i>',
          // eslint-disable-next-line no-unused-vars
          onClick: function onClick(event, el, pswp) {
            // toggle slideshow on/off
            $('.pswp__button--playpause i:first').toggleClass(config.icons.slideshow_toggle);
            setSlideshowState(ssButtonClass, !ssRunning);
          }
        });
      }
      if (config.gallery.allow_delete) {
        gallery.pswp.ui.registerElement({
          name: 'delete',
          ariaLabel: 'delete',
          order: orderNumber.shift(),
          isButton: true,
          html: '<i class="' + config.icons["delete"] + '"></i>',
          onClick: function () {
            var _onClick2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(event, el, pswp) {
              var img, msg, really, _t2;
              return _regenerator().w(function (_context2) {
                while (1) switch (_context2.n) {
                  case 0:
                    event.preventDefault();
                    event.stopPropagation();
                    img = pswp.currSlide.data.src.split('\\').pop().split('/').pop();
                    msg = photoboothTools.getTranslation('really_delete_image');
                    if (!config["delete"].no_request) {
                      _context2.n = 1;
                      break;
                    }
                    _t2 = true;
                    _context2.n = 3;
                    break;
                  case 1:
                    _context2.n = 2;
                    return photoboothTools.confirm(img + ' ' + msg);
                  case 2:
                    _t2 = _context2.v;
                  case 3:
                    really = _t2;
                    if (really) {
                      photoBooth.deleteImage(img, function () {
                        setTimeout(function () {
                          return photoboothTools.reloadPage();
                        }, config.ui.notification_timeout * 1000);
                      });
                    }
                  case 4:
                    return _context2.a(2);
                }
              }, _callee2);
            }));
            function onClick(_x4, _x5, _x6) {
              return _onClick2.apply(this, arguments);
            }
            return onClick;
          }()
        });
      }
    });
    gallery.on('afterInit', function () {
      $('.pswp__button').addClass('rotaryfocus');
      if (!config.no_request) {
        $('.pswp__button--delete').removeClass('rotaryfocus');
      }
      if ($('.pswp').hasClass('pswp--touch')) {
        $('.pswp__button--arrow--prev').removeClass('rotaryfocus');
        $('.pswp__button--arrow--next').removeClass('rotaryfocus');
      }
      $('.pswp__button--close').empty();
      $('.pswp__button--close').html('<i class="' + config.icons.close + '"></i>');
      if (config.pswp.zoomEl) {
        $('.pswp__button--zoom').empty();
        $('.pswp__button--zoom').html('<i class="' + config.icons.zoom + '"></i>');
      }
      if (config.qr.enabled && config.qr.pswp != 'hidden') {
        $('.pswp__button--qrcode').hide();
      }
      if (typeof rotaryController !== 'undefined') {
        rotaryController.focusSet('.pswp');
      }
    });
    gallery.init();
    if ($(gallerySelector).children('a').length > 0) {
      gallery.loadAndOpen(galIndex, {
        gallery: document.querySelector(gallerySelector)
      });
    }

    /* slideshow management */
    function gotoNextSlide() {
      clearTimeout(ssTimeOut);
      if (ssRunning && Boolean(gallery)) {
        ssTimeOut = setTimeout(function () {
          gallery.pswp.next();
        }, ssDelay);
      }
    }
    function setSlideshowState(el, running) {
      var title = running ? 'Pause Slideshow' : 'Play Slideshow';
      $(el).prop('title', title);
      ssRunning = running;
      gotoNextSlide();
    }
    return gallery;
  };
  $(gallerySelector).on('click', function (e) {
    e.preventDefault();
    if ($(gallerySelector).children('a').length > 0) {
      var element = $(e.target).closest('a');
      var index = $(gallerySelector).find('>a').index(element);
      globalGalleryHandle = openPhotoSwipe(gallerySelector, index);
    }
  });
  $(document).on('keyup', function (ev) {
    if (config.print.from_gallery && config.print.key && parseInt(config.print.key, 10) === ev.keyCode) {
      if (photoboothTools.isPrinting) {
        photoboothTools.console.log('Printing already in progress!');
      } else if ($('#gallery').hasClass('gallery--open') && typeof gallery !== 'undefined') {
        $('.pswp__button--print').trigger('click');
      }
    }
  });
}