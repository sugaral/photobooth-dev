"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* globals photoboothTools */
$(function () {
  var startPreloaded = $('#start_preloaded').val() === '1';
  if (startPreloaded) {
    loadCurrentConfig();
  } else {
    changeGeneralSetting();
  }
});

// triggers
$(window).on('resize', changeGeneralSetting);
$('[data-trigger=\'general\']').change(changeGeneralSetting);
$('[data-trigger=\'image\']').change(handleInputUpdate);
$('#loadCurrentConfiguration').click(loadCurrentConfig);
function toPublicUrl(path) {
  if (!path) {
    return '';
  }
  if (path.startsWith('http') || path.startsWith('//')) {
    return path;
  }

  // remove trailing slash from baseUrl
  var baseUrl = environment.baseUrl.replace(/\/$/, '');
  // remove leading slash from requested path and concatenate with baseUrl
  return "".concat(baseUrl, "/").concat(path.replace(/^\//, ''));
}
function loadCurrentConfig() {
  //loading the configuration just like in the backend
  var current_config = JSON.parse($('#current_config').val());
  var collageConfig = config.collage;
  var textConfig = config.textoncollage;
  var collage_height = 1200;
  var collage_width = 1800;
  var layout = current_config;
  var backgroundImage = collageConfig.background;
  var show_bg = backgroundImage ? true : false;
  var backgroundColor = collageConfig.background_color;
  var frameImage = collageConfig.frame;
  var show_frame = frameImage ? true : false;
  var applyFrame = collageConfig.take_frame;
  var placeholder = collageConfig.placeholder;
  var placeholderpath = collageConfig.placeholderpath;
  var placeholderposition = collageConfig.placeholderposition;
  var text_enabled = textConfig.enabled;
  var font_family = textConfig.font;
  var font_color = textConfig.font_color;
  var font_size = textConfig.font_size;
  var line1 = textConfig.line1;
  var line2 = textConfig.line2;
  var line3 = textConfig.line3;
  var linespace = textConfig.linespace;
  var locationX = textConfig.locationx;
  var locationY = textConfig.locationy;
  var text_rotation = textConfig.rotation;
  if (!Array.isArray(current_config)) {
    collage_width = current_config.width;
    collage_height = current_config.height;
    layout = current_config.layout;
    backgroundImage = current_config.background;
    show_bg = backgroundImage ? true : false;
    backgroundColor = current_config.background_color;
    frameImage = current_config.frame;
    show_frame = frameImage ? true : false;
    applyFrame = current_config.apply_frame;
    placeholder = current_config.placeholder;
    placeholderpath = current_config.placeholderpath;
    placeholderposition = current_config.placeholderposition;
    text_enabled = current_config.text_custom_style;
    font_family = current_config.text_font;
    font_color = current_config.text_font_color;
    font_size = current_config.text_font_size;
    line1 = current_config.text_line1;
    line2 = current_config.text_line2;
    line3 = current_config.text_line3;
    linespace = current_config.text_linespace;
    locationX = current_config.text_locationx;
    locationY = current_config.text_locationy;
    text_rotation = current_config.text_rotation;
  }

  //populate the inputs
  //general
  $('input[name=\'final_width\']').val(collage_width);
  $('input[name=\'final_height\']').val(collage_height);
  $('input[name=\'background_color\']').val(backgroundColor);
  $('input[name=\'generator-background\']').attr('value', backgroundImage);
  $('input[name=\'generator-background\']').parents('.adminImageSelection').find('.adminImageSelection-preview').attr('src', toPublicUrl(backgroundImage));
  $('input[name=\'show-background\'][data-trigger=\'general\']').prop('checked', show_bg);
  $('input[name=\'generator-frame\']').attr('value', frameImage);
  $('input[name=\'generator-frame\']').parents('.adminImageSelection').find('.adminImageSelection-preview').attr('src', toPublicUrl(frameImage));
  $('input[name=\'show-frame\'][data-trigger=\'general\']').prop('checked', show_frame);
  $('select[name=\'apply_frame\']').val(applyFrame);

  //placeholder
  $('input[name=\'placeholder_image_position\']').val(placeholderposition);
  $('input[name=\'placeholder_image\']').attr('value', placeholderpath);
  $('input[name=\'placeholder_image\']').parents('.adminImageSelection').find('.adminImageSelection-preview').attr('src', toPublicUrl(placeholderpath));
  $('input[name=\'enable_placeholder_image\'][data-trigger=\'general\']').prop('checked', placeholder);

  //text
  $('input[name=\'text_enabled\'][data-trigger=\'general\']').prop('checked', text_enabled);
  $('input[name=\'text_font_family\']').val(font_family);
  $('input[name=\'text_font_family\']')[0].setAttribute('data-fontclass', 'font-selected');
  var font_family_public = toPublicUrl(font_family);
  $('#fontselectedStyle').html("@font-face{font-family:\"fontselected\";src:url(".concat(font_family_public, ") format(\"truetype\");} .font-selected{font-family:\"fontselected\",Verdena,Tahoma;}"));
  $('input[name=\'text_font_color\']').attr('value', font_color);
  $('input[name=\'text_font_size\']').attr('value', font_size);
  $('input[name=\'text_line_1\']').attr('value', line1);
  $('input[name=\'text_line_2\']').attr('value', line2);
  $('input[name=\'text_line_3\']').attr('value', line3);
  $('input[name=\'text_line_space\']').attr('value', linespace);
  $('input[name=\'text_location_x\']').attr('value', locationX);
  $('input[name=\'text_location_y\']').attr('value', locationY);
  $('input[name=\'text_rotation\']').attr('value', text_rotation);
  $('input[name=\'text_rotation\']').parent().find('span:first').text(text_rotation);

  //hide images and image settings
  $('#result_canvas').find('div[id^=\'picture-\']').addClass('hidden');
  $('#layout_containers').find('div[data-picture^=\'picture-\']').addClass('hidden');
  var _loop = function _loop(i) {
    var identifier = 'picture-' + i;
    var inputLayout = $('div[data-picture=\'' + identifier + '\']');
    inputLayout.removeClass('hidden');
    var exampleImage = $('#' + identifier);
    exampleImage.removeClass('hidden');
    inputLayout.find('input:not([type=hidden])').each(function (propertyPosition) {
      var inputType = $(this).attr('type');
      if (inputType === 'range') {
        $(this).parent().find('span:first').text(layout[i][propertyPosition]);
      } else if (inputType === 'checkbox') {
        $(this).prop('checked', layout[i][propertyPosition]);
      }
      if (propertyPosition !== 5) {
        $(this).val(layout[i][propertyPosition]);
      }
    });
  };
  for (var i = 0; i < layout.length; i++) {
    _loop(i);
  }

  //start rendering
  changeGeneralSetting();
}
function changeGeneralSetting() {
  var c_width = $('input[name=\'final_width\']').val();
  var c_height = $('input[name=\'final_height\']').val();
  var c_bg_color = $('input[name=\'background_color\']').val();
  var c_bg = $('input[name=\'generator-background\']').val();
  var c_frame = $('input[name=\'generator-frame\']').val();
  var c_bg_public = toPublicUrl(c_bg);
  var c_frame_public = toPublicUrl(c_frame);
  var c_apply_frame = $('select[name=\'apply_frame\']').val();
  var c_show_frame = $('input[name=\'show-frame\'][data-trigger=\'general\']').is(':checked');
  var c_show_background = $('input[name=\'show-background\'][data-trigger=\'general\']').is(':checked');
  var c_text_enabled = $('input[name=\'text_enabled\'][data-trigger=\'general\']').is(':checked');
  var c_text_font = $('input[name=\'text_font_family\']')[0].getAttribute('data-fontclass');
  var c_text_font_unique_id = $('input[name=\'text_font_family\']').data('unique-id');
  var c_text_font_value = toPublicUrl($('input[name=\'text_font_family\']').val());
  var c_font_color = $('input[name=\'text_font_color\']').val();
  var c_font_size = $('input[name=\'text_font_size\']').val();
  var c_text_1 = $('input[name=\'text_line_1\']').val();
  var c_text_2 = $('input[name=\'text_line_2\']').val();
  var c_text_3 = $('input[name=\'text_line_3\']').val();
  var c_text_space = $('input[name=\'text_line_space\']').val();
  var c_text_top = $('input[name=\'text_location_y\']').val();
  var c_text_left = $('input[name=\'text_location_x\']').val();
  var c_text_rotation = -parseInt($('input[name=\'text_rotation\']').val(), 10);
  var aspect_ratio = c_width / c_height;
  var canvasDOM = $('#result_canvas');
  canvasDOM.css('aspect-ratio', aspect_ratio);
  canvasDOM.css('background-color', c_bg_color);
  canvasDOM.find('div#collage_background img').attr('src', c_bg_public);
  canvasDOM.find('div#collage_background img').addClass('hidden');
  if (c_show_background) {
    canvasDOM.find('div#collage_background img').removeClass('hidden');
  }
  var collageImgs = canvasDOM.find('div#collage_frame img');
  var pictureFrameImgs = canvasDOM.find('img.picture-frame');
  var allImgs = collageImgs.add(pictureFrameImgs);
  allImgs.attr('src', c_frame_public).addClass('hidden');
  if (c_show_frame) {
    allImgs.removeClass('hidden');
    if (c_apply_frame === 'always') {
      collageImgs.addClass('hidden');
    } else if (c_apply_frame === 'once') {
      pictureFrameImgs.addClass('hidden');
    } else {
      allImgs.addClass('hidden');
    }
  }
  var canvas_width = canvasDOM.width();
  var canvas_height = canvasDOM.height();
  var adjusted_tfs = c_font_size * canvas_height / c_height;
  var adjusted_tt = c_text_top * canvas_height / c_height;
  var adjusted_tl = c_text_left * canvas_width / c_width;
  var adjusted_tls = c_text_space * canvas_height / c_height;
  var real_text_top = function real_text_top(i) {
    return i * adjusted_tls - adjusted_tfs;
  };
  var real_text_left = function real_text_left(i) {
    return i * adjusted_tls;
  };
  var collageTextDOM = $('#collage_text');
  collageTextDOM.css({
    'font-size': adjusted_tfs + 'pt',
    color: c_font_color,
    top: adjusted_tt + 'px',
    left: adjusted_tl + 'px'
  });
  if (c_text_font_value.startsWith('http')) {
    c_text_font = "font-".concat(c_text_font_unique_id);
    $('#fontselectedStyle').html("@font-face{font-family:\"fontselected\";src:url(".concat(c_text_font_value, ") format(\"truetype\");} .").concat(c_text_font, "{font-family:\"fontselected\",Verdena,Tahoma;}"));
  }
  collageTextDOM.removeClass(function (index, classes) {
    return classes.split(' ').filter(function (cName) {
      return cName.startsWith('font-');
    }).join(' ');
  });
  collageTextDOM.addClass(c_text_font);
  collageTextDOM.find('.text-line-1').css({
    transform: 'rotate(' + c_text_rotation + 'deg)',
    top: real_text_top(0) + 'px'
  }).html(c_text_1.replace(/ /g, "\xA0"));
  collageTextDOM.find('.text-line-2').css({
    transform: 'rotate(' + c_text_rotation + 'deg)',
    top: (c_text_rotation > -45 && c_text_rotation < 45 ? real_text_top(1) : real_text_top(0)) + 'px',
    left: (c_text_rotation > -45 && c_text_rotation < 45 ? real_text_left(0) : real_text_left(1)) + 'px'
  }).html(c_text_2.replace(/ /g, "\xA0"));
  collageTextDOM.find('.text-line-3').css({
    transform: 'rotate(' + c_text_rotation + 'deg)',
    top: (c_text_rotation > -45 && c_text_rotation < 45 ? real_text_top(2) : real_text_top(0)) + 'px',
    left: (c_text_rotation > -45 && c_text_rotation < 45 ? real_text_left(0) : real_text_left(2)) + 'px'
  }).html(c_text_3.replace(/ /g, "\xA0"));
  collageTextDOM.addClass('hidden');
  if (c_text_enabled) {
    collageTextDOM.removeClass('hidden');
  }
  for (var i = 0; i < 5; i++) {
    updateImage(i);
  }
}
function handleInputUpdate() {
  var modifiedInput = $(this);
  var inputName = modifiedInput.attr('name');
  var settingsContainerId = inputName.split('-').pop();
  updateImage(settingsContainerId);
}
function updateImage(containerId) {
  var settingsContainer = $('div[data-picture=\'picture-' + containerId + '\']');
  var placeholder = $('input[name=\'enable_placeholder_image\']').is(':checked');
  var placeholder_image_position = parseInt($('input[name=\'placeholder_image_position\']').val(), 10);
  var changepath = placeholder && placeholder_image_position === containerId + 1;
  settingsContainer.find('input').each(function () {
    var prop_name = $(this).data('prop');
    var new_value = $(this).val();
    if (prop_name === 'single_frame') {
      new_value = $(this).is(':checked');
    }
    if (prop_name) {
      changeImageSetting(new_value, prop_name, containerId, changepath);
    }
  });
}
function changeImageSetting(new_value, prop_name, index, isPlaceholder) {
  var canvas_width = $('#result_canvas').width();
  var canvas_height = $('#result_canvas').height();
  var img_container = $('#picture-' + index);
  var contImages = img_container.find('img');
  var firstImg = contImages.first();
  if (isPlaceholder) {
    firstImg.attr('src', toPublicUrl($('input[name=\'placeholder_image\']').val()));
  } else {
    firstImg.attr('src', firstImg.data('src'));
  }
  if (prop_name === 'transform') {
    var angle = -parseInt(new_value, 10);
    contImages.css(prop_name, 'rotate(' + angle + 'deg)');
    contImages.css('transform-origin', angle > 0 ? 'top right' : 'top left');
    var contW = img_container.width();
    var contH = img_container.height();
    var ar = contW / contH;
    var brute_force = angle > -80 && angle < 80 ? 100 : 200;
    var _calculateImgDimensio = calculateImgDimensions(contW, contH, angle, ar, 1, {}, brute_force),
      imgW = _calculateImgDimensio.imgW,
      imgH = _calculateImgDimensio.imgH,
      newContW = _calculateImgDimensio.newContW,
      fromTop = _calculateImgDimensio.fromTop,
      fromHori = _calculateImgDimensio.fromHori;
    contImages.height(imgH);
    contImages.width(imgW);
    contImages.css('top', Math.min(fromTop, 2 * contH));
    contImages.css(angle > 0 ? 'right' : 'left', fromHori || 0);
    contImages.css(angle < 0 ? 'right' : 'left', '');
    img_container.width(newContW);
  } else if (prop_name === 'single_frame') {
    contImages.last().addClass('hidden');
    if (new_value && $('select[name=\'apply_frame\']').val() === 'always') {
      contImages.last().removeClass('hidden');
    }
  } else {
    var clean_operation = new_value.replace('x', canvas_width).replace('y', canvas_height);
    var processed_value = calculate(tokenize(clean_operation));
    if (new_value == processed_value) {
      // == and NOT === because one is a string and the other is a number
      var collage_width = $('input[name=\'final_width\']').val();
      var collage_height = $('input[name=\'final_height\']').val();
      if (['width', 'left'].includes(prop_name)) {
        processed_value = new_value * canvas_width / collage_width;
      } else if (['height', 'top'].includes(prop_name)) {
        processed_value = new_value * canvas_height / collage_height;
      }
    }
    img_container.css(prop_name, processed_value + 'px');
  }
}
function calculateImgDimensions(width, height, angle, aspect_ratio, times, best_guess, brute_force) {
  if ([0, -180, 180].includes(angle)) {
    return {
      imgW: width,
      imgH: height,
      fromTop: angle === 0 ? 0 : height,
      fromHori: width
    };
  } else if (Math.abs(angle) === 90) {
    var small_side = Math.min(width, height);
    return {
      imgW: small_side,
      imgH: small_side / aspect_ratio,
      newContW: small_side / aspect_ratio,
      fromTop: small_side,
      fromHori: 0
    };
  }
  var angleCos = Math.abs(Math.cos(angle * Math.PI / 180));
  var angleSin = Math.abs(Math.sin(angle * Math.PI / 180));
  var imgW = width / angleCos;
  var imgH = imgW / aspect_ratio;
  var smallCatet = Math.sqrt(Math.pow(imgW, 2) - Math.pow(width, 2));
  var largeCatet = imgH * angleCos;
  var newContW = imgW * angleCos + imgH * angleSin;
  var fromTop = smallCatet + (angle > -90 && angle < 90 ? 0 : largeCatet);
  var fromHori = angle < -90 || angle > 90 ? imgW * angleCos : null;
  var quality = 1 - (largeCatet + smallCatet) / height;
  if (Math.abs(quality) <= 0.001) {
    return {
      imgW: imgW,
      imgH: imgH,
      newContW: newContW,
      fromTop: fromTop,
      fromHori: fromHori
    };
  } else {
    if (times < brute_force) {
      var factor = quality > 0 ? 1.05 : 0.95;
      var new_best_guess = {
        quality: Math.abs(quality),
        imgW: imgW,
        imgH: imgH,
        newContW: newContW,
        fromTop: fromTop,
        fromHori: fromHori
      };
      if (best_guess) {
        if (best_guess.quality < new_best_guess.quality) {
          new_best_guess = _objectSpread({}, best_guess);
        }
      }
      return calculateImgDimensions(width * factor, height, angle, aspect_ratio, times + 1, new_best_guess, brute_force);
    }
  }
  console.log('brute force not work! ', {
    quality: quality,
    angle: angle
  });
  return {
    imgW: best_guess.imgW,
    imgH: best_guess.imgH,
    newContW: best_guess.newContW,
    fromTop: best_guess.fromTop,
    fromHori: best_guess.fromHori
  };
}
$('#addImage').click(function () {
  var layout_settings = $('#layout_containers').find('div[data-picture^=\'picture-\']:hidden:first');
  layout_settings.removeClass('hidden');
  var img_id = layout_settings.data('picture');
  $('#' + img_id).removeClass('hidden');
});

// eslint-disable-next-line no-unused-vars
function hideImage(containerId) {
  $('div[data-picture=\'' + containerId + '\'').addClass('hidden');
  $('div#' + containerId).addClass('hidden');
}

// eslint-disable-next-line no-unused-vars
function saveConfiguration() {
  var configuration = {
    width: $('input[name=\'final_width\']').val(),
    height: $('input[name=\'final_height\']').val(),
    text_custom_style: $('input[name=\'text_enabled\'][data-trigger=\'general\']').is(':checked'),
    text_font_size: $('input[name=\'text_font_size\']').val(),
    text_rotation: $('input[name=\'text_rotation\']').val(),
    text_locationx: $('input[name=\'text_location_x\']').val(),
    text_locationy: $('input[name=\'text_location_y\']').val(),
    text_font_color: $('input[name=\'text_font_color\']').val(),
    text_font: $('input[name=\'text_font_family\']').val(),
    text_line1: $('input[name=\'text_line_1\']').val(),
    text_line2: $('input[name=\'text_line_2\']').val(),
    text_line3: $('input[name=\'text_line_3\']').val(),
    text_linespace: $('input[name=\'text_line_space\']').val(),
    apply_frame: $('select[name=\'apply_frame\']').val(),
    frame: $('input[name=\'generator-frame\']').val(),
    background: $('input[name=\'generator-background\']').val(),
    background_color: $('input[name=\'background_color\']').val(),
    placeholder: $('input[name=\'enable_placeholder_image\'][data-trigger=\'general\']').is(':checked'),
    placeholderpath: $('input[name=\'placeholder_image\']').val(),
    placeholderposition: $('input[name=\'placeholder_image_position\']').val(),
    layout: []
  };
  $('div.image_layout:visible').each(function () {
    var container = $(this);
    var single_image_layout = [];
    container.find('input:not([type=hidden])').each(function () {
      var to_save = $(this).val();
      if ($(this).attr('type') === 'checkbox') {
        to_save = $(this).is(':checked') && configuration.apply_frame === 'always';
      }
      single_image_layout.push(to_save);
    });
    configuration.layout.push(single_image_layout);
  });
  var canSubmit = $('#can_submit').val();
  var stringedConfiguration = customStringify(configuration);
  if (canSubmit === '1') {
    $('input[name=\'new-configuration\']').val(stringedConfiguration);
    $('#configuration_form').trigger('submit');
  } else {
    photoboothTools.modal.open();
    var modalBody = photoboothTools.modal.element.querySelector('.modal-body');
    var enableWriteMessage = $('#enable_write_message').val();
    var messageDiv = document.createElement('div');
    messageDiv.innerText = enableWriteMessage;
    modalBody.appendChild(messageDiv);
    var jsonDiv = document.createElement('div');
    jsonDiv.innerText = stringedConfiguration;
    jsonDiv.style.fontFamily = 'monospace';
    modalBody.appendChild(jsonDiv);
  }
}
function customStringify(configuration) {
  var textResult = '{';
  for (var _i = 0, _Object$keys = Object.keys(configuration); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    var val = configuration[key];
    if (val instanceof Array) {
      textResult += '\n\t"' + key + '": [';
      var _iterator = _createForOfIteratorHelper(val),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var prop = _step.value;
          textResult += '\n\t\t' + JSON.stringify(prop) + ',';
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      textResult = textResult.slice(0, -1);
      textResult += '\n\t],';
      continue;
    }
    textResult += '\n\t"' + key + '": ' + JSON.stringify(val) + ',';
  }
  textResult = textResult.slice(0, -1);
  textResult += '\n}';
  return textResult;
}
function tokenize(s) {
  // --- Parse a calculation string into an array of numbers and operators
  var r = [];
  var token = '';
  var _iterator2 = _createForOfIteratorHelper(s),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var character = _step2.value;
      if ('^*/+-'.includes(character)) {
        if (token === '' && character === '-') {
          token = '-';
        } else {
          r.push(parseFloat(token), character);
          token = '';
        }
      } else {
        token += character;
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  if (token !== '') {
    r.push(parseFloat(token));
  }
  return r;
}
function calculate(tokens) {
  // --- Perform a calculation expressed as an array of operators and numbers
  var operatorPrecedence = [{
    '^': function _(a, b) {
      return Math.pow(a, b);
    }
  }, {
    '*': function _(a, b) {
      return a * b;
    },
    '/': function _(a, b) {
      return a / b;
    }
  }, {
    '+': function _(a, b) {
      return a + b;
    },
    '-': function _(a, b) {
      return a - b;
    }
  }];
  var operator;
  for (var _i2 = 0, _operatorPrecedence = operatorPrecedence; _i2 < _operatorPrecedence.length; _i2++) {
    var operators = _operatorPrecedence[_i2];
    var newTokens = [];
    var _iterator3 = _createForOfIteratorHelper(tokens),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var token = _step3.value;
        if (token in operators) {
          operator = operators[token];
        } else if (operator) {
          newTokens[newTokens.length - 1] = operator(newTokens[newTokens.length - 1], token);
          operator = null;
        } else {
          newTokens.push(token);
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
    tokens = newTokens;
  }
  if (tokens.length > 1) {
    console.log('Error: unable to resolve calculation');
    return tokens;
  } else {
    return tokens[0];
  }
}