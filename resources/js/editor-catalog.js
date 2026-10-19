"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* One color recipe for camera preview, editor preview and Canvas export. */
(function (root) {
  'use strict';

  var sample = 'resources/img/filter_model_thumb.jpg';
  var rows = [['plain', '原图', '基础', 'none'], ['grayscale', '经典黑白', '黑白', 'grayscale(1)'], ['vintage', '复古胶片', '胶片', 'sepia(.35) contrast(1.25) saturate(1.15)'], ['antique', '旧日暖阳', '胶片', 'sepia(.65) contrast(.9) brightness(1.05) saturate(1.2)'], ['cool', '清冷', '清透', 'saturate(.8) hue-rotate(12deg) brightness(1.06)'], ['summer', '盛夏', '鲜艳', 'saturate(1.6) brightness(1.05) hue-rotate(-15deg)'], ['washed', '奶油日系', '清透', 'brightness(1.15) contrast(.85) saturate(.8)'], ['smooth', '柔和', '清透', 'contrast(.86) brightness(1.06) saturate(.92)'], ['pink', '樱粉', '氛围', 'sepia(.2) hue-rotate(320deg) saturate(1.3) brightness(1.08)'], ['blue', '蓝调', '氛围', 'sepia(.3) hue-rotate(175deg) saturate(1.3)'], ['amber', '琥珀', '暖色', 'sepia(.45) saturate(1.5) contrast(1.08)'], ['peach', '蜜桃', '暖色', 'sepia(.2) hue-rotate(340deg) saturate(1.2) brightness(1.12)'], ['honey', '蜂蜜', '暖色', 'sepia(.3) saturate(1.4) brightness(1.07)'], ['sunset', '落日', '暖色', 'sepia(.5) hue-rotate(345deg) saturate(1.5) contrast(1.12)'], ['cocoa', '可可', '暖色', 'sepia(.5) saturate(.8) brightness(.9) contrast(1.1)'], ['rose', '玫瑰', '氛围', 'sepia(.35) hue-rotate(315deg) saturate(1.3) contrast(1.05)'], ['lavender', '薰衣草', '氛围', 'sepia(.25) hue-rotate(230deg) saturate(1.4) brightness(1.08)'], ['mint', '薄荷', '清透', 'sepia(.2) hue-rotate(70deg) saturate(.9) brightness(1.12)'], ['ice', '冰川', '清透', 'sepia(.2) hue-rotate(160deg) saturate(.65) brightness(1.15) contrast(.95)'], ['forest', '森林', '氛围', 'sepia(.35) hue-rotate(60deg) saturate(.8) contrast(1.12)'], ['ocean', '深海', '氛围', 'sepia(.4) hue-rotate(155deg) saturate(1.2) brightness(.9)'], ['cinema', '电影', '胶片', 'contrast(1.25) saturate(.65) sepia(.12)'], ['noir', '黑色电影', '黑白', 'grayscale(1) contrast(1.5) brightness(.9)'], ['silver', '银盐', '黑白', 'grayscale(1) contrast(1.12) brightness(1.12)'], ['matte', '哑光黑白', '黑白', 'grayscale(1) contrast(.7) brightness(1.08)'], ['sepia', '怀旧棕', '胶片', 'sepia(1) contrast(1.1)'], ['retro', '港风', '胶片', 'sepia(.45) contrast(1.2) brightness(.95) saturate(1.1)'], ['fade', '褪色记忆', '胶片', 'sepia(.25) contrast(.75) saturate(.65) brightness(1.1)'], ['polaroid', '拍立得', '胶片', 'sepia(.15) contrast(1.15) saturate(.85) brightness(1.08)'], ['pop', '波普', '鲜艳', 'contrast(1.2) saturate(1.9)'], ['citrus', '柑橘', '鲜艳', 'sepia(.3) hue-rotate(15deg) saturate(1.7) brightness(1.1)'], ['cherry', '樱桃', '鲜艳', 'sepia(.2) hue-rotate(330deg) saturate(1.8) contrast(1.12)'], ['emerald', '翡翠', '鲜艳', 'sepia(.35) hue-rotate(90deg) saturate(1.6) contrast(1.15)'], ['neon', '霓虹', '鲜艳', 'hue-rotate(275deg) saturate(1.8) contrast(1.25)'], ['moon', '月光', '氛围', 'saturate(.45) brightness(.9) contrast(1.2) sepia(.12)'], ['bright', '晴空', '清透', 'brightness(1.18) contrast(1.06) saturate(1.1)'], ['quiet', '静谧', '清透', 'saturate(.55) contrast(.95) brightness(1.04)']];
  var filters = rows.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 4),
      id = _ref2[0],
      name = _ref2[1],
      category = _ref2[2],
      css = _ref2[3];
    return Object.freeze({
      id: id,
      name: name,
      category: category,
      css: css
    });
  });
  var filterMap = Object.freeze(Object.fromEntries(filters.map(function (f) {
    return [f.id, f.css];
  })));
  var frameNames = ['纯白留影', '黑色画廊', '金色双线', '银色双线', '樱花圆角', '薄荷圆角', '奶油相纸', '落日相纸', '天空虚线', '莓果虚线', '胶片齿孔', '黑白齿孔', '星光角饰', '月夜角饰', '花语', '春芽', '糖果波点', '海盐波点', '复古斜纹', '珊瑚斜纹', '典雅四角', '冰蓝四角', '彩虹阶梯', '暮色阶梯'];
  var colors = ['#ffffff', '#171923', '#d4a853', '#a7b4c4', '#f29fb0', '#78bda8', '#fff3d6', '#edb083', '#83bbdf', '#cb789e', '#202534', '#ece5dc', '#f4c75a', '#728dc9', '#f6a4b8', '#78aa86', '#e495ba', '#78c9d3', '#ba8a59', '#e2947c', '#d6bd84', '#9ac2d7', '#eaa4cb', '#a99cce'];
  var frames = frameNames.map(function (name, i) {
    return Object.freeze({
      id: 'frame-' + (i + 1),
      name: name,
      color: colors[i],
      pattern: Math.floor(i / 2)
    });
  });
  var svgUrl = function svgUrl(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };
  function frameSvg(id, width, height) {
    var f = frames.find(function (item) {
      return item.id === id;
    });
    if (!f) throw new Error('边框不存在，请重新选择');
    var w = Math.round(width),
      h = Math.round(height),
      u = Math.min(w, h) / 100;
    var shapes = "<rect x=\"".concat(u, "\" y=\"").concat(u, "\" width=\"").concat(w - 2 * u, "\" height=\"").concat(h - 2 * u, "\" rx=\"").concat(f.pattern === 2 ? 6 * u : 0, "\" fill=\"none\" stroke=\"").concat(f.color, "\" stroke-width=\"").concat(f.pattern === 3 ? 5 * u : 2 * u, "\" ").concat(f.pattern === 4 ? "stroke-dasharray=\"".concat(3 * u, " ").concat(2 * u, "\"") : '', "/>");
    if ([1, 3, 10, 11].includes(f.pattern)) shapes += "<rect x=\"".concat(4 * u, "\" y=\"").concat(4 * u, "\" width=\"").concat(w - 8 * u, "\" height=\"").concat(h - 8 * u, "\" fill=\"none\" stroke=\"").concat(f.color, "\" stroke-width=\"").concat(.5 * u, "\"/>");
    if (f.pattern === 3) shapes += "<rect x=\"0\" y=\"".concat(h - 9 * u, "\" width=\"").concat(w, "\" height=\"").concat(9 * u, "\" fill=\"").concat(f.color, "\"/>");
    if (f.pattern >= 5) {
      for (var x = 6 * u; x < w - 4 * u; x += 8 * u) {
        for (var _i = 0, _arr = [2 * u, h - 2 * u]; _i < _arr.length; _i++) {
          var y = _arr[_i];
          if (f.pattern === 5) shapes += "<rect x=\"".concat(x, "\" y=\"").concat(y - u, "\" width=\"").concat(2 * u, "\" height=\"").concat(2 * u, "\" rx=\"").concat(u / 3, "\" fill=\"").concat(f.color, "\"/>");else if ([8, 9, 11].includes(f.pattern)) shapes += "<path d=\"M".concat(x - u, ",").concat(y - u, " l").concat(2 * u, ",").concat(2 * u, "\" stroke=\"").concat(f.color, "\" stroke-width=\"").concat(u, "\"/>");else shapes += "<circle cx=\"".concat(x, "\" cy=\"").concat(y, "\" r=\"").concat(u, "\" fill=\"").concat(f.color, "\"/>");
        }
      }
      if ([6, 7, 10].includes(f.pattern)) for (var _i2 = 0, _arr2 = [[5 * u, 5 * u], [w - 5 * u, 5 * u], [5 * u, h - 5 * u], [w - 5 * u, h - 5 * u]]; _i2 < _arr2.length; _i2++) {
        var _arr2$_i = _slicedToArray(_arr2[_i2], 2),
          _x = _arr2$_i[0],
          _y = _arr2$_i[1];
        shapes += "<path d=\"M".concat(_x - 3 * u, ",").concat(_y, " Q").concat(_x, ",").concat(_y - 7 * u, " ").concat(_x + 3 * u, ",").concat(_y, " Q").concat(_x, ",").concat(_y + 7 * u, " ").concat(_x - 3 * u, ",").concat(_y, "Z\" fill=\"").concat(f.color, "\"/>");
      }
    }
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"".concat(w, "\" height=\"").concat(h, "\" viewBox=\"0 0 ").concat(w, " ").concat(h, "\">").concat(shapes, "</svg>");
  }
  root.PhotoboothCatalog = Object.freeze({
    filters: filters,
    filterMap: filterMap,
    frames: frames,
    sample: sample,
    svgUrl: svgUrl,
    frameSvg: frameSvg
  });
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object') module.exports = root.PhotoboothCatalog;
})(globalThis);
