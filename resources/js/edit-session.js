"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/* Shared, DOM-independent primitives for the post-capture editor. */
(function (root, factory) {
  'use strict';

  var api = factory();
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.PhotoboothEditSession = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : void 0, function () {
  'use strict';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function freeze(value) {
    if (value && _typeof(value) === 'object') {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  }
  function snapshot(value) {
    return freeze(clone(value));
  }
  function error(code, message) {
    var result = new Error(message);
    result.code = code;
    return result;
  }
  var History = /*#__PURE__*/function () {
    function History() {
      var limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 25;
      _classCallCheck(this, History);
      this.limit = limit;
      this.revision = 0;
      this.reset(null);
    }
    return _createClass(History, [{
      key: "reset",
      value: function reset(value) {
        this.revision++;
        this.past = [];
        this.future = [];
        this.present = snapshot(value);
      }
    }, {
      key: "commit",
      value: function commit(value) {
        var next = snapshot(value);
        if (JSON.stringify(next) === JSON.stringify(this.present)) {
          return false;
        }
        if (this.present !== null) {
          this.past.push(this.present);
        }
        if (this.past.length > this.limit) {
          this.past.shift();
        }
        this.present = next;
        this.future = [];
        this.revision++;
        return true;
      }
    }, {
      key: "undo",
      value: function undo() {
        if (!this.past.length) {
          return null;
        }
        this.future.push(this.present);
        this.present = this.past.pop();
        this.revision++;
        return clone(this.present);
      }
    }, {
      key: "redo",
      value: function redo() {
        if (!this.future.length) {
          return null;
        }
        this.past.push(this.present);
        this.present = this.future.pop();
        this.revision++;
        return clone(this.present);
      }
    }]);
  }(); // All callers of one operation receive the same promise. Cancellation and
  // timeout revoke the worker's right to publish, even if its I/O finishes late.
  var SaveCoordinator = /*#__PURE__*/function () {
    function SaveCoordinator() {
      var timeoutMs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30000;
      _classCallCheck(this, SaveCoordinator);
      this.timeoutMs = timeoutMs;
      this.epoch = 0;
      this.inflight = new Map();
      this.cache = new Map();
    }
    return _createClass(SaveCoordinator, [{
      key: "reset",
      value: function reset() {
        this.epoch++;
        var _iterator = _createForOfIteratorHelper(this.inflight.values()),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var entry = _step.value;
            entry.cancel(error('CANCELLED', '编辑会话已结束，请重新操作'));
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this.inflight.clear();
        this.cache.clear();
      }
    }, {
      key: "invalidate",
      value: function invalidate() {
        this.reset();
      }
    }, {
      key: "run",
      value: function run(key, document, worker) {
        var _this = this;
        if (this.cache.has(key)) {
          return Promise.resolve(this.cache.get(key));
        }
        if (this.inflight.has(key)) {
          return this.inflight.get(key).promise;
        }
        var frozen = snapshot(document);
        var epoch = this.epoch;
        var controller = new AbortController();
        var rejectCancellation;
        var timer;
        var cancelled = false;
        var cancellation = new Promise(function (resolve, reject) {
          rejectCancellation = reject;
        });
        var entry = {
          cancel: function cancel(reason) {
            if (cancelled) {
              return;
            }
            cancelled = true;
            controller.abort();
            rejectCancellation(reason);
          }
        };
        var check = function check() {
          if (cancelled || epoch !== _this.epoch) {
            throw error('CANCELLED', '照片已修改，请重新领取当前成片');
          }
        };
        timer = setTimeout(function () {
          return entry.cancel(error('SAVE_TIMEOUT', '保存超时，结果尚未确认，请重试'));
        }, this.timeoutMs);
        var work = Promise.resolve().then(function () {
          check();
          return worker(frozen, {
            signal: controller.signal,
            check: check
          });
        });
        entry.promise = Promise.race([work, cancellation]).then(function (result) {
          check();
          if (!result) {
            throw error('EMPTY_RESULT', '保存未返回有效照片，未执行交付');
          }
          _this.cache.set(key, result);
          return result;
        })["finally"](function () {
          clearTimeout(timer);
          if (_this.inflight.get(key) === entry) {
            _this.inflight["delete"](key);
          }
        });
        this.inflight.set(key, entry);
        return entry.promise;
      }
    }]);
  }();
  function contain(width, height, viewport) {
    if (!(width > 0 && height > 0 && viewport.width > 0 && viewport.height > 0)) {
      throw error('INVALID_GEOMETRY', '照片显示区域尚未准备好');
    }
    var scale = Math.min(viewport.width / width, viewport.height / height);
    return {
      left: viewport.left + (viewport.width - width * scale) / 2,
      top: viewport.top + (viewport.height - height * scale) / 2,
      width: width * scale,
      height: height * scale,
      scale: scale
    };
  }
  function pointToPhoto(x, y, rect) {
    return {
      x: (x - rect.left) / rect.width,
      y: (y - rect.top) / rect.height
    };
  }
  function normalizeAngle(angle) {
    return ((angle + 180) % 360 + 360) % 360 - 180;
  }
  return {
    History: History,
    SaveCoordinator: SaveCoordinator,
    snapshot: snapshot,
    contain: contain,
    pointToPhoto: pointToPhoto,
    normalizeAngle: normalizeAngle,
    error: error
  };
});