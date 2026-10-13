"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* globals photoBooth MarvinColorModelConverter AlphaBoundary MarvinImage Seriously initRemoteBuzzerFromDOM photoboothTools csrf */
/* exported setChromaImage processChromaImage */
var mainImage;
var mainImageWidth;
var mainImageHeight;
var backgroundImage;
var seriously;
var target;
var chroma;
var seriouslyimage;
var needsReload = false;
var notificationTimeout = config.ui.notification_timeout * 1000;
var chromaCanvas = document.getElementById('chromaCanvas');
var chromaCanvasContext = chromaCanvas.getContext ? chromaCanvas.getContext('2d') : null;
function greenToTransparency(imageIn, imageOut) {
  for (var y = 0; y < imageIn.getHeight(); y++) {
    for (var x = 0; x < imageIn.getWidth(); x++) {
      var color = imageIn.getIntColor(x, y);
      var hsv = MarvinColorModelConverter.rgbToHsv([color]);
      if (hsv[0] >= 60 && hsv[0] <= 200 && hsv[1] >= 0.2 && hsv[2] >= 0.2) {
        imageOut.setIntColor(x, y, 0, 127, 127, 127);
      } else {
        imageOut.setIntColor(x, y, color);
      }
    }
  }
}
function reduceGreen(image) {
  for (var y = 0; y < image.getHeight(); y++) {
    for (var x = 0; x < image.getWidth(); x++) {
      var r = image.getIntComponent0(x, y);
      var g = image.getIntComponent1(x, y);
      var b = image.getIntComponent2(x, y);
      var color = image.getIntColor(x, y);
      var hsv = MarvinColorModelConverter.rgbToHsv([color]);
      if (hsv[0] >= 60 && hsv[0] <= 130 && hsv[1] >= 0.15 && hsv[2] >= 0.15) {
        if (r * b != 0 && g * g / (r * b) > 1.5) {
          image.setIntColor(x, y, 255, r * 1.4, g, b * 1.4);
        } else {
          image.setIntColor(x, y, 255, r * 1.2, g, b * 1.2);
        }
      }
    }
  }
}
function alphaBoundary(imageOut, radius) {
  var ab = new AlphaBoundary();
  for (var y = 0; y < imageOut.getHeight(); y++) {
    for (var x = 0; x < imageOut.getWidth(); x++) {
      ab.alphaRadius(imageOut, x, y, radius);
    }
  }
}
function processChromaImage(imgSrc) {
  var save = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var filename = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  if (config.keying.variant === 'marvinj') {
    var image = new MarvinImage();
    image.load(imgSrc, function () {
      mainImageWidth = image.getWidth();
      mainImageHeight = image.getHeight();
      var imageOut = new MarvinImage(image.getWidth(), image.getHeight());

      //1. Convert green to transparency
      greenToTransparency(image, imageOut);

      // 2. Reduce remaining green pixels
      reduceGreen(imageOut);

      // 3. Apply alpha to the boundary
      alphaBoundary(imageOut, 6);
      var tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = mainImageWidth;
      tmpCanvas.height = mainImageHeight;
      imageOut.draw(tmpCanvas);
      mainImage = new Image();
      mainImage.src = tmpCanvas.toDataURL('image/png');
      mainImage.onload = function () {
        drawCanvas(save, filename);
      };
    });
  } else {
    var _image = new Image();
    _image.src = imgSrc;
    _image.onload = function () {
      mainImageWidth = _image.width;
      mainImageHeight = _image.height;

      // create tmpcanvas and size it to image size
      var tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = mainImageWidth;
      tmpCanvas.height = mainImageHeight;
      tmpCanvas.id = 'tmpimageout';

      // append Canvas for Seriously to chromakey the image
      // eslint-disable-next-line no-unused-vars
      var body = document.getElementsByTagName('body')[0];
      document.body.appendChild(tmpCanvas);
      seriously = new Seriously();
      target = seriously.target('#tmpimageout');
      seriouslyimage = seriously.source(_image);
      chroma = seriously.effect('chroma');
      chroma.source = seriouslyimage;
      target.source = chroma;
      var color = config.keying.seriouslyjs_color;
      var r = parseInt(color.substr(1, 2), 16) / 255;
      var g = parseInt(color.substr(3, 2), 16) / 255;
      var b = parseInt(color.substr(5, 2), 16) / 255;
      photoboothTools.console.logDev('Chromakeying color:', color);
      photoboothTools.console.logDev('Red:', r, 'Green:', g, 'Blue:', b);
      chroma.screen = [r, g, b, 1];
      seriously.go();
      mainImage = new Image();
      mainImage.src = tmpCanvas.toDataURL('image/png');
      mainImage.onload = function () {
        drawCanvas(save, filename);
      };
    };
    _image.src = imgSrc;
  }
}

// eslint-disable-next-line no-unused-vars
function setChromaImage(url) {
  backgroundImage = new Image();
  backgroundImage.src = url;
  backgroundImage.onload = function () {
    drawCanvas();
  };
}
function drawCanvas() {
  var save = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  if (typeof mainImage !== 'undefined' && mainImage !== null) {
    chromaCanvas.width = mainImage.width;
    chromaCanvas.height = mainImage.height;
  } else if (typeof backgroundImage !== 'undefined' && backgroundImage !== null) {
    chromaCanvas.width = backgroundImage.width;
    chromaCanvas.height = backgroundImage.height;
  }

  // Clear the canvas
  chromaCanvasContext.clearRect(0, 0, chromaCanvas.width, chromaCanvas.height);
  if (typeof backgroundImage !== 'undefined' && backgroundImage !== null) {
    if (typeof mainImage !== 'undefined' && mainImage !== null) {
      var size = calculateAspectRatioFit(backgroundImage.width, backgroundImage.height, mainImage.width, mainImage.height);
      chromaCanvasContext.drawImage(backgroundImage, 0, 0, size.width, size.height);
    } else {
      chromaCanvasContext.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height);
    }
  }
  if (typeof mainImage !== 'undefined' && mainImage !== null) {
    if (config.keying.variant === 'marvinj') {
      chromaCanvasContext.drawImage(mainImage, 0, 0);
    } else {
      //important to fetch tmpimageout
      chromaCanvasContext.drawImage(document.getElementById('tmpimageout'), 0, 0);
    }
    if (save) {
      saveImage(filename);
    }
  }
}
function clearCanvasAndLoadImage(imageUrl) {
  // Clear the canvas
  chromaCanvasContext.clearRect(0, 0, chromaCanvas.width, chromaCanvas.height);

  // Create a new image element
  var newImage = new Image();

  // Set the onload event handler to execute code after the image is loaded
  newImage.onload = function () {
    chromaCanvas.width = newImage.width;
    chromaCanvas.height = newImage.height;
    chromaCanvasContext.drawImage(newImage, 0, 0);
  };

  // Set the source of the image to the specified URL
  newImage.src = imageUrl;
}
function saveImage(filename, cb) {
  var dataURL = chromaCanvas.toDataURL('image/png');
  $.ajax({
    method: 'POST',
    url: environment.publicFolders.api + '/chromakeying/save.php',
    data: _defineProperty({
      imgData: dataURL,
      file: filename
    }, csrf.key, csrf.token),
    success: function success(resp) {
      if (typeof onCaptureChromaView === 'undefined') {
        setTimeout(function () {
          photoboothTools.overlay.close();
          $('[data-command="save-chroma-btn"]').trigger('blur');
        }, notificationTimeout);
      } else {
        photoBooth.takingPic = false;
        needsReload = true;
        photoBooth.chromaimage = resp.filename;
        clearCanvasAndLoadImage(environment.publicFolders.images + '/' + resp.filename);
        if (config.picture.allow_delete) {
          $('[data-command="deletebtn"]').off('click').on('click', /*#__PURE__*/function () {
            var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(ev) {
              var msg, really, _t;
              return _regenerator().w(function (_context) {
                while (1) switch (_context.n) {
                  case 0:
                    ev.preventDefault();
                    msg = photoboothTools.getTranslation('really_delete_image');
                    if (!config["delete"].no_request) {
                      _context.n = 1;
                      break;
                    }
                    _t = true;
                    _context.n = 3;
                    break;
                  case 1:
                    _context.n = 2;
                    return photoboothTools.confirm(resp.filename + ' ' + msg);
                  case 2:
                    _t = _context.v;
                  case 3:
                    really = _t;
                    if (really) {
                      photoBooth.deleteImage(resp.filename, function (result) {
                        if (result.success && config.keying.show_all) {
                          photoBooth.deleteImage(photoBooth.filename, function () {
                            setTimeout(function () {
                              photoboothTools.reloadPage();
                            }, notificationTimeout);
                          });
                        } else {
                          setTimeout(function () {
                            photoboothTools.reloadPage();
                          }, notificationTimeout);
                        }
                      });
                    } else {
                      $('.deletebtn').trigger('blur');
                    }
                  case 4:
                    return _context.a(2);
                }
              }, _callee);
            }));
            return function (_x) {
              return _ref.apply(this, arguments);
            };
          }());
        }
        if (resp.filename) {
          // Add Image to gallery and slider
          photoBooth.addImage(resp.filename);
        }
        $('[data-command="print-btn"]').on('click', function (event) {
          event.preventDefault();
          if (photoboothTools.isPrinting) {
            photoboothTools.console.log('Printing already in progress!');
          } else {
            photoboothTools.printImage(resp.filename, 1, function () {
              $('[data-command="print-btn"]').trigger('blur');
            });
          }
        });
        $('[data-command="qrbtn"]').off('click').on('click', function (event) {
          event.preventDefault();
          photoBooth.showQrCode(resp.filename);
        });
      }
      if (cb) {
        cb(resp);
      }
    },
    error: function error(jqXHR, textStatus) {
      photoboothTools.console.log(textStatus);
      setTimeout(function () {
        photoboothTools.reloadPage();
      }, notificationTimeout);
    }
  });
}
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
  var ratio = Math.max(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio
  };
}
$(document).on('keyup', function (ev) {
  if (typeof onCaptureChromaView === 'undefined' && config.print.from_chromakeying && config.print.key && parseInt(config.print.key, 10) === ev.keyCode) {
    if (photoboothTools.isPrinting) {
      photoboothTools.console.log('Printing already in progress!');
    } else {
      $('[data-command="print-btn"]').trigger('click');
    }
  } else if (typeof onCaptureChromaView != 'undefined' && (config.picture.key && parseInt(config.picture.key, 10) === ev.keyCode || config.collage.key && parseInt(config.collage.key, 10) === ev.keyCode)) {
    if (!backgroundImage) {
      photoboothTools.console.logDev('Please choose a background first!');
      photoboothTools.overlay.showError(photoboothTools.getTranslation('chroma_needs_background'));
      setTimeout(function () {
        return photoboothTools.overlay.close();
      }, 1000);
    } else if (needsReload) {
      photoboothTools.console.logDev('Please reload the page to take a new Picture!');
      photoboothTools.overlay.showError(photoboothTools.getTranslation('chroma_needs_reload'));
      setTimeout(function () {
        return photoboothTools.overlay.close();
      }, 1000);
    } else if (!photoBooth.takingPic) {
      if (config.collage.key && parseInt(config.collage.key, 10) === ev.keyCode) {
        photoboothTools.console.logDev('Collage key pressed. Not possible on live chroma, triggering photo now.');
      }
      photoBooth.thrill('chroma');
    } else if (config.dev.loglevel > 0 && photoBooth.takingPic) {
      photoboothTools.console.log('Taking photo already in progress!');
    }
  }
});
$(function () {
  var $chromaStage = $('.stage[data-stage="start"]');
  var $chromaActions = $chromaStage.find('.buttonbar.buttonbar--bottom');
  var $chromaMessage = $chromaStage.find('.stage-message');
  if (typeof onCaptureChromaView === 'undefined') {
    $('[data-command="save-chroma-btn"]').on('click', function (event) {
      event.preventDefault();
      photoboothTools.overlay.show(photoboothTools.getTranslation('saving'));
      saveImage();
    });
    $('[data-command="print-btn"]').on('click', function (event) {
      event.preventDefault();
      setTimeout(function () {
        saveImage('', function (resp) {
          if (!resp.success) {
            return;
          }
          photoboothTools.printImage(resp.filename, 1, function () {
            $('[data-command="print-btn"]').trigger('blur');
          });
        });
      }, 1000);
    });
    $('[data-command="close-btn"]').on('click', function (event) {
      event.preventDefault();
      if (document.referrer) {
        window.location = document.referrer;
      } else {
        window.history.back();
      }
    });
    setTimeout(function () {
      processChromaImage($('body').attr('data-main-image'));
    }, 100);
    initRemoteBuzzerFromDOM();
  } else {
    $chromaActions.addClass('hidden');
    $('.chroma-background-selector-image').on('click', function () {
      $chromaMessage.addClass('hidden');
      $chromaActions.removeClass('hidden');
    });
    $('[data-command="take-chroma"]').on('click', function (event) {
      event.preventDefault();
      if (photoBooth.takingPic) {
        photoboothTools.console.logDev('Taking picture in progress already!');
        return;
      }
      photoBooth.thrill('chroma');
    });
    photoboothTools.console.log('[CHROMA CAPTURE] DOM ready');
  }
});