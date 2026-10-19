"use strict";

/* eslint n/no-unsupported-features/node-builtins: "off" */

/* globals photoBooth photoboothTools */

function getPreviewUrlWithCacheBusting() {
  var url = getBasePreviewUrl();
  var timestamp = new Date().getTime();
  if (url.includes('?')) {
    return "".concat(url, "&t=").concat(timestamp);
  }
  return "".concat(url, "?t=").concat(timestamp);
}
function getBasePreviewUrl() {
  if (!config.preview || !config.preview.url) {
    return '';
  }
  var raw = config.preview.url;
  //remove url("") if present
  var match = raw.match(/^url\((['"]?)(.+?)\1\)$/);
  return match ? match[2] : raw;
}
var photoboothPreview = function () {
  // vars
  var CameraDisplayMode = {
      INIT: 1,
      BACKGROUND: 2,
      COUNTDOWN: 3,
      TEST: 4
    },
    PreviewMode = {
      NONE: 'none',
      DEVICE: 'device_cam',
      URL: 'url'
    },
    api = {};
  var pid,
    video,
    loader,
    url,
    pictureFrame,
    retryGetMedia = 3;
  api.changeVideoMode = function (mode) {
    photoboothTools.console.logDev('Preview: Changing video mode: ' + mode);
    if (mode !== CameraDisplayMode.BACKGROUND) {
      loader.css('--stage-background', 'transparent');
    }
    video.show();
  };

  api.getPreferredCamera = function () {
    var id = localStorage.getItem('photobooth_preferred_camera_id') ||
             localStorage.getItem('photobooth_preferred_camera') ||
             (typeof photoboothServerCamera !== 'undefined' && photoboothServerCamera.id) || '';
    var label = localStorage.getItem('photobooth_preferred_camera_label') ||
                (typeof photoboothServerCamera !== 'undefined' && photoboothServerCamera.label) || '';
    return { id: id, label: label };
  };

  api.setPreferredCamera = function (deviceId, label) {
    if (deviceId) {
      localStorage.setItem('photobooth_preferred_camera_id', deviceId);
      localStorage.setItem('photobooth_preferred_camera', deviceId);
      if (label) {
        localStorage.setItem('photobooth_preferred_camera_label', label);
      }
      try {
        $.ajax({
          url: 'api/cameraConfig.php',
          type: 'POST',
          contentType: 'application/json; charset=utf-8',
          data: JSON.stringify({ id: deviceId, label: label || '' })
        });
      } catch (e) {}
    } else {
      localStorage.removeItem('photobooth_preferred_camera_id');
      localStorage.removeItem('photobooth_preferred_camera');
      localStorage.removeItem('photobooth_preferred_camera_label');
    }
  };

  api.resolveTargetDeviceId = function () {
    var pref = api.getPreferredCamera();
    if (!pref.id && !pref.label) {
      return Promise.resolve('');
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return Promise.resolve(pref.id);
    }
    return navigator.mediaDevices.enumerateDevices().then(function (devices) {
      var videoDevices = devices.filter(function (d) { return d.kind === 'videoinput'; });
      // 1. Exact ID match
      if (pref.id) {
        var matchById = videoDevices.find(function (d) { return d.deviceId === pref.id; });
        if (matchById) {
          return matchById.deviceId;
        }
      }
      // 2. Fuzzy Label match (if session salted deviceId changed)
      if (pref.label) {
        var cleanTarget = pref.label.toLowerCase().trim();
        var matchByLabel = videoDevices.find(function (d) {
          var cleanD = (d.label || '').toLowerCase().trim();
          return cleanD && (cleanD === cleanTarget || cleanD.indexOf(cleanTarget) !== -1 || cleanTarget.indexOf(cleanD) !== -1);
        });
        if (matchByLabel) {
          localStorage.setItem('photobooth_preferred_camera_id', matchByLabel.deviceId);
          localStorage.setItem('photobooth_preferred_camera', matchByLabel.deviceId);
          return matchByLabel.deviceId;
        }
      }
      return pref.id || '';
    })['catch'](function () {
      return pref.id || '';
    });
  };

  api.initializeMedia = function () {
    var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
    var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var explicitTargetId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    photoboothTools.console.logDev('Preview: Trying to initialize media...');
    if (!navigator.mediaDevices || config.preview.mode === PreviewMode.NONE.valueOf() || config.preview.mode === PreviewMode.URL.valueOf()) {
      photoboothTools.console.logDev('Preview: No preview from device cam or no webcam available!');
      return;
    }
    var getMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || false;
    if (!getMedia) {
      photoboothTools.console.logDev('Preview: Could not get media!');
      return;
    }

    var videoWidthDefault = config.preview.videoWidth || 1280;
    var videoHeightDefault = config.preview.videoHeight || 720;

    var targetPromise = explicitTargetId ? Promise.resolve(explicitTargetId) : api.resolveTargetDeviceId();

    targetPromise.then(function (targetDeviceId) {
      photoboothTools.console.log('Preview: Initializing media with targetDeviceId: [' + targetDeviceId + ']');

      var attachStream = function attachStream(stream) {
        api.stream = stream;
        try {
          var activeTrack = stream.getVideoTracks()[0];
          var settings = activeTrack.getSettings ? activeTrack.getSettings() : {};
          photoboothTools.console.log('Preview: Stream active! Camera: ' + activeTrack.label + ' (DeviceId: ' + settings.deviceId + ')');
        } catch (e) {}

        if (video && video.length) {
          var vEl = video.get(0);
          vEl.srcObject = stream;
          vEl.play().catch(function () {});
        }
        var miniVideo = document.getElementById('settingCameraMiniVideo');
        if (miniVideo) {
          miniVideo.srcObject = stream;
          miniVideo.play().catch(function () {});
          $(miniVideo).show();
          $('.settings-camera-preview-placeholder').hide();
        }
        cb(true);
      };

      // Progressive Constraint Negotiation Ladder (强制锁定目标摄像头，绝不静默回退至默认设备)
      var tryLevel1 = function () {
        var videoConstraints = {
          width: { ideal: videoWidthDefault },
          height: { ideal: videoHeightDefault }
        };
        if (targetDeviceId) {
          videoConstraints.deviceId = { exact: targetDeviceId };
        } else if (config.preview.camera_mode) {
          videoConstraints.facingMode = config.preview.camera_mode;
        }
        return getMedia.call(navigator.mediaDevices, { audio: false, video: videoConstraints });
      };

      var tryLevel2 = function () {
        // 自适应任何原生分辨率，强制锁定指定 targetDeviceId
        var videoConstraints = targetDeviceId ? { deviceId: { exact: targetDeviceId } } : true;
        return getMedia.call(navigator.mediaDevices, { audio: false, video: videoConstraints });
      };

      var tryLevel3 = function () {
        if (targetDeviceId) {
          return getMedia.call(navigator.mediaDevices, { audio: false, video: { deviceId: { ideal: targetDeviceId } } });
        }
        return getMedia.call(navigator.mediaDevices, { audio: false, video: true });
      };

      tryLevel1()
        .then(attachStream)
        ['catch'](function (err1) {
          photoboothTools.console.log('Preview: Level 1 exact constraint failed, trying Level 2: ', err1);
          return tryLevel2()
            .then(attachStream)
            ['catch'](function (err2) {
              photoboothTools.console.log('Preview: Level 2 constraint failed, trying fallback: ', err2);
              return tryLevel3()
                .then(attachStream)
                ['catch'](function (err3) {
                  photoboothTools.console.log('ERROR: Preview: All getUserMedia attempts failed: ', err3);
                  if (retry < retryGetMedia) {
                    retry += 1;
                    setTimeout(function () {
                      api.initializeMedia(cb, retry, targetDeviceId);
                    }, 800);
                  } else {
                    cb(false);
                  }
                });
            });
        });
    });
  };
  api.getAndDisplayMedia = function (mode) {
    var pref = api.getPreferredCamera();
    var isCurrentStreamMatching = false;

    if (api.stream && api.stream.active) {
      if (!pref.id) {
        isCurrentStreamMatching = true;
      } else {
        try {
          var curTrack = api.stream.getVideoTracks()[0];
          var curSettings = curTrack.getSettings ? curTrack.getSettings() : {};
          if (curSettings.deviceId === pref.id || (pref.label && curTrack.label && curTrack.label.indexOf(pref.label) !== -1)) {
            isCurrentStreamMatching = true;
          }
        } catch (e) {}
      }
    }

    if (isCurrentStreamMatching) {
      api.changeVideoMode(mode);
    } else {
      if (api.stream) {
        try {
          api.stream.getTracks().forEach(function (t) { t.stop(); });
        } catch (e) {}
        api.stream = null;
      }
      api.initializeMedia(function () {
        api.changeVideoMode(mode);
      });
    }
  };
  api.runCmd = function (mode) {
    var dataVideo = {
      play: mode,
      pid: pid
    };
    photoboothTools.ajaxWithCsrf({
      url: 'api/previewCamera.php',
      method: 'POST',
      data: dataVideo
    }).done(function (result) {
      photoboothTools.console.log('Preview: ' + dataVideo.play + ' webcam successfully.');
      pid = result.pid;
    })
    // eslint-disable-next-line no-unused-vars
    .fail(function (xhr, status, result) {
      if (photoboothTools.isCsrfErrorResponse(xhr)) {
        photoboothTools.handleCsrfMismatch('api/previewCamera.php');
        return;
      }
      photoboothTools.console.log('ERROR: Preview: Failed to ' + dataVideo.play + ' webcam!');
    });
  };
  api.startVideo = function (mode) {
    var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var maxGetMediaRetry = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;
    retryGetMedia = maxGetMediaRetry;
    photoboothTools.console.log('Preview: startVideo mode: ' + mode);
    if (config.preview.mode !== PreviewMode.URL.valueOf()) {
      if (!navigator.mediaDevices || config.preview.mode === PreviewMode.NONE.valueOf()) {
        return;
      }
    }
    switch (mode) {
      case CameraDisplayMode.INIT:
        photoboothTools.console.logDev('Preview: Running preview cmd (INIT).');
        api.runCmd('start');
        break;
      case CameraDisplayMode.BACKGROUND:
        if (config.preview.mode === PreviewMode.DEVICE.valueOf() && config.commands.preview && !config.preview.bsm) {
          photoboothTools.console.logDev('Preview: Running preview cmd (BACKGROUND).');
          api.runCmd('start');
        }
        api.getAndDisplayMedia(CameraDisplayMode.BACKGROUND);
        break;
      case CameraDisplayMode.COUNTDOWN:
        if (config.commands.preview) {
          if (config.preview.bsm || !config.preview.bsm && retry > 0) {
            photoboothTools.console.logDev('Preview: Running preview cmd (COUNTDOWN).');
            api.runCmd('start');
          }
        }
        if (config.preview.mode === PreviewMode.DEVICE.valueOf()) {
          photoboothTools.console.logDev('Preview: Preview at countdown from device cam.');
          api.getAndDisplayMedia(CameraDisplayMode.COUNTDOWN);
        } else if (config.preview.mode === PreviewMode.URL.valueOf()) {
          photoboothTools.console.logDev('Preview: Preview at countdown from URL.');
          setTimeout(function () {
            url.css('background-image', 'url("' + getPreviewUrlWithCacheBusting() + '")');
            url.show();
            url.addClass('streaming');
          }, config.preview.url_delay);
        }
        break;
      case CameraDisplayMode.TEST:
        if (config.preview.mode === PreviewMode.DEVICE.valueOf()) {
          photoboothTools.console.logDev('Preview: Preview from device cam.');
          api.getAndDisplayMedia(CameraDisplayMode.TEST);
        } else if (config.preview.mode === PreviewMode.URL.valueOf()) {
          photoboothTools.console.logDev('Preview: Preview from URL.');
          setTimeout(function () {
            url.css('background-image', 'url("' + getPreviewUrlWithCacheBusting() + '")');
            url.show();
            url.addClass('streaming');
          }, config.preview.url_delay);
        }
        break;
      default:
        photoboothTools.console.log('ERROR: Preview: Call for unexpected video mode: ' + mode);
        break;
    }
  };
  api.stopPreview = function () {
    if (config.commands.preview_kill) {
      api.runCmd('stop');
    }
    if (config.preview.mode === PreviewMode.DEVICE.valueOf() || config.preview.mode === PreviewMode.URL.valueOf()) {
      api.stopVideo();
    }
  };
  api.stopVideo = function () {
    loader.css('--stage-background', 'var(--background-countdown-color)');
    if (api.stream) {
      var tracks = api.stream.getTracks();
      tracks.forEach(function (track) {
        return track.stop();
      });
      api.stream = null;
    }
    url.removeClass('streaming');
    url.hide();
    url.css('background-image', 'none');
    video.hide();
    pictureFrame.hide();
  };
  api.getAvailableCameras = function (cb) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      if (cb) cb([]);
      return Promise.resolve([]);
    }

    var doEnumerate = function () {
      return navigator.mediaDevices.enumerateDevices().then(function (devices) {
        var videoDevices = [];
        var count = 1;
        devices.forEach(function (device) {
          if (device.kind === 'videoinput') {
            videoDevices.push({
              deviceId: device.deviceId,
              label: device.label || ('摄像头 ' + count++)
            });
          }
        });
        if (cb) cb(videoDevices);
        return videoDevices;
      });
    };

    if (api.stream && api.stream.active) {
      return doEnumerate();
    }

    return navigator.mediaDevices.enumerateDevices().then(function (devices) {
      var hasLabels = devices.some(function (d) { return d.kind === 'videoinput' && d.label; });
      if (hasLabels) {
        return doEnumerate();
      }
      var targetId = api.getPreferredCamera().id;
      var probeConstraint = targetId ? { deviceId: { ideal: targetId } } : true;
      return navigator.mediaDevices.getUserMedia({ video: probeConstraint, audio: false })
        .then(function (probeStream) {
          probeStream.getTracks().forEach(function (t) { t.stop(); });
          return new Promise(function (resolve) { setTimeout(resolve, 200); });
        })
        ['catch'](function () {})
        .then(doEnumerate);
    })['catch'](function (err) {
      photoboothTools.console.log('Error enumerating cameras: ', err);
      if (cb) cb([]);
      return [];
    });
  };

  api.switchCamera = function (deviceId, label, cb) {
    if (typeof label === 'function') {
      cb = label;
      label = '';
    }
    photoboothTools.console.log('Preview: Switching camera to: ' + deviceId + ' (' + label + ')');

    api.setPreferredCamera(deviceId, label);

    if (api.stream) {
      var tracks = api.stream.getTracks();
      tracks.forEach(function (track) {
        try { track.stop(); } catch (e) {}
      });
      api.stream = null;
    }

    // Cooldown 200ms for Windows DirectShow/MF driver handle release
    setTimeout(function () {
      api.initializeMedia(function (success) {
        if (cb) cb(success !== false);
      }, 0, deviceId);
    }, 200);
  };

  api.setFlip = function (isFlipped) {
    var videoEl = $('#preview--video, #preview--beauty-canvas, #previewframe--picture, #settingCameraMiniVideo');
    if (isFlipped) {
      videoEl.addClass('flip-horizontal');
      localStorage.setItem('photobooth_camera_flip', 'true');
    } else {
      videoEl.removeClass('flip-horizontal');
      localStorage.setItem('photobooth_camera_flip', 'false');
    }
  };

  api.setElements = function () {
    video = $('#preview--video');
    loader = $('.stage[data-stage="loader"]');
    url = $('#preview--ipcam');
    pictureFrame = $('#previewframe--picture');
  };
  api.init = function () {
    api.setElements();
    var storedFlip = localStorage.getItem('photobooth_camera_flip');
    if (storedFlip === 'true' || (storedFlip === null && config.preview && config.preview.flip === 'flip-horizontal')) {
      $('#preview--video, #preview--beauty-canvas, #previewframe--picture, #settingCameraMiniVideo').addClass('flip-horizontal');
    } else if (storedFlip === 'false' || (storedFlip === null && config.preview && config.preview.flip !== 'flip-horizontal')) {
      $('#preview--video, #preview--beauty-canvas, #previewframe--picture, #settingCameraMiniVideo').removeClass('flip-horizontal');
    }
  };
  return api;
}();
$(function () {
  photoboothPreview.init();
  photoboothTools.console.log('Preview: Preview functions available.');
});
