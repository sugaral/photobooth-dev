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
  function frameGeometry(id, width, height) {
    var f = frames.find(function (item) {
      return item.id === id;
    });
    var w = Math.round(width),
      h = Math.round(height);
    if (!f) {
      return {
        innerX: 0,
        innerY: 0,
        innerWidth: w,
        innerHeight: h,
        padLeft: 0,
        padTop: 0,
        padRight: 0,
        padBottom: 0,
        u: Math.min(w, h) / 100
      };
    }
    var u = Math.min(w, h) / 100;
    var isPolaroid = f.pattern === 3;
    // Keep exact aspect ratio so photo is 100% undistorted and 0% covered
    var scale = isPolaroid ? 0.84 : 0.90;
    var innerWidth = Math.max(1, Math.round(w * scale));
    var innerHeight = Math.max(1, Math.round(h * scale));
    var innerX = Math.round((w - innerWidth) / 2);
    var innerY = isPolaroid ? Math.round(h * 0.05) : Math.round((h - innerHeight) / 2);
    var padBottom = h - innerY - innerHeight;
    return {
      innerX: innerX,
      innerY: innerY,
      innerWidth: innerWidth,
      innerHeight: innerHeight,
      padLeft: innerX,
      padTop: innerY,
      padRight: w - innerX - innerWidth,
      padBottom: padBottom,
      u: u
    };
  }
  function frameSvg(id, width, height, isThumb) {
    var f = frames.find(function (item) {
      return item.id === id;
    });
    if (!f) throw new Error('边框不存在，请重新选择');
    var geom = frameGeometry(id, width, height);
    var innerX = geom.innerX,
      innerY = geom.innerY,
      innerWidth = geom.innerWidth,
      innerHeight = geom.innerHeight,
      u = geom.u;
    var w = Math.round(width),
      h = Math.round(height);
    var darkPalettes = {
      'frame-2': {
        bg: '#171923',
        accent: '#E2E8F0',
        stroke: 'rgba(255,255,255,0.22)'
      },
      'frame-4': {
        bg: '#1A1D24',
        accent: '#C5D1DE',
        stroke: 'rgba(255,255,255,0.22)'
      },
      'frame-11': {
        bg: '#181A20',
        accent: '#F3F4F6',
        stroke: 'rgba(255,255,255,0.25)'
      },
      'frame-13': {
        bg: '#131620',
        accent: '#F59E0B',
        stroke: 'rgba(255,255,255,0.18)'
      },
      'frame-14': {
        bg: '#151D2C',
        accent: '#93C5FD',
        stroke: 'rgba(255,255,255,0.18)'
      },
      'frame-21': {
        bg: '#1E1B18',
        accent: '#D4AF37',
        stroke: 'rgba(255,255,255,0.2)'
      },
      'frame-22': {
        bg: '#131E2A',
        accent: '#7DD3FC',
        stroke: 'rgba(255,255,255,0.2)'
      },
      'frame-24': {
        bg: '#1E192B',
        accent: '#C084FC',
        stroke: 'rgba(255,255,255,0.2)'
      }
    };
    var lightPalettes = {
      'frame-1': {
        bg: '#FFFFFF',
        accent: '#111827',
        stroke: 'rgba(0,0,0,0.15)'
      },
      'frame-3': {
        bg: '#FDFBF7',
        accent: '#D4A853',
        stroke: 'rgba(0,0,0,0.1)'
      },
      'frame-5': {
        bg: '#FFF1F3',
        accent: '#F472B6',
        stroke: 'rgba(0,0,0,0.08)'
      },
      'frame-6': {
        bg: '#F0FDF9',
        accent: '#34D399',
        stroke: 'rgba(0,0,0,0.08)'
      },
      'frame-7': {
        bg: '#FDFCF7',
        accent: '#374151',
        stroke: 'rgba(0,0,0,0.12)'
      },
      'frame-8': {
        bg: '#FFF7F2',
        accent: '#FB923C',
        stroke: 'rgba(0,0,0,0.1)'
      },
      'frame-9': {
        bg: '#F0F9FF',
        accent: '#38BDF8',
        stroke: 'rgba(0,0,0,0.08)'
      },
      'frame-10': {
        bg: '#FDF2F8',
        accent: '#EC4899',
        stroke: 'rgba(0,0,0,0.08)'
      },
      'frame-12': {
        bg: '#EFECE6',
        accent: '#1F2937',
        stroke: 'rgba(0,0,0,0.15)'
      },
      'frame-15': {
        bg: '#FFF5F7',
        accent: '#FB7185',
        stroke: 'rgba(0,0,0,0.08)'
      },
      'frame-16': {
        bg: '#F2FBF5',
        accent: '#4ADE80',
        stroke: 'rgba(0,0,0,0.08)'
      },
      'frame-17': {
        bg: '#FDF4F9',
        accent: '#F472B6',
        stroke: 'rgba(0,0,0,0.08)'
      },
      'frame-18': {
        bg: '#F0FDFA',
        accent: '#2DD4BF',
        stroke: 'rgba(0,0,0,0.08)'
      },
      'frame-19': {
        bg: '#FAF6F0',
        accent: '#B45309',
        stroke: 'rgba(0,0,0,0.1)'
      },
      'frame-20': {
        bg: '#FFF6F4',
        accent: '#F87171',
        stroke: 'rgba(0,0,0,0.08)'
      },
      'frame-23': {
        bg: '#FAF8FC',
        accent: '#E879F9',
        stroke: 'rgba(0,0,0,0.08)'
      }
    };
    var pal = darkPalettes[f.id] || lightPalettes[f.id] || {
      bg: f.color || '#FFFFFF',
      accent: '#111827',
      stroke: 'rgba(0,0,0,0.12)'
    };
    var isDark = !!darkPalettes[f.id];

    // 1. Mat background with empty cutout for the photo
    var matPath = "M0,0 L".concat(w, ",0 L").concat(w, ",").concat(h, " L0,").concat(h, " Z M").concat(innerX, ",").concat(innerY, " L").concat(innerX + innerWidth, ",").concat(innerY, " L").concat(innerX + innerWidth, ",").concat(innerY + innerHeight, " L").concat(innerX, ",").concat(innerY + innerHeight, " Z");
    var shapes = "<path d=\"".concat(matPath, "\" fill=\"").concat(pal.bg, "\" fill-rule=\"evenodd\"/>");

    // If rendering thumbnail for drawer, fill photo aperture with light gray so the mat is obvious
    if (isThumb) {
      shapes += "<rect x=\"".concat(innerX, "\" y=\"").concat(innerY, "\" width=\"").concat(innerWidth, "\" height=\"").concat(innerHeight, "\" fill=\"").concat(isDark ? '#2D3748' : '#F1F5F9', "\"/>");
    }

    // Inner aperture border (bordering the photo without covering it)
    shapes += "<rect x=\"".concat(innerX, "\" y=\"").concat(innerY, "\" width=\"").concat(innerWidth, "\" height=\"").concat(innerHeight, "\" fill=\"none\" stroke=\"").concat(pal.stroke, "\" stroke-width=\"").concat(Math.max(1, Math.round(0.18 * u)), "\"/>");

    // Outer canvas border
    shapes += "<rect x=\"0.5\" y=\"0.5\" width=\"".concat(w - 1, "\" height=\"").concat(h - 1, "\" fill=\"none\" stroke=\"").concat(isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', "\" stroke-width=\"1\"/>");

    // Pattern-specific decorative details strictly inside outer mat:
    if (f.pattern === 1) {
      // 金色双线 / 银色双线
      var m1x = Math.round(innerX * 0.35),
        m1y = Math.round(innerY * 0.35);
      var m2x = Math.round(innerX * 0.65),
        m2y = Math.round(innerY * 0.65);
      shapes += "<rect x=\"".concat(m1x, "\" y=\"").concat(m1y, "\" width=\"").concat(w - 2 * m1x, "\" height=\"").concat(h - 2 * m1y, "\" fill=\"none\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(Math.max(1.5, Math.round(0.25 * u)), "\"/>");
      shapes += "<rect x=\"".concat(m2x, "\" y=\"").concat(m2y, "\" width=\"").concat(w - 2 * m2x, "\" height=\"").concat(h - 2 * m2y, "\" fill=\"none\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(Math.max(1, Math.round(0.12 * u)), "\"/>");
    } else if (f.pattern === 2) {
      // 樱花圆角 / 薄荷圆角
      var cr = Math.max(2, Math.round(0.4 * u));
      var corners = [[Math.round(innerX * 0.5), Math.round(innerY * 0.5)], [w - Math.round(innerX * 0.5), Math.round(innerY * 0.5)], [Math.round(innerX * 0.5), h - Math.round(innerY * 0.5)], [w - Math.round(innerX * 0.5), h - Math.round(innerY * 0.5)]];
      for (var _i = 0, _corners = corners; _i < _corners.length; _i++) {
        var _corners$_i = _slicedToArray(_corners[_i], 2),
          cx = _corners$_i[0],
          cy = _corners$_i[1];
        shapes += "<circle cx=\"".concat(cx, "\" cy=\"").concat(cy, "\" r=\"").concat(cr, "\" fill=\"").concat(pal.accent, "\"/>");
      }
      var midX = Math.round(innerX * 0.5),
        midY = Math.round(innerY * 0.5);
      shapes += "<rect x=\"".concat(midX, "\" y=\"").concat(midY, "\" width=\"").concat(w - 2 * midX, "\" height=\"").concat(h - 2 * midY, "\" rx=\"").concat(Math.round(2 * u), "\" fill=\"none\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(Math.max(1, Math.round(0.15 * u)), "\" stroke-opacity=\"0.6\"/>");
    } else if (f.pattern === 3) {
      // 奶油相纸 / 落日相纸 (Polaroid style)
      var bottomAreaH = h - innerY - innerHeight;
      var lineY = innerY + innerHeight + Math.round(bottomAreaH * 0.22);
      shapes += "<line x1=\"".concat(innerX, "\" y1=\"").concat(lineY, "\" x2=\"").concat(innerX + innerWidth, "\" y2=\"").concat(lineY, "\" stroke=\"").concat(isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', "\" stroke-width=\"1\"/>");
      var textY = innerY + innerHeight + Math.round(bottomAreaH * 0.65);
      var fontSize = Math.max(9, Math.round(0.85 * u));
      shapes += "<text x=\"".concat(w / 2, "\" y=\"").concat(textY, "\" text-anchor=\"middle\" font-family=\"'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif\" font-size=\"").concat(fontSize, "\" font-weight=\"700\" fill=\"").concat(isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)', "\" letter-spacing=\"").concat(Math.round(0.15 * u), "\">PHOTOBOOTH \xB7 MEMORY</text>");
    } else if (f.pattern === 4) {
      // 天空虚线 / 莓果虚线
      var _midX = Math.round(innerX * 0.5),
        _midY = Math.round(innerY * 0.5);
      var dash = Math.max(4, Math.round(0.8 * u));
      shapes += "<rect x=\"".concat(_midX, "\" y=\"").concat(_midY, "\" width=\"").concat(w - 2 * _midX, "\" height=\"").concat(h - 2 * _midY, "\" fill=\"none\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(Math.max(1.5, Math.round(0.22 * u)), "\" stroke-dasharray=\"").concat(dash, " ").concat(dash * 0.75, "\"/>");
    } else if (f.pattern === 5) {
      // 胶片齿孔 / 黑白齿孔 (35mm film)
      var sw = Math.max(7, Math.round(1.1 * u));
      var sh = Math.max(9, Math.round(1.4 * u));
      var step = Math.round(sw * 2.3);
      var topY = Math.round((innerY - sh) / 2);
      var botY = innerY + innerHeight + Math.round((h - innerY - innerHeight - sh) / 2);
      for (var x = innerX; x <= innerX + innerWidth - sw; x += step) {
        shapes += "<rect x=\"".concat(x, "\" y=\"").concat(topY, "\" width=\"").concat(sw, "\" height=\"").concat(sh, "\" rx=\"").concat(Math.round(sw * 0.2), "\" fill=\"").concat(pal.accent, "\" opacity=\"0.88\"/>");
        shapes += "<rect x=\"".concat(x, "\" y=\"").concat(botY, "\" width=\"").concat(sw, "\" height=\"").concat(sh, "\" rx=\"").concat(Math.round(sw * 0.2), "\" fill=\"").concat(pal.accent, "\" opacity=\"0.88\"/>");
      }
    } else if (f.pattern === 6) {
      // 星光角饰 / 月夜角饰
      var sr = Math.max(5, Math.round(1.0 * u));
      var _corners2 = [[Math.round(innerX * 0.5), Math.round(innerY * 0.5)], [w - Math.round(innerX * 0.5), Math.round(innerY * 0.5)], [Math.round(innerX * 0.5), h - Math.round(innerY * 0.5)], [w - Math.round(innerX * 0.5), h - Math.round(innerY * 0.5)]];
      for (var _i2 = 0, _corners3 = _corners2; _i2 < _corners3.length; _i2++) {
        var _corners3$_i = _slicedToArray(_corners3[_i2], 2),
          _cx = _corners3$_i[0],
          _cy = _corners3$_i[1];
        shapes += "<path d=\"M".concat(_cx, ",").concat(_cy - sr, " Q").concat(_cx, ",").concat(_cy, " ").concat(_cx + sr, ",").concat(_cy, " Q").concat(_cx, ",").concat(_cy, " ").concat(_cx, ",").concat(_cy + sr, " Q").concat(_cx, ",").concat(_cy, " ").concat(_cx - sr, ",").concat(_cy, " Q").concat(_cx, ",").concat(_cy, " ").concat(_cx, ",").concat(_cy - sr, " Z\" fill=\"").concat(pal.accent, "\"/>");
      }
    } else if (f.pattern === 7) {
      // 花语 / 春芽
      var fr = Math.max(2.5, Math.round(0.35 * u));
      var _corners4 = [[Math.round(innerX * 0.5), Math.round(innerY * 0.5)], [w - Math.round(innerX * 0.5), Math.round(innerY * 0.5)], [Math.round(innerX * 0.5), h - Math.round(innerY * 0.5)], [w - Math.round(innerX * 0.5), h - Math.round(innerY * 0.5)]];
      for (var _i3 = 0, _corners5 = _corners4; _i3 < _corners5.length; _i3++) {
        var _corners5$_i = _slicedToArray(_corners5[_i3], 2),
          _cx2 = _corners5$_i[0],
          _cy2 = _corners5$_i[1];
        shapes += "<circle cx=\"".concat(_cx2 - fr, "\" cy=\"").concat(_cy2, "\" r=\"").concat(fr, "\" fill=\"").concat(pal.accent, "\" opacity=\"0.8\"/>");
        shapes += "<circle cx=\"".concat(_cx2 + fr, "\" cy=\"").concat(_cy2, "\" r=\"").concat(fr, "\" fill=\"").concat(pal.accent, "\" opacity=\"0.8\"/>");
        shapes += "<circle cx=\"".concat(_cx2, "\" cy=\"").concat(_cy2 - fr, "\" r=\"").concat(fr, "\" fill=\"").concat(pal.accent, "\" opacity=\"0.8\"/>");
        shapes += "<circle cx=\"".concat(_cx2, "\" cy=\"").concat(_cy2 + fr, "\" r=\"").concat(fr, "\" fill=\"").concat(pal.accent, "\" opacity=\"0.8\"/>");
        shapes += "<circle cx=\"".concat(_cx2, "\" cy=\"").concat(_cy2, "\" r=\"").concat(fr * 0.55, "\" fill=\"").concat(isDark ? '#FFFFFF' : '#FFD93D', "\"/>");
      }
    } else if (f.pattern === 8) {
      // 糖果波点 / 海盐波点
      var dotR = Math.max(2, Math.round(0.25 * u));
      var _step = Math.max(12, Math.round(1.8 * u));
      var _topY = Math.round(innerY * 0.5);
      var _botY = innerY + innerHeight + Math.round((h - innerY - innerHeight) * 0.5);
      for (var _x = innerX + Math.round(_step * 0.5); _x < innerX + innerWidth; _x += _step) {
        shapes += "<circle cx=\"".concat(_x, "\" cy=\"").concat(_topY, "\" r=\"").concat(dotR, "\" fill=\"").concat(pal.accent, "\"/>");
        shapes += "<circle cx=\"".concat(_x, "\" cy=\"").concat(_botY, "\" r=\"").concat(dotR, "\" fill=\"").concat(pal.accent, "\"/>");
      }
    } else if (f.pattern === 9) {
      // 复古斜纹 / 珊瑚斜纹
      var _step2 = Math.max(10, Math.round(1.5 * u));
      var strokeW = Math.max(1, Math.round(0.18 * u));
      var _topY2 = Math.round(innerY * 0.5);
      var _botY2 = innerY + innerHeight + Math.round((h - innerY - innerHeight) * 0.5);
      for (var _x2 = innerX; _x2 <= innerX + innerWidth - _step2; _x2 += _step2) {
        shapes += "<line x1=\"".concat(_x2, "\" y1=\"").concat(_topY2 - Math.round(0.5 * u), "\" x2=\"").concat(_x2 + Math.round(0.8 * u), "\" y2=\"").concat(_topY2 + Math.round(0.5 * u), "\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(strokeW, "\" stroke-linecap=\"round\"/>");
        shapes += "<line x1=\"".concat(_x2, "\" y1=\"").concat(_botY2 - Math.round(0.5 * u), "\" x2=\"").concat(_x2 + Math.round(0.8 * u), "\" y2=\"").concat(_botY2 + Math.round(0.5 * u), "\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(strokeW, "\" stroke-linecap=\"round\"/>");
      }
    } else if (f.pattern === 10) {
      // 典雅四角 / 冰蓝四角
      var arm = Math.max(10, Math.round(1.8 * u));
      var _strokeW = Math.max(1.5, Math.round(0.25 * u));
      var mX = Math.round(innerX * 0.4),
        mY = Math.round(innerY * 0.4);
      shapes += "<path d=\"M".concat(mX, ",").concat(mY + arm, " L").concat(mX, ",").concat(mY, " L").concat(mX + arm, ",").concat(mY, "\" fill=\"none\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(_strokeW, "\"/>");
      shapes += "<path d=\"M".concat(w - mX - arm, ",").concat(mY, " L").concat(w - mX, ",").concat(mY, " L").concat(w - mX, ",").concat(mY + arm, "\" fill=\"none\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(_strokeW, "\"/>");
      shapes += "<path d=\"M".concat(mX, ",").concat(h - mY - arm, " L").concat(mX, ",").concat(h - mY, " L").concat(mX + arm, ",").concat(h - mY, "\" fill=\"none\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(_strokeW, "\"/>");
      shapes += "<path d=\"M".concat(w - mX - arm, ",").concat(h - mY, " L").concat(w - mX, ",").concat(h - mY, " L").concat(w - mX, ",").concat(h - mY - arm, "\" fill=\"none\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(_strokeW, "\"/>");
    } else if (f.pattern === 11) {
      // 彩虹阶梯 / 暮色阶梯
      var _strokeW2 = Math.max(1, Math.round(0.18 * u));
      for (var _step3 = 1; _step3 <= 3; _step3++) {
        var off = _step3 * Math.round(0.35 * u);
        var _arm = Math.max(6, Math.round(1.4 * u)) - _step3 * Math.round(0.25 * u);
        var _mX = Math.round(innerX * 0.3) + off,
          _mY = Math.round(innerY * 0.3) + off;
        shapes += "<path d=\"M".concat(_mX, ",").concat(_mY + _arm, " L").concat(_mX, ",").concat(_mY, " L").concat(_mX + _arm, ",").concat(_mY, "\" fill=\"none\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(_strokeW2, "\" opacity=\"").concat(1 - _step3 * 0.2, "\"/>");
        shapes += "<path d=\"M".concat(w - _mX - _arm, ",").concat(_mY, " L").concat(w - _mX, ",").concat(_mY, " L").concat(w - _mX, ",").concat(_mY + _arm, "\" fill=\"none\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(_strokeW2, "\" opacity=\"").concat(1 - _step3 * 0.2, "\"/>");
        shapes += "<path d=\"M".concat(_mX, ",").concat(h - _mY - _arm, " L").concat(_mX, ",").concat(h - _mY, " L").concat(_mX + _arm, ",").concat(h - _mY, "\" fill=\"none\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(_strokeW2, "\" opacity=\"").concat(1 - _step3 * 0.2, "\"/>");
        shapes += "<path d=\"M".concat(w - _mX - _arm, ",").concat(h - _mY, " L").concat(w - _mX, ",").concat(h - _mY, " L").concat(w - _mX, ",").concat(h - _mY - _arm, "\" fill=\"none\" stroke=\"").concat(pal.accent, "\" stroke-width=\"").concat(_strokeW2, "\" opacity=\"").concat(1 - _step3 * 0.2, "\"/>");
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
    frameSvg: frameSvg,
    frameGeometry: frameGeometry
  });
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object') module.exports = root.PhotoboothCatalog;
})(globalThis);