/**
 * Screensaver module for Photobooth.
 * Exposes createScreensaver(deps) which returns the screensaver API.
 */
(function (window, $) {
    window.createScreensaver = function createScreensaver(deps) {
        const {
            config,
            environment,
            startPage,
            overlay,
            videoEl,
            imageEl,
            textTop,
            textCenter,
            textBottom,
            screensaverEnabled,
            screensaverMode,
            screensaverTimeoutMs,
            screensaverSwitchMs,
            urlSafe,
            galleryFallbackSource,
            photoboothTools
        } = deps;

        const fallbackSource = galleryFallbackSource || (() => config.screensaver.image_source || '');

        let screensaverTimeout;
        let screensaverSwitchTimeout;
        let screensaverFlip = false;
        let screensaverLastGallerySource = '';
        let generation = 0;
        let playlistRequest;
        let previousFocus;
        let activityBound = false;
        let suppressUntil = 0;
        const wakingKeys = new Set();
        let wakingPointer = false;
        let screensaverClockInterval = null;
        const viewport = $('<div class="screensaver-overlay__viewport" aria-hidden="true"></div>').hide().appendTo(overlay);
        // Keep the full-screen layer outside the start stage's stacking context.
        overlay.appendTo(document.body);

        const api = {};

        const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const kenBurns = (photo, durationMs) => {
            if (!photo || reducedMotion()) return;
            photo.animate(
                [{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }],
                { duration: Math.max(2000, durationMs), easing: 'ease-out', fill: 'forwards' }
            );
        };

        const startClock = () => {
            const clockTime = overlay.find('.screensaver-overlay__clock-time');
            if (!clockTime.length) return;
            const tick = () => {
                const now = new Date();
                clockTime.text(String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'));
            };
            tick();
            clearInterval(screensaverClockInterval);
            screensaverClockInterval = setInterval(tick, 1000);
        };

        const decorateWakeText = () => {
            [textTop, textCenter, textBottom].forEach(($slot) => {
                if ($slot.css('display') !== 'none' && $.trim($slot.text()) && !$slot.find('.screensaver-overlay__wake-icon').length) {
                    $slot.prepend($('<i class="fa fa-hand-pointer screensaver-overlay__wake-icon" aria-hidden="true"></i>'));
                }
            });
        };

        const canShow = () => startPage.hasClass('stage--active') && !document.hidden &&
            !$('#quickSettingsModal:visible, #payGateModal:visible, #burstWorkbenchModal:visible, .pswp--open, .gallery--open, .sidenav--open').length;

        const activate = () => {
            if (!overlay.hasClass('screensaver-overlay--active')) previousFocus = document.activeElement;
            startPage.addClass('stage--screensaver');
            overlay.addClass('screensaver-overlay--active').attr('aria-hidden', 'false').css('display', 'flex');
            overlay.get(0).focus({ preventScroll: true });
        };

        const loadPhoto = (url) => new Promise((resolve) => {
            const photo = new Image();
            photo.alt = '';
            photo.className = 'screensaver-overlay__slide';
            let timeout;
            const done = (result) => {
                clearTimeout(timeout);
                photo.onload = photo.onerror = null;
                resolve(result);
            };
            photo.onload = () => {
                const frame = document.createElement('div');
                frame.className = 'screensaver-overlay__frame';
                frame.dataset.src = photo.src;
                const backdrop = document.createElement('div');
                backdrop.className = 'screensaver-overlay__backdrop';
                backdrop.style.backgroundImage = 'url("' + photo.src + '")';
                frame.append(backdrop, photo);
                done(frame);
            };
            photo.onerror = () => done(null);
            timeout = setTimeout(() => done(null), 8000);
            photo.src = url;
        });

        const showFolder = async (requestId, force) => {
            playlistRequest = new AbortController();
            const controller = playlistRequest;
            const timeout = setTimeout(() => controller.abort(), 8000);
            let photos;
            try {
                const response = await fetch(environment.publicFolders.api + '/screensaverMedia.php', {
                    signal: controller.signal, cache: 'no-store'
                });
                if (!response.ok) throw new Error('Screensaver playlist unavailable');
                const result = await response.json();
                photos = Array.isArray(result.images) ? result.images : [];
            } catch (error) {
                photoboothTools.console.logDev('Screensaver playlist: ' + error.message);
                photos = [];
            } finally {
                clearTimeout(timeout);
            }
            if (requestId !== generation) return;
            let index = 0;
            let current = null;
            const dotsBox = overlay.find('.screensaver-overlay__dots').empty();
            if (photos.length > 1) {
                photos.forEach(() => dotsBox.append($('<span class="screensaver-overlay__dot"></span>')));
            }
            const setActiveDot = (activeIndex) => {
                dotsBox.children().each(function (dotIndex) {
                    $(this).toggleClass('screensaver-overlay__dot--active', dotIndex === activeIndex);
                });
            };
            // Bad/deleted media is skipped without replacing a good frame with black.
            const nextPhoto = async () => {
                while (photos.length && requestId === generation) {
                    index %= photos.length;
                    const photo = await loadPhoto(photos[index].url);
                    if (requestId !== generation) return null;
                    if (photo) {
                        index = (index + 1) % photos.length;
                        return photo;
                    }
                    photos.splice(index, 1);
                }
                return null;
            };
            current = await nextPhoto();
            if (requestId !== generation) return;
            overlay.removeAttr('aria-busy');
            if (!canShow()) { api.resetTimer(); return; }
            if (!current) {
                if (force) {
                    overlay.addClass('screensaver-overlay--folder');
                    textCenter.text(photoboothTools.getTranslation('screensaver_empty')).show();
                    textBottom.text(photoboothTools.getTranslation('screensaver_wake')).show();
                    activate();
                } else {
                    api.resetTimer();
                }
                return;
            }
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
            const step = async () => {
                if (requestId !== generation) return;
                if (!canShow()) { api.resetTimer(); return; }
                if (photos.length > 1) {
                    const next = await nextPhoto();
                    if (requestId !== generation) return;
                    if (!canShow()) { api.resetTimer(); return; }
                    if (next && next.dataset.src !== current.dataset.src) {
                        viewport.append(next);
                        const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700;
                        const options = { duration, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' };
                        const incoming = next.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], options);
                        const outgoing = current.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }], options);
                        await Promise.all([incoming.finished, outgoing.finished]).catch(() => {});
                        if (requestId !== generation) return;
                        current.remove();
                        current = next;
                        setActiveDot((index + photos.length - 1) % photos.length);
                        kenBurns(next.querySelector('.screensaver-overlay__slide'), screensaverSwitchMs);
                    }
                }
                screensaverSwitchTimeout = setTimeout(step, Math.max(1000, screensaverSwitchMs));
            };
            screensaverSwitchTimeout = setTimeout(step, Math.max(1000, screensaverSwitchMs));
        };

        api.resolveSource = function resolveSource() {
            const base = environment.publicFolders.api;
            switch (screensaverMode) {
                case 'video':
                    return config.screensaver.video_source;
                case 'image':
                    return config.screensaver.image_source;
                case 'folder':
                    return base + '/randomImg.php?dir=' + encodeURIComponent('screensavers') + '&t=' + Date.now();
                case 'gallery': {
                    const anchors = $('#galimages a');
                    if (anchors.length) {
                        const randomIndex = Math.floor(Math.random() * anchors.length);
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
            const wasActive = overlay.hasClass('screensaver-overlay--active');
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
            viewport.find('.screensaver-overlay__frame, .screensaver-overlay__slide').each(function () { this.getAnimations().forEach((animation) => animation.cancel()); });
            viewport.empty().hide();
            overlay.find('.screensaver-overlay__dots').empty();
            clearInterval(screensaverClockInterval);
            screensaverClockInterval = null;
            if (wasActive && previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });

            if (videoEl.length) {
                const vid = videoEl.get(0);
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
            const screensaverText = config.screensaver.text;
            const baseColor = config.screensaver.text_backdrop_color || '#202020';
            const alpha = parseFloat(config.screensaver.text_backdrop_opacity);
            const safeAlpha = Number.isFinite(alpha) ? Math.min(Math.max(alpha, 0), 1) : 0.55;
            const hex = baseColor.replace('#', '');
            const fullHex =
                hex.length === 3
                    ? hex
                          .split('')
                          .map((c) => c + c)
                          .join('')
                    : hex;
            const r = parseInt(fullHex.substring(0, 2), 16) || 0;
            const g = parseInt(fullHex.substring(2, 4), 16) || 0;
            const b = parseInt(fullHex.substring(4, 6), 16) || 0;
            const screensaverBackdrop = `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
            const buildEventText = () => {
                const left = config.event.textLeft || '';
                const right = config.event.textRight || '';
                const symbolClass = config.event.symbol || '';
                const symbol = symbolClass ? `<i class="fa ${symbolClass}" aria-hidden="true"></i>` : '';
                return [left, symbol, right].filter(Boolean).join(' ').trim();
            };

            const eventText = buildEventText();
            const showEvent = screensaverMode === 'gallery';
            const hasScreensaver = !!screensaverText;
            const hasEvent = showEvent && !!eventText;

            const position = config.screensaver.text_position || 'center';
            const showTop = position === 'top-center';
            const showCenter = position === 'center';
            const showBottom = position === 'bottom-center';

            const resetSlots = () => {
                textTop.removeClass('screensaver-overlay__text--center').hide().text('');
                textCenter.hide().text('');
                textBottom.hide().text('');
            };

            const applyContent = ($el, content, isHtml = false) => {
                if (isHtml) {
                    $el.html(content);
                } else {
                    $el.text(content);
                }
            };

            const setSlot = (content, isHtml = false) => {
                resetSlots();
                [textTop, textCenter, textBottom].forEach(($el) => {
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
                const singleText = hasScreensaver ? screensaverText : hasEvent ? eventText : '';
                if (singleText) {
                    setSlot(singleText, hasEvent);
                } else {
                    resetSlots();
                }
            }

            screensaverFlip = !screensaverFlip;
        };

        api.stepScreensaver = function stepScreensaver() {
            const mode = overlay.data('mode') || screensaverMode;
            photoboothTools.console.logDev('Screensaver: step in mode \'' + mode + '\'');

            let nextSource = api.resolveSource();
            if (!nextSource && mode === 'gallery') {
                nextSource = fallbackSource();
            }

            if (mode === 'gallery' || mode === 'folder') {
                let guard = 5;
                while (nextSource === screensaverLastGallerySource && guard > 0) {
                    nextSource = api.resolveSource();
                    guard--;
                }
                screensaverLastGallerySource = nextSource;
            }

            photoboothTools.console.logDev('Screensaver: next source \'' + nextSource + '\'');
            if (nextSource) {
                if (mode === 'folder') {
                    overlay.css('background-image', nextSource ? `url(${urlSafe(nextSource)})` : 'none');
                } else if (mode === 'gallery') {
                    imageEl
                        .one('error', function () {
                            const fallback = fallbackSource();
                            if (fallback && fallback !== nextSource) {
                                screensaverLastGallerySource = fallback;
                                $(this).attr('src', urlSafe(fallback));
                            }
                        })
                        .attr('src', urlSafe(nextSource))
                        .show();
                }
            }
            if (mode === 'gallery') {
                api.toggleGalleryText();
            }
        };

        api.show = function show(force = false) {
            if ((!force && !screensaverEnabled) || !overlay.length) {
                return;
            }
            const mode = screensaverMode;
            if (!canShow()) {
                api.resetTimer();
                return;
            }
            api.hide();
            const requestId = generation;
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
                const width = config.screensaver.gallery_width || 800;
                imageEl.css('width', width + 'px');
            } else {
                overlay.removeClass('screensaver-overlay--gallery');
                imageEl.css('width', '');
            }

            const source = api.resolveSource();
            const finalSource = source || fallbackSource();
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
                const vid = videoEl.get(0);
                vid.play().catch((err) => {
                    photoboothTools.console.logDev('Idle video play failed: ' + err);
                });
                imageEl.hide();
                api.toggleGalleryText();
            } else if (mode === 'gallery') {
                videoEl.hide();
                overlay.css('background-image', 'none');
                imageEl
                    .one('error', function () {
                        const fallback = fallbackSource();
                        if (fallback && fallback !== finalSource) {
                            screensaverLastGallerySource = fallback;
                            $(this).attr('src', urlSafe(fallback));
                        }
                    })
                    .attr('src', urlSafe(finalSource))
                    .show();
                api.toggleGalleryText();
            } else {
                videoEl.hide();
                imageEl.hide();
                api.toggleGalleryText();
                overlay.css('background-image', finalSource ? `url(${urlSafe(finalSource)})` : 'none');
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
            const wake = (event) => {
                const active = overlay.hasClass('screensaver-overlay--active');
                const wakingGesture = wakingPointer || wakingKeys.has(event.code);
                if (active || wakingGesture || Date.now() < suppressUntil) {
                    // Consume the whole waking gesture, including its synthetic click.
                    if (event.cancelable) event.preventDefault();
                    event.stopImmediatePropagation();
                    if (event.type === 'keydown') wakingKeys.add(event.code);
                    if (event.type === 'keyup') wakingKeys.delete(event.code);
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
            ['pointerdown', 'pointerup', 'pointercancel', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'touchcancel', 'click', 'keydown', 'keyup'].forEach((name) => {
                document.addEventListener(name, wake, { capture: true, passive: false });
            });
            document.addEventListener('mousemove', () => {
                if (screensaverEnabled && !overlay.hasClass('screensaver-overlay--active')) api.resetTimer();
            }, { passive: true });
            document.addEventListener('visibilitychange', () => {
                wakingPointer = false;
                wakingKeys.clear();
                if (document.hidden) api.hide(); else api.resetTimer();
            });
            window.addEventListener('blur', () => { wakingPointer = false; wakingKeys.clear(); });
        };

        return api;
    };
})(window, jQuery);
