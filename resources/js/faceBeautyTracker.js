"use strict";

/* eslint no-var: "off", curly: "off", no-unused-vars: "off", n/no-unsupported-features/node-builtins: "off" */

/**
 * Supplies smoothed face landmarks for the live beauty renderer.
 * Detection is intentionally throttled; rendering stays on the browser's
 * animation clock so a slow detector cannot block the camera preview.
 */
(function () {
  'use strict';

  var tracker = {
    running: false,
    pending: false,
    timer: null,
    abortController: null,
    callback: null,
    canvas: null,
    context: null,
    state: {
      detected: false,
      faces: [],
      lastSeen: 0,
      error: ''
    }
  };

  // Keep detection responsive enough for a moving subject while the canvas
  // Keep detection responsive enough for a moving subject while the canvas
  // renderer continues at the camera's native animation rate.
  var intervalMs = 40;
  var lostHoldMs = 320;
  var baseSmoothing = 0.65;
  function getEndpoint() {
    var apiRoot = '';
    if (window.environment && window.environment.publicFolders && window.environment.publicFolders.api) {
      apiRoot = window.environment.publicFolders.api;
    }
    if (!apiRoot) apiRoot = 'api';
    return apiRoot.replace(/\/$/, '') + '/alignCheck.php';
  }
  function getVideo() {
    return document.getElementById('preview--video');
  }
  function ensureCanvas() {
    if (!tracker.canvas) {
      tracker.canvas = document.createElement('canvas');
      tracker.context = tracker.canvas.getContext('2d', {
        willReadFrequently: false
      });
    }
    return tracker.canvas;
  }
  function captureFrame() {
    var video = getVideo();
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;

    // 320px allows lightning-fast lightweight JPEG capture and sub-30ms MediaPipe inference
    var maxDimension = 320;
    var scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
    var width = Math.max(160, Math.round(video.videoWidth * scale));
    var height = Math.max(120, Math.round(video.videoHeight * scale));
    var canvas = ensureCanvas();
    canvas.width = width;
    canvas.height = height;
    try {
      tracker.context.drawImage(video, 0, 0, width, height);
      return canvas.toDataURL('image/jpeg', 0.52);
    } catch (error) {
      tracker.state.error = 'capture_failed';
      return null;
    }
  }
  function blendPoint(previous, next, k) {
    if (!previous || !next) return next;
    var alpha = k !== undefined ? k : baseSmoothing;
    return [previous[0] + (next[0] - previous[0]) * alpha, previous[1] + (next[1] - previous[1]) * alpha];
  }
  function blendFace(previous, next) {
    if (!previous) {
      next._time = Date.now();
      next._vx = 0;
      next._vy = 0;
      return next;
    }
    var oldCenter = faceCenter(previous);
    var newCenter = faceCenter(next);
    var distance = Math.hypot(oldCenter[0] - newCenter[0], oldCenter[1] - newCenter[1]);
    
    // Dynamic adaptive alpha: when moving fast, snap quickly (up to 0.88); when static, stabilize at 0.55
    var alpha = Math.min(0.88, Math.max(0.55, distance * 6.0));
    var now = Date.now();
    var dt = Math.max(0.016, (now - (previous._time || now)) / 1000);
    
    var result = {
      contour: [],
      protect: next.protect || (previous ? previous.protect : []),
      eyes: next.eyes || previous.eyes,
      bounds: next.bounds || previous.bounds,
      jaw: next.jaw || (previous ? previous.jaw : null),
      _time: now,
      _vx: (newCenter[0] - oldCenter[0]) / dt,
      _vy: (newCenter[1] - oldCenter[1]) / dt
    };
    var oldContour = previous.contour || [];
    var newContour = next.contour || [];
    for (var i = 0; i < newContour.length; i += 1) {
      result.contour.push(blendPoint(oldContour[i], newContour[i], alpha));
    }
    if (next.eyes && previous.eyes) {
      result.eyes = {};
      ['left', 'right'].forEach(function (side) {
        if (!next.eyes[side] || !previous.eyes[side]) {
          result.eyes[side] = next.eyes[side] || previous.eyes[side];
          return;
        }
        result.eyes[side] = {
          center: blendPoint(previous.eyes[side].center, next.eyes[side].center, alpha),
          width: previous.eyes[side].width + (next.eyes[side].width - previous.eyes[side].width) * alpha,
          height: previous.eyes[side].height + (next.eyes[side].height - previous.eyes[side].height) * alpha
        };
      });
    }
    if (next.jaw && previous.jaw) {
      result.jaw = {
        left: blendPoint(previous.jaw.left, next.jaw.left, alpha),
        right: blendPoint(previous.jaw.right, next.jaw.right, alpha),
        chin: blendPoint(previous.jaw.chin, next.jaw.chin, alpha)
      };
    }
    return result;
  }
  function faceCenter(face) {
    if (face && face.bounds && face.bounds.center) return face.bounds.center;
    return [0.5, 0.5];
  }
  function smoothFaces(nextFaces) {
    var previousFaces = tracker.state.faces || [];
    return (nextFaces || []).map(function (face, index) {
      var previous = previousFaces[index];
      if (!previous) return face;
      var oldCenter = faceCenter(previous);
      var newCenter = faceCenter(face);
      var distance = Math.hypot(oldCenter[0] - newCenter[0], oldCenter[1] - newCenter[1]);
      return distance < 0.35 ? blendFace(previous, face) : face;
    });
  }
  function publish() {
    if (typeof tracker.callback === 'function') tracker.callback(tracker.state);
  }
  function schedule(delay) {
    clearTimeout(tracker.timer);
    if (tracker.running) tracker.timer = setTimeout(detect, delay || intervalMs);
  }
  function detect() {
    if (!tracker.running || tracker.pending) return;
    var image = captureFrame();
    if (!image) {
      schedule(100);
      return;
    }
    tracker.pending = true;
    if (typeof AbortController !== 'undefined') {
      tracker.abortController = new AbortController();
    }
    fetch(getEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: image
      }),
      signal: tracker.abortController ? tracker.abortController.signal : undefined,
      cache: 'no-store'
    }).then(function (response) {
      if (!response.ok) throw new Error('face_align_http_' + response.status);
      return response.json();
    }).then(function (payload) {
      if (!tracker.running) return;
      var faces = Array.isArray(payload.faces) ? payload.faces : [];
      if (faces.length) {
        tracker.state.faces = smoothFaces(faces);
        tracker.state.detected = true;
        tracker.state.lastSeen = Date.now();
        tracker.state.error = '';
      } else if (Date.now() - tracker.state.lastSeen > lostHoldMs) {
        tracker.state.faces = [];
        tracker.state.detected = false;
        tracker.state.error = payload.reason || '';
      }
      publish();
    })["catch"](function (error) {
      if (error && error.name === 'AbortError') return;
      if (Date.now() - tracker.state.lastSeen > lostHoldMs) {
        tracker.state.faces = [];
        tracker.state.detected = false;
      }
      tracker.state.error = 'service_unavailable';
      publish();
    })["finally"](function () {
      tracker.pending = false;
      tracker.abortController = null;
      schedule(intervalMs);
    });
  }
  window.faceBeautyTracker = {
    start: function start(callback) {
      this.stop();
      tracker.callback = callback;
      tracker.running = true;
      tracker.state = {
        detected: false,
        faces: [],
        lastSeen: 0,
        error: ''
      };
      detect();
    },
    stop: function stop() {
      tracker.running = false;
      clearTimeout(tracker.timer);
      tracker.timer = null;
      if (tracker.abortController) tracker.abortController.abort();
      tracker.abortController = null;
      tracker.pending = false;
      tracker.callback = null;
      tracker.state = {
        detected: false,
        faces: [],
        lastSeen: 0,
        error: ''
      };
    },
    getState: function getState() {
      return tracker.state;
    }
  };
})();