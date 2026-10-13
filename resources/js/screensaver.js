"use strict";

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
    var api = {};
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
      if (!overlay.length) {
        return;
      }
      overlay.removeClass('screensaver-overlay--active');
      overlay.css('display', 'none');
      startPage.removeClass('stage--screensaver');
      clearInterval(screensaverSwitchTimeout);
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
        nextSource = galleryFallbackSource();
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
            var fallback = galleryFallbackSource();
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
      if (!startPage.hasClass('stage--active')) {
        api.resetTimer();
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
      startPage.addClass('stage--screensaver');
      overlay.addClass('screensaver-overlay--active');
      overlay.css('display', 'flex');
      clearInterval(screensaverSwitchTimeout);
      if ((mode === 'folder' || mode === 'gallery') && screensaverSwitchMs > 0) {
        screensaverSwitchTimeout = setInterval(function nextIdleFrame() {
          api.stepScreensaver();
        }, screensaverSwitchMs);
      }
    };
    api.resetTimer = function resetTimer() {
      if (!screensaverEnabled) {
        return;
      }
      clearTimeout(screensaverTimeout);
      api.hide();
      screensaverTimeout = setTimeout(api.show, screensaverTimeoutMs);
    };
    return api;
  };
})(window, jQuery);