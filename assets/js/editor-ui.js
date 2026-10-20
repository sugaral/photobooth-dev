"use strict";

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
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
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
/* Catalog drawers and transactional handwriting, using the editor's existing history. */
(function () {
  'use strict';

  var api = photoBooth,
    catalog = PhotoboothCatalog;
  var drawerSelectors = '.editor-drawer, #classicFilterQuickBar, #signatureModal, #stickerModal, #textModal, #rembgModal, #beautyModal';
  var drawerButtons = '#btnClassicToggleFilters, #btnClassicToggleFrame, #btnClassicAddSignature, #btnClassicInsertText, #btnClassicOpenStickers';
  var closeDrawers = function closeDrawers() {
    if (loading) exit();
    $(drawerSelectors).stop(true, true).hide().attr('aria-hidden', 'true').removeClass('active sidenav--open is-open');
    $(drawerButtons).attr('aria-expanded', 'false').removeClass('active is-drawer-open');
    $('.classic-result-action, .rembgbtn, .beautybtn, [data-command="rembgbtn"], [data-command="beautybtn"]').removeClass('active is-drawer-open');
  };
  api.closeEditorDrawers = closeDrawers;
  var filterButtons = function filterButtons(className) {
    return catalog.filters.map(function (f) {
      return "<button type=\"button\" class=\"".concat(className, "\" data-filter=\"").concat(f.id, "\" aria-label=\"").concat(f.name, "\"><img src=\"").concat(catalog.sample, "\" alt=\"\" style=\"filter:").concat(f.css, "\" loading=\"lazy\"><span>").concat(f.name, "</span></button>");
    }).join('');
  };
  $('#classicFilterQuickBar').addClass('editor-drawer').html('<div class="editor-drawer-heading"><h2><i class="fa fa-sliders"></i> 滤镜 · 36 款</h2><button type="button" id="btnClassicFilterClose" aria-label="关闭滤镜">×</button></div><div class="editor-filter-grid">' + filterButtons('classic-qfilter-chip') + '</div>');
  $('#studioFiltersGallery').html(filterButtons('wb-filter-item'));
  // The legacy navigation uses the same catalog and fixed preview too.
  $('#filternav .filternav-scrollable-list').first().html(filterButtons('filter-card'));
  $('body').append('<aside class="editor-drawer" id="frameDrawer" style="display:none" aria-label="选择边框"><div class="editor-drawer-heading"><h2><i class="fa fa-border-all"></i> 边框 · 24 款</h2><button type="button" data-close-editor aria-label="关闭边框">×</button></div><div class="editor-frame-grid"><button type="button" data-frame=""><div class="frame-none-box"><i class="fa fa-ban"></i></div><span>无边框</span></button>' + catalog.frames.map(function (f) {
    return "<button type=\"button\" data-frame=\"".concat(f.id, "\"><img src=\"").concat(catalog.svgUrl(catalog.frameSvg(f.id, 240, 180, true)), "\" alt=\"\"><span>").concat(f.name, "</span></button>");
  }).join('') + '</div></aside>');
  var stickers = window.PhotoboothStickers;
  var categories = _toConsumableArray(new Set(stickers.map(function (s) {
    return s.category;
  })));
  $('#stickerModal .sticker-drawer-tabs').html('<label>贴纸分类 <select id="stickerCategory"><option value="">全部 · 120 张</option>' + categories.map(function (c) {
    return "<option>".concat(c, "</option>");
  }).join('') + '</select></label>');
  $('#stickerModal .sticker-drawer-body').html('<div class="sticker-grid">' + stickers.map(function (s) {
    return "<button type=\"button\" class=\"sticker-item\" data-type=\"image\" data-asset=\"".concat(s.url, "\" data-category=\"").concat(s.category, "\" aria-label=\"").concat(s.name, "\"><img src=\"").concat(s.url, "\" alt=\"").concat(s.name, "\" loading=\"lazy\"></button>");
  }).join('') + '</div>');
  $(document).on('change', '#stickerCategory', function () {
    var category = this.value;
    $('.sticker-item').each(function () {
      $(this).toggle(!category || this.dataset.category === category);
    });
  });
  $(document).on('click', '[data-close-editor], #btnClassicFilterClose, #btnStickerClose, #btnStickerSave, #btnSignatureClose, #btnSignatureCancel, #btnTextClose, #btnTextCancel, #btnRembgClose, #btnBeautyClose', closeDrawers);
  $(document).on('pointerdown', function (e) {
    var $openDrawers = $(drawerSelectors).filter(':visible');
    if (!$openDrawers.length) return;
    if ($(e.target).closest(drawerSelectors + ', ' + drawerButtons + ', .classic-result-action, .rembgbtn, .beautybtn, [data-command="rembgbtn"], [data-command="beautybtn"], .swal2-container, .placed-sticker, #handwritingStage, .sp-container').length) {
      return;
    }
    closeDrawers();
  });
  $(document).on('click', '[data-frame]', function () {
    try {
      api.setFrame(this.dataset.frame || null);
    } catch (e) {
      api.reportEditError(e);
    }
  });
  var drawerTargets = {
    btnClassicToggleFilters: '#classicFilterQuickBar',
    btnClassicToggleFrame: '#frameDrawer',
    btnClassicAddSignature: '#signatureModal',
    btnClassicInsertText: '#textModal',
    btnClassicOpenStickers: '#stickerModal'
  };
  $(drawerButtons).each(function () {
    $(this).attr({
      'aria-controls': drawerTargets[this.id].slice(1),
      'aria-expanded': 'false'
    });
  });
  $(drawerSelectors).attr('aria-hidden', 'true');
  $(document).on('click', drawerButtons, function (e) {
    e.preventDefault();
    var target = drawerTargets[this.id];
    if (!target) return;
    var visible = $(target).is(':visible');
    closeDrawers();
    if (!visible) {
      $(target).stop(true, true).show().attr('aria-hidden', 'false');
      $(this).attr('aria-expanded', 'true').addClass('active is-drawer-open');
      if (this.id === 'btnClassicOpenStickers' || this.id === 'btnClassicInsertText') $('#stickerCanvasOverlay').show();
    }
  });
  var pens = [{
    name: '圆珠笔',
    width: 2.5,
    opacity: 0.95
  }, {
    name: '霓虹发光笔',
    width: 10,
    opacity: 1,
    glow: true
  }, {
    name: '荧光笔',
    width: 24,
    opacity: 0.65,
    highlighter: true
  }, {
    name: '马克笔',
    width: 16,
    opacity: 0.60
  }];
  $('#signatureModal .signature-drawer-title span').text('手写签名');
  $('#signatureModal .signature-drawer-body').html('<p>选择笔迹、颜色与粗细，确认后在全屏照片上手写。</p>' + '<div class="pen-grid">' + pens.map(function (p, i) {
    return "<label><input type=\"radio\" name=\"signaturePen\" value=\"".concat(i, "\" ").concat(i === 1 ? 'checked' : '', "><span>").concat(p.name, "</span></label>");
  }).join('') + '</div>' + '<div class="ink-width-row" style="margin-top:12px;margin-bottom:12px;display:flex;align-items:center;gap:12px;">' + '<span class="ink-width-title" style="font-size:13px;color:#334155;white-space:nowrap;font-weight:600;"><i class="fa fa-sliders"></i> 笔触粗细:</span>' + '<input type="range" id="inkWidthSlider" min="0.05" max="1.0" step="0.01" value="1.0" style="flex:1;accent-color:#7555cd;cursor:pointer;">' + '<span id="inkWidthVal" style="font-size:13px;color:#7555cd;font-weight:bold;min-width:44px;">1.00x</span>' + '</div>' + '<div class="ink-color-row" style="margin-top:10px;display:flex;flex-direction:column;gap:8px;">' + '<span class="ink-color-title" style="font-size:13px;color:#334155;font-weight:600;"><i class="fa fa-palette"></i> 快捷荧光色与经典色:</span>' + '<div class="ink-quick-colors" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">' + '<button type="button" class="ink-preset-dot active" data-color="#00f5ff" style="width:28px;height:28px;border-radius:50%;background:#00f5ff;border:2px solid #fff;cursor:pointer;box-shadow:0 0 10px #00f5ff;" title="荧光青"></button>' + '<button type="button" class="ink-preset-dot" data-color="#39ff14" style="width:28px;height:28px;border-radius:50%;background:#39ff14;border:2px solid transparent;cursor:pointer;box-shadow:0 0 8px #39ff14;" title="荧光绿"></button>' + '<button type="button" class="ink-preset-dot" data-color="#ff007f" style="width:28px;height:28px;border-radius:50%;background:#ff007f;border:2px solid transparent;cursor:pointer;box-shadow:0 0 8px #ff007f;" title="荧光粉"></button>' + '<button type="button" class="ink-preset-dot" data-color="#ffe600" style="width:28px;height:28px;border-radius:50%;background:#ffe600;border:2px solid transparent;cursor:pointer;box-shadow:0 0 8px #ffe600;" title="荧光黄"></button>' + '<button type="button" class="ink-preset-dot" data-color="#ffffff" style="width:28px;height:28px;border-radius:50%;background:#ffffff;border:2px solid #94a3b8;cursor:pointer;" title="纯白"></button>' + '<button type="button" class="ink-preset-dot" data-color="#111827" style="width:28px;height:28px;border-radius:50%;background:#111827;border:2px solid #555;cursor:pointer;" title="曜石黑"></button>' + '<button type="button" class="ink-preset-dot" data-color="#ef4444" style="width:28px;height:28px;border-radius:50%;background:#ef4444;border:2px solid transparent;cursor:pointer;" title="经典红"></button>' + '<button type="button" class="ink-preset-dot" data-color="#eab308" style="width:28px;height:28px;border-radius:50%;background:#eab308;border:2px solid transparent;cursor:pointer;" title="流金色"></button>' + '</div>' + '<label class="ink-color-label" style="display:flex;align-items:center;gap:8px;margin-top:4px;font-size:13px;color:#475569;">自定义色 <input type="color" id="inkColor" value="#00f5ff" style="border:none;background:none;width:34px;height:34px;cursor:pointer;"></label>' + '</div>');
  $(document).on('click', '.ink-preset-dot', function (e) {
    e.preventDefault();
    $('.ink-preset-dot').removeClass('active').css('border-color', 'transparent');
    $(this).addClass('active').css('border-color', '#fff');
    var col = $(this).data('color') || '#00f5ff';
    $('#inkColor').val(col);
    if (draft) draft.color = col;
  });
  $(document).on('input', '#inkColor', function () {
    var col = $(this).val();
    $('.ink-preset-dot').removeClass('active').css('border-color', 'transparent');
    if (draft) draft.color = col;
  });
  $(document).on('input change', '#inkWidthSlider', function () {
    var val = parseFloat(this.value) || 1.0;
    val = Math.max(0.05, Math.min(1.0, val));
    $('#inkWidthVal').text(val.toFixed(2) + 'x');
    $('#stageInkWidthSlider').val(val);
    $('#stageInkWidthVal').text(val.toFixed(2) + 'x');
    if (draft) draft.penWidthMultiplier = val;
  });
  $(document).on('input change', '#stageInkWidthSlider', function () {
    var val = parseFloat(this.value) || 1.0;
    val = Math.max(0.05, Math.min(1.0, val));
    $('#stageInkWidthVal').text(val.toFixed(2) + 'x');
    $('#inkWidthSlider').val(val);
    $('#inkWidthVal').text(val.toFixed(2) + 'x');
    if (draft) draft.penWidthMultiplier = val;
  });
  $(document).on('click', '.stage-pen-pill', function (e) {
    e.preventDefault();
    $('.stage-pen-pill').removeClass('active');
    $(this).addClass('active');
    var idx = parseInt($(this).data('pen'), 10) || 0;
    if (pens[idx] && draft) {
      draft.pen = pens[idx];
      $('input[name="signaturePen"][value="' + idx + '"]').prop('checked', true);
    }
  });
  $('#btnSignatureConfirm span').text('确认，进入全屏手写');
  $('body').append('<section id="handwritingStage" hidden role="dialog" aria-modal="true" aria-label="全屏手写签名"><div class="ink-toolbar"><button type="button" id="inkCancel">取消</button><button type="button" id="inkUndo">撤销一笔</button><button type="button" id="inkClear">清空笔迹</button><div class="stage-pens-box" style="display:inline-flex;gap:4px;align-items:center;margin:0 4px;"><button type="button" class="stage-pen-pill" data-pen="0">圆珠笔</button><button type="button" class="stage-pen-pill active" data-pen="1">霓虹发光</button><button type="button" class="stage-pen-pill" data-pen="2">荧光笔</button><button type="button" class="stage-pen-pill" data-pen="3">马克笔</button></div><div class="stage-width-box" style="display:inline-flex;align-items:center;gap:6px;margin:0 6px;"><span style="font-size:12px;color:rgba(255,255,255,0.85);white-space:nowrap;">粗细:</span><input type="range" id="stageInkWidthSlider" min="0.05" max="1.0" step="0.01" value="1.0" style="width:75px;accent-color:#00f5ff;cursor:pointer;"><span id="stageInkWidthVal" style="font-size:12px;color:#00f5ff;font-weight:bold;min-width:38px;">1.00x</span></div><button type="button" id="inkDone">完成</button></div><div class="ink-photo"><img id="inkPhoto" alt="在照片上手写签名"><svg id="inkCanvas" xmlns="http://www.w3.org/2000/svg"></svg></div><p class="ink-help">在照片上书写，右上角可切换笔触、粗细与颜色；点击“完成”保存。</p></section>');
  var draft = null,
    loading = null,
    previewUrl = null,
    previousFocus = null;
  var stage = document.getElementById('handwritingStage'),
    canvas = document.getElementById('inkCanvas');
  function layoutInkPhoto() {
    if (!draft || stage.hidden) return;
    var style = getComputedStyle(stage);
    var width = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    var height = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    var scale = Math.min(width / draft.width, height / draft.height);
    var photo = stage.querySelector('.ink-photo');
    photo.style.width = Math.max(1, draft.width * scale) + 'px';
    photo.style.height = Math.max(1, draft.height * scale) + 'px';
  }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(layoutInkPhoto).observe(stage);else window.addEventListener('resize', layoutInkPhoto);
  function exit() {
    if (loading) loading.abort();
    loading = null;
    draft = null;
    stage.hidden = true;
    if (document.fullscreenElement === stage && document.exitFullscreen) document.exitFullscreen()["catch"](function () {});
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    $('#btnSignatureConfirm').prop('disabled', false);
  }
  window.PhotoboothInk = {
    cancel: exit,
    active: function active() {
      return !!draft || !!loading;
    }
  };
  function chaikinSmooth(points, iterations) {
    if (!points || points.length <= 2) return points || [];
    var pts = points;
    for (var it = 0; it < (iterations || 1); it++) {
      var next = [pts[0]];
      for (var i = 0; i < pts.length - 1; i++) {
        var p0 = pts[i];
        var p1 = pts[i + 1];
        next.push([0.75 * p0[0] + 0.25 * p1[0], 0.75 * p0[1] + 0.25 * p1[1]]);
        next.push([0.25 * p0[0] + 0.75 * p1[0], 0.25 * p0[1] + 0.75 * p1[1]]);
      }
      next.push(pts[pts.length - 1]);
      pts = next;
    }
    return pts;
  }

  function buildSmoothSpline(points) {
    if (!points || !points.length) return '';
    var pts = chaikinSmooth(points, points.length > 5 ? 1 : 0);
    if (pts.length === 1) {
      return "M ".concat(pts[0][0], " ").concat(pts[0][1], " L ").concat(pts[0][0] + 0.1, " ").concat(pts[0][1] + 0.1);
    }
    if (pts.length === 2) {
      return "M ".concat(pts[0][0], " ").concat(pts[0][1], " L ").concat(pts[1][0], " ").concat(pts[1][1]);
    }
    var d = "M ".concat(pts[0][0], " ").concat(pts[0][1]);
    for (var i = 1; i < pts.length - 1; i++) {
      var xc = (pts[i][0] + pts[i + 1][0]) / 2;
      var yc = (pts[i][1] + pts[i + 1][1]) / 2;
      d += " Q ".concat(pts[i][0], " ").concat(pts[i][1], ", ").concat(xc, " ").concat(yc);
    }
    var last = pts[pts.length - 1];
    d += " L ".concat(last[0], " ").concat(last[1]);
    return d;
  }
  function paths(strokes) {
    var defs = '';
    var body = strokes.map(function (s) {
      var color = s.color || '#ffffff',
        p = s.pen || {};
      if (!s.points || !s.points.length) return '';
      var scale = draft ? draft.width / 1200 : 1;
      var mult = s.widthMultiplier || (draft ? draft.penWidthMultiplier : 1.0) || 1.0;
      var rawBaseWidth = (p.width || 4) * mult * scale;
      var strokeHtml = '';
      if (p.glow) {
        // Multi-tier progressive vector neon bloom (动态随粗细自适应，杜绝滤镜阶梯量化锯齿)
        var smoothD = buildSmoothSpline(s.points);
        var effW = Math.max(1.6, rawBaseWidth);
        var bloom = Math.max(3.2, effW * 1.8);
        // Tier 1: Soft ambient aura
        strokeHtml += "<path d=\"".concat(smoothD, "\" fill=\"none\" stroke=\"").concat(color, "\" stroke-width=\"").concat(effW + bloom * 3.2, "\" stroke-linecap=\"round\" stroke-linejoin=\"round\" opacity=\"0.10\"/>");
        // Tier 2: Mid aura
        strokeHtml += "<path d=\"".concat(smoothD, "\" fill=\"none\" stroke=\"").concat(color, "\" stroke-width=\"").concat(effW + bloom * 1.8, "\" stroke-linecap=\"round\" stroke-linejoin=\"round\" opacity=\"0.24\"/>");
        // Tier 3: Intense inner glow
        strokeHtml += "<path d=\"".concat(smoothD, "\" fill=\"none\" stroke=\"").concat(color, "\" stroke-width=\"").concat(effW + bloom * 0.8, "\" stroke-linecap=\"round\" stroke-linejoin=\"round\" opacity=\"0.55\"/>");
        // Tier 4: Neon colored tube
        strokeHtml += "<path d=\"".concat(smoothD, "\" fill=\"none\" stroke=\"").concat(color, "\" stroke-width=\"").concat(effW, "\" stroke-linecap=\"round\" stroke-linejoin=\"round\" opacity=\"0.95\"/>");
        // Tier 5: Pure white hot plasma filament core
        strokeHtml += "<path d=\"".concat(smoothD, "\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"").concat(Math.max(1.0, effW * 0.38), "\" stroke-linecap=\"round\" stroke-linejoin=\"round\" opacity=\"1.0\"/>");
        return "<g opacity=\"".concat(p.opacity || 1, "\" style=\"mix-blend-mode:screen;\">").concat(strokeHtml, "</g>");
      }
      if (p.highlighter) {
        // Form 2: Authentic stationery translucent highlighter (形态2：荧光马克划重点笔)
        var hlD = buildSmoothSpline(s.points);
        var effW = Math.max(2.2, rawBaseWidth);
        strokeHtml += "<path d=\"".concat(hlD, "\" fill=\"none\" stroke=\"").concat(color, "\" stroke-width=\"").concat(effW * 1.25, "\" stroke-linecap=\"round\" stroke-linejoin=\"round\" opacity=\"0.35\"/>");
        strokeHtml += "<path d=\"".concat(hlD, "\" fill=\"none\" stroke=\"").concat(color, "\" stroke-width=\"").concat(effW * 0.92, "\" stroke-linecap=\"round\" stroke-linejoin=\"round\" opacity=\"0.65\"/>");
        return "<g opacity=\"".concat(p.opacity || 1, "\">").concat(strokeHtml, "</g>");
      }
      if (p.pressure) {
        // Traditional calligraphy brush with natural pressure & variable width segments
        var bParts = '';
        var effW = Math.max(1.5, rawBaseWidth);
        for (var i = 1; i < s.points.length; i++) {
          var prev = s.points[i - 1];
          var curr = s.points[i];
          var pr = curr[2] !== undefined ? curr[2] : 0.5;
          var segW = effW * (0.28 + 1.35 * pr);
          bParts += "<path d=\"M ".concat(prev[0], " ").concat(prev[1], " L ").concat(curr[0], " ").concat(curr[1], "\" fill=\"none\" stroke=\"").concat(color, "\" stroke-width=\"").concat(segW, "\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>");
        }
        var spineD = buildSmoothSpline(s.points);
        bParts += "<path d=\"".concat(spineD, "\" fill=\"none\" stroke=\"").concat(color, "\" stroke-width=\"").concat(effW * 0.35, "\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>");
        return "<g opacity=\"".concat(p.opacity || 1, "\">").concat(bParts, "</g>");
      }
      if (p.dash) {
        // Chalk with authentic rough texture and offset powder grain
        var chalkD = buildSmoothSpline(s.points);
        var effW = Math.max(1.8, rawBaseWidth);
        strokeHtml += "<path d=\"".concat(chalkD, "\" fill=\"none\" stroke=\"").concat(color, "\" stroke-width=\"").concat(effW, "\" stroke-linecap=\"round\" stroke-dasharray=\"2 4 5 3\" opacity=\"0.85\"/>");
        strokeHtml += "<path d=\"".concat(chalkD, "\" fill=\"none\" stroke=\"").concat(color, "\" stroke-width=\"").concat(effW * 0.7, "\" stroke-linecap=\"round\" stroke-dasharray=\"1 5 3 2\" opacity=\"0.45\" transform=\"translate(0.5, 0.5)\"/>");
        return "<g opacity=\"".concat(p.opacity || 1, "\">").concat(strokeHtml, "</g>");
      }
      var d = buildSmoothSpline(s.points);
      var lineCap = p.name === '马克笔' ? 'square' : 'round';
      var lineJoin = p.name === '马克笔' ? 'miter' : 'round';
      var effW = Math.max(1.2, rawBaseWidth);
      var w = p.name === '马克笔' ? effW * 1.5 : p.name === '圆珠笔' ? Math.max(1.0, effW * 0.75) : effW;
      strokeHtml = "<path d=\"".concat(d, "\" fill=\"none\" stroke=\"").concat(color, "\" stroke-width=\"").concat(w, "\" stroke-linecap=\"").concat(lineCap, "\" stroke-linejoin=\"").concat(lineJoin, "\"/>");
      return "<g opacity=\"".concat(p.opacity || 1, "\">").concat(strokeHtml, "</g>");
    }).join('');
    return defs + body;
  }
  var redraw = function redraw() {
    if (draft) {
      canvas.innerHTML = paths(draft.strokes);
      $('#inkUndo, #inkClear, #inkDone').prop('disabled', !draft.strokes.length || draft.pointer !== null);
    }
  };
  $(document).on('click', '#btnSignatureConfirm', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var url, controller, state, check, blob, photo, width, height, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          if (!(loading || draft)) {
            _context.n = 1;
            break;
          }
          return _context.a(2);
        case 1:
          url = null;
          controller = new AbortController();
          loading = controller;
          previousFocus = document.activeElement;
          _context.p = 2;
          state = api.compositeInput();
          $(this).prop('disabled', true);
          check = function check() {
            if (controller.signal.aborted || loading !== controller) throw new Error('签名已取消');
          };
          _context.n = 3;
          return PhotoboothCompositeRenderer.render(state, {
            signal: controller.signal,
            check: check
          });
        case 3:
          blob = _context.v;
          check();
          url = URL.createObjectURL(blob);
          photo = document.getElementById('inkPhoto');
          photo.src = url;
          _context.n = 4;
          return photo.decode();
        case 4:
          check();
          previewUrl = url;
          url = null;
          width = Math.min(1600, photo.naturalWidth), height = width * photo.naturalHeight / photo.naturalWidth;
          var curWidthMul = parseFloat($('#inkWidthSlider').val()) || 1.0;
          var penIdx = Number($('input[name="signaturePen"]:checked').val()) || 1;
          draft = {
            width: width,
            height: height,
            strokes: [],
            pointer: null,
            pen: pens[penIdx] || pens[1],
            color: $('#inkColor').val() || '#00f5ff',
            penWidthMultiplier: curWidthMul
          };
          $('#stageInkWidthSlider').val(curWidthMul);
          $('#stageInkWidthVal').text(curWidthMul.toFixed(2) + 'x');
          $('.stage-pen-pill').removeClass('active');
          $('.stage-pen-pill[data-pen="' + penIdx + '"]').addClass('active');
          canvas.setAttribute('viewBox', "0 0 ".concat(width, " ").concat(height));
          stage.style.setProperty('--ink-ratio', "".concat(width, " / ").concat(height));
          loading = null;
          closeDrawers();
          stage.hidden = false;
          layoutInkPhoto();
          redraw();
          // Viewport fullscreen is always available; native fullscreen is optional on kiosk browsers.
          if (stage.requestFullscreen) stage.requestFullscreen()["catch"](function () {});
          document.getElementById('inkCancel').focus();
          _context.n = 7;
          break;
        case 5:
          _context.p = 5;
          _t = _context.v;
          if (url) URL.revokeObjectURL(url);
          // A cancelled request must never close a newer draft or preparation.
          if (!(controller.signal.aborted || loading !== controller)) {
            _context.n = 6;
            break;
          }
          return _context.a(2);
        case 6:
          exit();
          api.reportEditError(_t);
        case 7:
          return _context.a(2);
      }
    }, _callee, this, [[2, 5]]);
  })));
  function addPoint(e) {
    var r = canvas.getBoundingClientRect();
    var stroke = draft.strokes[draft.strokes.length - 1];
    if (stroke.points.length >= 1200 || draft.strokes.reduce(function (sum, s) {
      return sum + s.points.length;
    }, 0) >= 12000) return;
    stroke.points.push([Math.round(Math.max(0, Math.min(draft.width, (e.clientX - r.left) / r.width * draft.width)) * 100) / 100, Math.round(Math.max(0, Math.min(draft.height, (e.clientY - r.top) / r.height * draft.height)) * 100) / 100, e.pressure > 0 ? e.pressure : .5]);
  }
  canvas.addEventListener('pointerdown', function (e) {
    if (!draft || draft.pointer !== null || e.button !== 0 || draft.strokes.length >= 100) return;
    if (draft.strokes.reduce(function (sum, s) {
      return sum + s.points.length;
    }, 0) >= 12000) return;
    e.preventDefault();
    draft.pointer = e.pointerId;
    canvas.setPointerCapture(e.pointerId);
    draft.strokes.push({
      pen: _objectSpread({}, draft.pen),
      color: draft.color,
      widthMultiplier: draft.penWidthMultiplier || 1.0,
      points: []
    });
    addPoint(e);
    redraw();
  });
  canvas.addEventListener('pointermove', function (e) {
    if (draft && e.pointerId === draft.pointer) {
      addPoint(e);
      redraw();
    }
  });
  var finish = function finish(e) {
    if (draft && e.pointerId === draft.pointer) {
      if (e.type !== 'pointerup') draft.strokes.pop();
      draft.pointer = null;
      redraw();
    }
  };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (type) {
    return canvas.addEventListener(type, finish);
  });
  $(document).on('click', '#inkUndo', function () {
    if (draft) {
      draft.strokes.pop();
      redraw();
    }
  });
  $(document).on('click', '#inkClear', function () {
    if (draft) {
      draft.strokes = [];
      redraw();
    }
  });
  $(document).on('click', '#inkCancel', exit);
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      if (draft || loading) {
        e.preventDefault();
        exit();
      }
      closeDrawers();
    }
    if (draft && e.key === 'Tab') {
      var buttons = _toConsumableArray(stage.querySelectorAll('button:not(:disabled)'));
      var i = buttons.indexOf(document.activeElement);
      buttons[(i + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
      e.preventDefault();
    }
  });
  document.addEventListener('fullscreenchange', function () {
    if (draft && !document.fullscreenElement && stage.dataset["native"] === '1') exit();
    if (document.fullscreenElement === stage) stage.dataset["native"] = '1';else delete stage.dataset["native"];
  });
  $(document).on('click', '#inkDone', function () {
    if (!draft || !draft.strokes.length || draft.pointer !== null) return;
    var hasBloom = draft.strokes.some(function (s) {
      return s.pen && (s.pen.glow || s.pen.highlighter);
    });
    var points = draft.strokes.flatMap(function (s) {
        return s.points;
      }),
      pad = (hasBloom ? 64 : 20) * draft.width / 1200;
    var bounds = points.reduce(function (b, p) {
      return [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])];
    }, [Infinity, Infinity, 0, 0]);
    var x = Math.max(0, bounds[0] - pad),
      y = Math.max(0, bounds[1] - pad);
    var w = Math.min(draft.width, bounds[2] + pad) - x,
      h = Math.min(draft.height, bounds[3] + pad) - y;
    var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"".concat(w, "\" height=\"").concat(h, "\" viewBox=\"").concat(x, " ").concat(y, " ").concat(w, " ").concat(h, "\">").concat(paths(draft.strokes), "</svg>");
    api.addImageLayer(catalog.svgUrl(svg), 'handwriting', {
      x: (x + w / 2) / draft.width,
      y: (y + h / 2) / draft.height,
      fontSize: h / draft.height,
      ratio: w / h,
      strokes: draft.strokes
    });
    exit();
  });

  // ----------------------------------------------------
  // Special Artistic Fonts & Text Drawer (56 fonts)
  // ----------------------------------------------------
  var specialFonts = [
    // 艺术手写 (15)
    { id: 'Pacifico', name: 'Pacifico', zh: '太平洋手写体', cat: 'script', sample: 'Sweet Romance' },
    { id: 'Caveat', name: 'Caveat', zh: '随性手绘便签', cat: 'script', sample: 'Love & Peace' },
    { id: 'Dancing Script', name: 'Dancing Script', zh: '舞动韵律花体', cat: 'script', sample: 'Forever Youth' },
    { id: 'Lobster', name: 'Lobster', zh: '龙虾招牌体', cat: 'script', sample: 'Golden Memories' },
    { id: 'Sacramento', name: 'Sacramento', zh: '萨克拉门托纤细体', cat: 'script', sample: 'Elegant Touch' },
    { id: 'Great Vibes', name: 'Great Vibes', zh: '华丽宫廷手写体', cat: 'script', sample: 'Pure Happiness' },
    { id: 'Allura', name: 'Allura', zh: '浪漫丝带花体', cat: 'script', sample: 'Sweet Melody' },
    { id: 'Alex Brush', name: 'Alex Brush', zh: '亚历克斯毛笔花体', cat: 'script', sample: 'Beautiful Soul' },
    { id: 'Cookie', name: 'Cookie', zh: '甜心曲奇手写体', cat: 'script', sample: 'Cute Memories' },
    { id: 'Satisfy', name: 'Satisfy', zh: '惬意行书体', cat: 'script', sample: 'Joyful Time' },
    { id: 'Yellowtail', name: 'Yellowtail', zh: '复古平头水笔体', cat: 'script', sample: 'Sunny Days' },
    { id: 'Parisienne', name: 'Parisienne', zh: '巴黎罗曼蒂克体', cat: 'script', sample: 'Bonjour Paris' },
    { id: 'Courgette', name: 'Courgette', zh: '地中海花草手写体', cat: 'script', sample: 'Warm Breeze' },
    { id: 'Damion', name: 'Damion', zh: '自由随性笔触体', cat: 'script', sample: 'Charming Night' },
    { id: 'Marck Script', name: 'Marck Script', zh: '马克羽毛笔花体', cat: 'script', sample: 'Magical Moment' },

    // 潮流复古 (14)
    { id: 'Righteous', name: 'Righteous', zh: '复古迪斯科圆角体', cat: 'retro', sample: 'RETRO VIBES' },
    { id: 'Cinzel', name: 'Cinzel', zh: '古罗马石刻铭文体', cat: 'retro', sample: 'ROYAL HIGHNESS' },
    { id: 'Abril Fatface', name: 'Abril Fatface', zh: '时尚大刊粗衬线体', cat: 'retro', sample: 'VOGUE STYLE' },
    { id: 'Playfair Display', name: 'Playfair Display', zh: '古典名媛衬线体', cat: 'retro', sample: 'Classic Elegance' },
    { id: 'Fredericka the Great', name: 'Fredericka the Great', zh: '手绘速写阴影体', cat: 'retro', sample: 'SKETCH ART' },
    { id: 'Rye', name: 'Rye', zh: '西部牛仔复古体', cat: 'retro', sample: 'WILD WEST' },
    { id: 'Sancreek', name: 'Sancreek', zh: '19世纪马戏团木版体', cat: 'retro', sample: 'CIRCUS DREAMS' },
    { id: 'Vast Shadow', name: 'Vast Shadow', zh: '立体浮雕投影体', cat: 'retro', sample: 'SHADOW REALM' },
    { id: 'Bungee', name: 'Bungee', zh: '美式都市街头招牌体', cat: 'retro', sample: 'BIG CITY' },
    { id: 'Bungee Shade', name: 'Bungee Shade', zh: '立体斜纹街头体', cat: 'retro', sample: 'POP CULTURE' },
    { id: 'Faster One', name: 'Faster One', zh: '极速拉丝拖影体', cat: 'retro', sample: 'SPEED TURBO' },
    { id: 'Monoton', name: 'Monoton', zh: '同心霓虹线条体', cat: 'retro', sample: 'NEON WAVE' },
    { id: 'Limelight', name: 'Limelight', zh: '好莱坞黄金年代体', cat: 'retro', sample: 'GOLDEN AGE' },
    { id: 'Megrim', name: 'Megrim', zh: '几何极简艺术折线体', cat: 'retro', sample: 'GEOMETRIC' },

    // 赛博像素 (9)
    { id: 'Orbitron', name: 'Orbitron', zh: '赛博空间机甲体', cat: 'cyber', sample: 'CYBERPUNK 2077' },
    { id: 'Press Start 2P', name: 'Press Start 2P', zh: '8-Bit红白机像素体', cat: 'cyber', sample: 'PLAYER 1' },
    { id: 'VT323', name: 'VT323', zh: 'CRT终端复古绿显体', cat: 'cyber', sample: 'SYSTEM ONLINE' },
    { id: 'Audiowide', name: 'Audiowide', zh: '未来音效合成器体', cat: 'cyber', sample: 'FUTURE BASS' },
    { id: 'Russo One', name: 'Russo One', zh: '重装机甲硬朗体', cat: 'cyber', sample: 'HEAVY METAL' },
    { id: 'Black Ops One', name: 'Black Ops One', zh: '特种作战钢印模板体', cat: 'cyber', sample: 'TACTICAL OPS' },
    { id: 'Wallpoet', name: 'Wallpoet', zh: '科幻军工点阵体', cat: 'cyber', sample: 'MATRIX SHIELD' },
    { id: 'Share Tech Mono', name: 'Share Tech Mono', zh: '黑客终端等宽代码体', cat: 'cyber', sample: 'DEBUG_SUCCESS' },
    { id: 'Chakra Petch', name: 'Chakra Petch', zh: '太空战舰仪表体', cat: 'cyber', sample: 'SPACE SHIP' },

    // 可爱涂鸦 (18)
    { id: 'Sniglet', name: 'Sniglet', zh: '棉花糖软萌圆体', cat: 'cute', sample: 'Cute Candy' },
    { id: 'Comfortaa', name: 'Comfortaa', zh: '极简北欧圆角体', cat: 'cute', sample: 'Cozy Morning' },
    { id: 'Chewy', name: 'Chewy', zh: 'QQ泡泡糖软糖体', cat: 'cute', sample: 'Bubble Pop' },
    { id: 'Patrick Hand', name: 'Patrick Hand', zh: '清新手帐涂鸦体', cat: 'cute', sample: 'My Secret Diary' },
    { id: 'Amatic SC', name: 'Amatic SC', zh: '文艺插画手撕体', cat: 'cute', sample: 'STAY WEIRD' },
    { id: 'Kalam', name: 'Kalam', zh: '手写彩笔涂鸦体', cat: 'cute', sample: 'Happy Moments' },
    { id: 'Permanent Marker', name: 'Permanent Marker', zh: '粗头油性麦克笔体', cat: 'cute', sample: 'ROCK ON!' },
    { id: 'Rock Salt', name: 'Rock Salt', zh: '街头摇滚炭笔体', cat: 'cute', sample: 'Rock & Roll' },
    { id: 'Bangers', name: 'Bangers', zh: '美漫英雄爆炸标语体', cat: 'cute', sample: 'BOOM! WOW!' },
    { id: 'Boogaloo', name: 'Boogaloo', zh: '阳光摇摆复古卡通体', cat: 'cute', sample: 'Summer Groove' },
    { id: 'Luckiest Guy', name: 'Luckiest Guy', zh: '胖嘟嘟快乐幸运体', cat: 'cute', sample: 'HAPPY LUCKY' },
    { id: 'Gloria Hallelujah', name: 'Gloria Hallelujah', zh: '青春手记字迹体', cat: 'cute', sample: 'Never Grow Up' },
    { id: 'Shadows Into Light', name: 'Shadows Into Light', zh: '灵动仙气手写体', cat: 'cute', sample: 'Pure Magic' },
    { id: 'Gochi Hand', name: 'Gochi Hand', zh: '童趣黑板粉笔手写体', cat: 'cute', sample: 'Little Star' },
    { id: 'Indie Flower', name: 'Indie Flower', zh: '文艺雏菊花语体', cat: 'cute', sample: 'Blooming Flower' },
    { id: 'Henny Penny', name: 'Henny Penny', zh: '跳跃童话派对体', cat: 'cute', sample: 'Fairy Tale' },
    { id: 'Short Stack', name: 'Short Stack', zh: '卡哇伊趣味漫画体', cat: 'cute', sample: 'Comic Life' }
  ];

  var currentSelectedFont = 'Pacifico';
  var currentSelectedTextColor = '#ffffff';

  function renderFontCards(filterCat, filterQuery) {
    var $list = $('#textFontList');
    if (!$list.length) return;
    $list.empty();
    var filtered = specialFonts.filter(function (f) {
      var matchCat = !filterCat || filterCat === 'all' || f.cat === filterCat;
      var matchQuery = !filterQuery || f.name.toLowerCase().includes(filterQuery) || f.zh.toLowerCase().includes(filterQuery);
      return matchCat && matchQuery;
    });
    filtered.forEach(function (f) {
      var isActive = f.id === currentSelectedFont;
      var catName = f.cat === 'script' ? '手写' : f.cat === 'retro' ? '复古' : f.cat === 'cyber' ? '赛博' : '可爱';
      var $card = $('<div class="font-preview-card ' + (isActive ? 'active' : '') + '" data-font="' + f.id + '">' +
        '<div class="font-card-meta">' +
          '<span class="font-card-title">' + f.name + ' <span style="font-weight:normal;color:#64748b;">(' + f.zh + ')</span></span>' +
          '<span class="font-card-tag">' + catName + '</span>' +
        '</div>' +
        '<div class="font-card-sample" style="font-family:\'' + f.id + '\', cursive, sans-serif;">' + f.sample + '</div>' +
      '</div>');
      $list.append($card);
    });
  }

  function getActiveTextSticker() {
    var $active = $('#stickerCanvasOverlay .placed-sticker--text.is-active');
    if ($active.length) return $active;
    var $any = $('#stickerCanvasOverlay .placed-sticker--text').last();
    if ($any.length) {
      $('.placed-sticker').removeClass('is-active');
      $any.addClass('is-active');
      return $any;
    }
    return null;
  }

  function insertNewTextSticker(customText, font, color) {
    var text = customText || $('#textDrawerInput').val() || 'Happy Photobooth ✨';
    var chosenFont = font || currentSelectedFont || 'Pacifico';
    var chosenColor = color || currentSelectedTextColor || '#ffffff';
    $('#stickerCanvasOverlay').show();
    var overlay = $('#stickerCanvasOverlay');

    var $sticker = $('<div class="placed-sticker placed-sticker--text is-active">' +
      '<button type="button" class="sticker-del-btn" title="删除"><i class="fa fa-times"></i></button>' +
      '<div class="sticker-rotate-btn" title="旋转"><i class="fa fa-rotate"></i></div>' +
      '<div class="placed-sticker-content"></div>' +
      '<div class="sticker-resize-btn" title="缩放"><i class="fa fa-up-right-and-down-left-from-center"></i></div>' +
    '</div>');

    $sticker.attr('data-type', 'text')
      .attr('data-content', text)
      .attr('data-font', chosenFont)
      .attr('data-color', chosenColor);

    $sticker.find('.placed-sticker-content')
      .text(text)
      .css({
        'font-family': chosenFont + ', cursive, sans-serif',
        'color': chosenColor,
        'font-size': '44px'
      });

    $('.placed-sticker').removeClass('is-active');
    overlay.append($sticker);
    api.constrainLayer($sticker[0]);
    api.initPlacedStickerInteraction($sticker);
    window.lastRenderedComposite = null;
    api.pushEditState();

    if (window.photoboothTools && window.photoboothTools.showNotification) {
      photoboothTools.showNotification('success', '✨ 艺术文字已生成！可拖拽、旋转及缩放');
    }
    return $sticker;
  }

  $(document).on('click', '#btnClassicInsertText', function (e) {
    e.preventDefault();
    renderFontCards('all', '');
    $('#stickerCanvasOverlay').show();
    var $existing = getActiveTextSticker();
    if ($existing) {
      var content = $existing.attr('data-content') || $existing.find('.placed-sticker-content').text();
      var font = $existing.attr('data-font') || $existing.find('.placed-sticker-content').css('font-family');
      var col = $existing.attr('data-color') || $existing.find('.placed-sticker-content').css('color');
      if (content) $('#textDrawerInput').val(content);
      if (font) {
        currentSelectedFont = font.replace(/['",]/g, '').trim().split(' ')[0];
        $('.font-preview-card').removeClass('active');
        $('.font-preview-card[data-font="' + currentSelectedFont + '"]').addClass('active');
      }
      if (col) {
        currentSelectedTextColor = col;
        $('#textColorPicker').val(col);
        $('.text-swatch').removeClass('active');
        $('.text-swatch[data-color="' + col + '"]').addClass('active');
      }
      $('#btnTextActionLabel').text('完成并应用');
    } else {
      insertNewTextSticker();
      $('#btnTextActionLabel').text('完成并应用');
    }
  });

  $(document).on('click', '.font-preview-card', function (e) {
    e.preventDefault();
    $('.font-preview-card').removeClass('active');
    $(this).addClass('active');
    currentSelectedFont = $(this).data('font') || 'Pacifico';

    var $activeText = getActiveTextSticker();
    if ($activeText && $activeText.length) {
      $activeText.find('.placed-sticker-content').css('font-family', currentSelectedFont + ', cursive, sans-serif');
      $activeText.attr('data-font', currentSelectedFont);
      api.constrainLayer($activeText[0]);
      api.pushEditState();
    }
  });

  $(document).on('click', '.text-font-tab', function (e) {
    e.preventDefault();
    $('.text-font-tab').removeClass('active');
    $(this).addClass('active');
    var cat = $(this).data('cat') || 'all';
    var q = ($('#fontSearchInput').val() || '').trim().toLowerCase();
    renderFontCards(cat, q);
  });

  $(document).on('input', '#fontSearchInput', function () {
    var q = ($(this).val() || '').trim().toLowerCase();
    var cat = $('.text-font-tab.active').data('cat') || 'all';
    renderFontCards(cat, q);
  });

  $(document).on('click', '.text-swatch', function (e) {
    e.preventDefault();
    $('.text-swatch').removeClass('active');
    $(this).addClass('active');
    var col = $(this).data('color') || '#ffffff';
    currentSelectedTextColor = col;
    $('#textColorPicker').val(col);
    var $activeText = getActiveTextSticker();
    if ($activeText && $activeText.length) {
      $activeText.find('.placed-sticker-content').css('color', col);
      $activeText.attr('data-color', col);
      api.pushEditState();
    }
  });

  $(document).on('input', '#textColorPicker', function () {
    var col = $(this).val();
    $('.text-swatch').removeClass('active');
    currentSelectedTextColor = col;
    var $activeText = getActiveTextSticker();
    if ($activeText && $activeText.length) {
      $activeText.find('.placed-sticker-content').css('color', col);
      $activeText.attr('data-color', col);
      api.pushEditState();
    }
  });

  $(document).on('input', '#textDrawerInput', function () {
    var text = $(this).val() || '';
    var $activeText = getActiveTextSticker();
    if ($activeText && $activeText.length) {
      $activeText.find('.placed-sticker-content').text(text);
      $activeText.attr('data-content', text);
      api.constrainLayer($activeText[0]);
      api.pushEditState();
    }
  });

  $(document).on('click', '#btnTextAddOnPhoto', function (e) {
    e.preventDefault();
    var $activeText = $('#stickerCanvasOverlay .placed-sticker--text.is-active');
    var textVal = ($('#textDrawerInput').val() || '').trim() || 'Happy Photobooth ✨';
    if ($activeText.length) {
      $activeText.find('.placed-sticker-content')
        .text(textVal)
        .css({
          'font-family': currentSelectedFont + ', cursive, sans-serif',
          'color': currentSelectedTextColor
        });
      $activeText.attr('data-content', textVal)
        .attr('data-font', currentSelectedFont)
        .attr('data-color', currentSelectedTextColor);
      api.constrainLayer($activeText[0]);
      api.pushEditState();
      closeDrawers();
    } else {
      insertNewTextSticker(textVal);
      closeDrawers();
    }
  });

  $(document).on('click', '.placed-sticker--text', function (e) {
    if ($(e.target).closest('.sticker-del-btn, .sticker-rotate-btn, .sticker-resize-btn').length) return;
    var $s = $(this);
    $('.placed-sticker').removeClass('is-active');
    $s.addClass('is-active');
    var content = $s.attr('data-content') || $s.find('.placed-sticker-content').text();
    var font = $s.attr('data-font') || $s.find('.placed-sticker-content').css('font-family');
    var col = $s.attr('data-color') || $s.find('.placed-sticker-content').css('color');
    if (content) $('#textDrawerInput').val(content);
    if (font) {
      currentSelectedFont = font.replace(/['",]/g, '').trim().split(' ')[0];
      $('.font-preview-card').removeClass('active');
      $('.font-preview-card[data-font="' + currentSelectedFont + '"]').addClass('active');
    }
    if (col) {
      currentSelectedTextColor = col;
      $('#textColorPicker').val(col);
      $('.text-swatch').removeClass('active');
      $('.text-swatch[data-color="' + col + '"]').addClass('active');
    }
  });

  $(document).on('dblclick', '.placed-sticker--text', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $s = $(this);
    var cur = $s.attr('data-content') || $s.find('.placed-sticker-content').text();
    var updated = prompt('编辑文字内容：', cur);
    if (updated !== null && updated.trim() !== '') {
      $s.find('.placed-sticker-content').text(updated.trim());
      $s.attr('data-content', updated.trim());
      $('#textDrawerInput').val(updated.trim());
      api.constrainLayer($s[0]);
      api.pushEditState();
    }
  });
})();
