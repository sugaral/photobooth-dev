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
  api.initializeMedia = function () {
    var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
      return;
    };
    var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
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
    var videoWidthDefault = config.preview.videoWidth;
    var videoHeightDefault = config.preview.videoHeight;
    var videoWidth = videoWidthDefault;
    var videoHeight = videoHeightDefault;
    var preferredCameraId = localStorage.getItem('photobooth_preferred_camera') || '';

    var videoConstraints = {
      width: {
        ideal: videoWidth || 1280
      },
      height: {
        ideal: videoHeight || 720
      }
    };

    if (preferredCameraId) {
      videoConstraints.deviceId = { exact: preferredCameraId };
    } else if (config.preview.camera_mode) {
      videoConstraints.facingMode = config.preview.camera_mode;
    }

    var webcamConstraints = {
      audio: false,
      video: videoConstraints
    };
    var attachStream = function attachStream(stream) {
      photoboothTools.console.logDev('Preview: getMedia done!');
      api.stream = stream;
      if (video && video.length) {
        video.get(0).srcObject = stream;
      }
      var miniVideo = document.getElementById('settingCameraMiniVideo');
      if (miniVideo) {
        miniVideo.srcObject = stream;
        $(miniVideo).show();
        $('.settings-camera-preview-placeholder').hide();
      }
      cb();
    };
    getMedia.call(navigator.mediaDevices, webcamConstraints).then(attachStream)["catch"](function (error) {
      photoboothTools.console.log('ERROR: Preview: Could not get user media with constraints, trying fallback: ', error);
      if (preferredCameraId) {
        localStorage.removeItem('photobooth_preferred_camera');
      }
      // Fallback to basic unconstrained video
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        }).then(attachStream)["catch"](function (fallbackError) {
          photoboothTools.console.log('ERROR: Preview: Fallback also failed: ', fallbackError);
          if (retry < retryGetMedia) {
            photoboothTools.console.logDev('Preview: Retrying. Retry ' + retry + ' / ' + retryGetMedia);
            retry += 1;
            setTimeout(function () {
              api.initializeMedia(cb, retry);
            }, 1000);
          }
        });
      }
    });
  };
  api.getAndDisplayMedia = function (mode) {
    if (api.stream && api.stream.active) {
      api.changeVideoMode(mode);
    } else {
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
    var probePromise = Promise.resolve();
    if (!api.stream) {
      probePromise = navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function (probeStream) {
          probeStream.getTracks().forEach(function (t) { t.stop(); });
        })
        ["catch"](function () {});
    }

    return probePromise.then(function () {
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
    })["catch"](function (err) {
      photoboothTools.console.log('Error enumerating cameras: ', err);
      if (cb) cb([]);
      return [];
    });
  };

  api.switchCamera = function (deviceId, cb) {
    photoboothTools.console.log('Preview: Switching camera to deviceId: ' + deviceId);
    if (deviceId) {
      localStorage.setItem('photobooth_preferred_camera', deviceId);
    } else {
      localStorage.removeItem('photobooth_preferred_camera');
    }

    if (api.stream) {
      var tracks = api.stream.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });
      api.stream = null;
    }

    api.initializeMedia(function () {
      if (cb) cb(true);
    });
  };

  api.setFlip = function (isFlipped) {
    var videoEl = $('#preview--video, #previewframe--picture, #settingCameraMiniVideo');
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
      $('#preview--video, #previewframe--picture, #settingCameraMiniVideo').addClass('flip-horizontal');
    } else if (storedFlip === 'false' || (storedFlip === null && config.preview && config.preview.flip !== 'flip-horizontal')) {
      $('#preview--video, #previewframe--picture, #settingCameraMiniVideo').removeClass('flip-horizontal');
    }
  };
  return api;
}();
$(function () {
  photoboothPreview.init();
  photoboothTools.console.log('Preview: Preview functions available.');
});