"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/* eslint n/no-unsupported-features/node-builtins: "off" */
/* globals remoteBuzzerClient csrf */
var photoboothTools = function () {
  // vars
  var notificationTimeout = config.ui.notification_timeout * 1000,
    api = {};
  api.translations = null;
  api.sounds = null;
  api.isPrinting = false;
  api.csrfRefreshPromise = null;
  api.csrfReloadScheduled = false;
  api.hasCsrf = function () {
    return typeof csrf !== 'undefined' && typeof csrf.key === 'string' && typeof csrf.token === 'string';
  };
  api.getCsrfErrorMessage = function () {
    return 'Invalid CSRF token';
  };
  api.isCsrfErrorText = function (text) {
    if (typeof text !== 'string' || text === '') {
      return false;
    }
    return text.toLowerCase().includes(api.getCsrfErrorMessage().toLowerCase());
  };
  api.extractErrorMessage = function (payload) {
    if (!payload) {
      return '';
    }
    if (typeof payload === 'string') {
      return payload;
    }
    if (typeof payload.error === 'string') {
      return payload.error;
    }
    return '';
  };
  api.isCsrfErrorResponse = function (xhr) {
    if (!xhr || xhr.status !== 403) {
      return false;
    }
    var jsonMessage = api.extractErrorMessage(xhr.responseJSON);
    var textMessage = typeof xhr.responseText === 'string' ? xhr.responseText : '';
    return api.isCsrfErrorText(jsonMessage) || api.isCsrfErrorText(textMessage);
  };
  api.syncCsrfValue = function (csrfPayload) {
    if (!api.hasCsrf()) {
      return false;
    }
    if (!csrfPayload || _typeof(csrfPayload) !== 'object') {
      return false;
    }
    if (typeof csrfPayload.key === 'string' && csrfPayload.key !== '') {
      csrf.key = csrfPayload.key;
    }
    if (typeof csrfPayload.token === 'string' && csrfPayload.token !== '') {
      csrf.token = csrfPayload.token;
      return true;
    }
    return false;
  };
  var addCsrfToUrl = function addCsrfToUrl(url) {
    if (!api.hasCsrf()) {
      return url;
    }
    var u = new URL(url, window.location.origin);
    u.searchParams.set(csrf.key, csrf.token);
    return u.toString();
  };
  api.addCsrfToPayload = function () {
    var payload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (!api.hasCsrf()) {
      return payload;
    }
    var csrfKey = csrf.key;
    var csrfToken = csrf.token;
    if (payload instanceof FormData) {
      if (typeof payload.set === 'function') {
        payload.set(csrfKey, csrfToken);
      } else {
        if (typeof payload["delete"] === 'function') {
          payload["delete"](csrfKey);
        }
        payload.append(csrfKey, csrfToken);
      }
      return payload;
    }
    if (payload instanceof URLSearchParams) {
      payload.set(csrfKey, csrfToken);
      return payload;
    }
    if (typeof payload === 'string') {
      var params = new URLSearchParams(payload);
      params.set(csrfKey, csrfToken);
      return params.toString();
    }
    if (payload === null || typeof payload === 'undefined') {
      return _defineProperty({}, csrfKey, csrfToken);
    }
    if (_typeof(payload) === 'object') {
      return _objectSpread(_objectSpread({}, payload), {}, _defineProperty({}, csrfKey, csrfToken));
    }
    return payload;
  };
  api.refreshCsrfToken = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          if (api.hasCsrf()) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2, false);
        case 1:
          if (!api.csrfRefreshPromise) {
            _context2.n = 2;
            break;
          }
          return _context2.a(2, api.csrfRefreshPromise);
        case 2:
          api.csrfRefreshPromise = fetch(environment.publicFolders.api + '/csrf.php', {
            method: 'GET',
            cache: 'no-store',
            credentials: 'same-origin'
          }).then(/*#__PURE__*/function () {
            var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(response) {
              var csrfPayload;
              return _regenerator().w(function (_context) {
                while (1) switch (_context.n) {
                  case 0:
                    if (response.ok) {
                      _context.n = 1;
                      break;
                    }
                    return _context.a(2, false);
                  case 1:
                    _context.n = 2;
                    return response.json();
                  case 2:
                    csrfPayload = _context.v;
                    return _context.a(2, api.syncCsrfValue(csrfPayload));
                }
              }, _callee);
            }));
            return function (_x) {
              return _ref3.apply(this, arguments);
            };
          }())["catch"](function () {
            return false;
          })["finally"](function () {
            api.csrfRefreshPromise = null;
          });
          return _context2.a(2, api.csrfRefreshPromise);
      }
    }, _callee2);
  }));
  api.handleCsrfMismatch = function () {
    var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    if (api.csrfReloadScheduled) {
      return;
    }
    api.csrfReloadScheduled = true;
    var message = api.getTranslation('csrf_session_reloading');
    api.console.log('ERROR: CSRF token mismatch', context);
    api.overlay.showWarning(message);
    setTimeout(function () {
      api.reloadPage();
    }, 750);
  };
  api.ajaxWithCsrf = function (ajaxOptions) {
    var retryOnCsrf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var requestOptions = _objectSpread(_objectSpread({}, ajaxOptions), {}, {
      data: api.addCsrfToPayload(ajaxOptions.data)
    });
    var deferred = $.Deferred();
    var cancelled = false;
    var activeRequest = $.ajax(requestOptions).done(function (data, textStatus, jqXHR) {
      deferred.resolve(data, textStatus, jqXHR);
    }).fail(function (xhr, textStatus, errorThrown) {
      if (retryOnCsrf && api.isCsrfErrorResponse(xhr)) {
        api.refreshCsrfToken().then(function (refreshed) {
          if (cancelled) {
            return;
          }
          if (!refreshed) {
            api.handleCsrfMismatch(requestOptions.url || 'unknown');
            deferred.reject(xhr, textStatus, errorThrown);
            return;
          }
          activeRequest = api.ajaxWithCsrf(ajaxOptions, false).done(function (retryData, retryStatus, retryXhr) {
            deferred.resolve(retryData, retryStatus, retryXhr);
          }).fail(function (retryErrXhr, retryErrStatus, retryErrThrown) {
            if (api.isCsrfErrorResponse(retryErrXhr)) {
              api.handleCsrfMismatch(requestOptions.url || 'unknown');
            }
            deferred.reject(retryErrXhr, retryErrStatus, retryErrThrown);
          });
        })["catch"](function () {
          if (cancelled) {
            return;
          }
          api.handleCsrfMismatch(requestOptions.url || 'unknown');
          deferred.reject(xhr, textStatus, errorThrown);
        });
        return;
      }
      deferred.reject(xhr, textStatus, errorThrown);
    });
    return deferred.promise({
      abort: function abort() {
        cancelled = true;
        activeRequest.abort();
        deferred.reject(activeRequest, 'abort', 'abort');
      }
    });
  };
  api.initialize = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var resultTranslations, resultSounds;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          _context3.n = 1;
          return fetch(addCsrfToUrl(environment.publicFolders.api + '/translations.php'), {
            cache: 'no-store'
          });
        case 1:
          resultTranslations = _context3.v;
          _context3.n = 2;
          return resultTranslations.json();
        case 2:
          this.translations = _context3.v;
          _context3.n = 3;
          return fetch(addCsrfToUrl(environment.publicFolders.api + '/sounds.php'), {
            cache: 'no-store'
          });
        case 3:
          resultSounds = _context3.v;
          _context3.n = 4;
          return resultSounds.json();
        case 4:
          this.sounds = _context3.v;
          this.registerEvents();
        case 5:
          return _context3.a(2);
      }
    }, _callee3, this);
  }));
  api.registerEvents = function () {
    document.querySelectorAll('[data-command]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        var target = event.currentTarget;
        var data = target.dataset;

        // Check if command is in list of supported events
        // This can be dropped after all actions are migrated
        if (!['remotebuzzer', 'reload'].includes(data.command)) {
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        var name = 'photobooth.' + data.command;
        var detail = {
          trigger: target,
          data: Object.assign({}, data)
        };
        api.console.log('dispatch: ' + name);
        var customEvent = new CustomEvent(name, {
          detail: detail
        });
        document.dispatchEvent(customEvent);
      });
    });
    document.addEventListener('photobooth.remotebuzzer', function (event) {
      api.getRequest(window.location.protocol + '//' + config.remotebuzzer.serverip + ':' + config.remotebuzzer.port + '/commands/' + event.detail.data.action);
    });
    document.addEventListener('photobooth.reload', function () {
      api.reloadPage();
    });
  };
  api.console = {
    log: function log() {
      for (var _len = arguments.length, content = new Array(_len), _key = 0; _key < _len; _key++) {
        content[_key] = arguments[_key];
      }
      console.log('[', new Date().toISOString(), ']: ' + JSON.stringify(content));
    },
    logDev: function logDev() {
      if (config.dev.loglevel > 0) {
        for (var _len2 = arguments.length, content = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          content[_key2] = arguments[_key2];
        }
        console.log('[', new Date().toISOString(), ']: ' + JSON.stringify(content));
      }
    }
  };
  api.getTranslation = function (key) {
    if (!this.translations[key]) {
      this.console.logDev('translation key not found: ' + key);
      return key;
    }
    return this.translations[key];
  };
  api.getSound = function (key) {
    if (!this.sounds[key]) {
      this.console.logDev('sound key not found: ' + key);
      return null;
    }
    return this.sounds[key];
  };
  api.overlay = {
    element: null,
    show: function show(message) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';
      if (api.overlay.element === null) {
        var element = document.createElement('div');
        element.classList.add('overlay');
        document.body.append(element);
        api.overlay.element = element;
      }
      api.overlay.element.innerHTML = message;
      api.overlay.element.dataset.type = type;
    },
    showWaiting: function showWaiting(message) {
      api.overlay.show('<div><i class="' + config.icons.spinner + '"></i></div><div>' + message + '</div>', 'progress');
    },
    showSuccess: function showSuccess(message) {
      api.overlay.show(message, 'success');
    },
    showWarning: function showWarning(message) {
      api.overlay.show(message, 'warning');
    },
    showError: function showError(message) {
      api.overlay.show(message, 'error');
    },
    close: function close() {
      if (api.overlay.element !== null) {
        api.overlay.element.remove();
        api.overlay.element = null;
      }
    }
  };
  api.button = {
    create: function create(label, iconClass) {
      var severity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'default';
      var prefix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
      var button = document.createElement('button');
      button.classList.add(prefix + 'button');
      button.classList.add('rotaryfocus');
      button.dataset.severity = severity;
      var iconWrap = document.createElement('span');
      iconWrap.classList.add(prefix + 'button--icon');
      var icon = document.createElement('i');
      icon.classList = iconClass;
      iconWrap.appendChild(icon);
      button.appendChild(iconWrap);
      if (label === '') {
        return button;
      }
      var labelWrap = document.createElement('span');
      labelWrap.classList.add(prefix + 'button--label');
      labelWrap.innerHTML = api.getTranslation(label);
      button.appendChild(labelWrap);
      return button;
    }
  };
  api.modal = {
    element: null,
    open: function open() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';
      if (api.modal.element === null) {
        var element = document.createElement('div');
        element.dataset.type = type;
        element.classList.add('modal');
        element.classList.add('rotarygroup');
        var inner = document.createElement('div');
        inner.classList.add('modal-inner');
        element.appendChild(inner);
        var body = document.createElement('div');
        body.classList.add('modal-body');
        inner.appendChild(body);
        var buttonbar = document.createElement('div');
        buttonbar.classList.add('modal-buttonbar');
        var closeButton = api.button.create('close', 'fa fa-times', 'default', 'modal-');
        closeButton.addEventListener('click', function () {
          return api.modal.close();
        });
        buttonbar.appendChild(closeButton);
        inner.appendChild(buttonbar);
        document.body.append(element);
        api.modal.element = element;
      }
    },
    close: function close() {
      if (api.modal.element !== null) {
        api.modal.element.remove();
        api.modal.element = null;
      }
    },
    empty: function empty() {
      if (api.modal.element !== null) {
        var body = api.modal.element.querySelector('.modal-body');
        if (body) {
          body.innerHTML = '';
        }
      }
    },
    append: function append(content) {
      if (api.modal.element !== null) {
        var body = api.modal.element.querySelector('.modal-body');
        if (body) {
          if (typeof content === 'string') {
            body.insertAdjacentHTML('beforeend', content);
          } else if (content instanceof HTMLElement) {
            body.appendChild(content);
          } else if (window.jQuery && content instanceof window.jQuery) {
            $(body).append(content);
          }
        }
      }
    }
  };
  var notificationTimer;
  api.showNotification = function (type, message) {
    var element = document.getElementById('photobooth-notification');
    if (!element) {
      element = document.createElement('div');
      element.id = 'photobooth-notification';
      element.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:100000;max-width:80vw;padding:14px 22px;border-radius:12px;background:#172033;color:white;box-shadow:0 4px 24px #0008;text-align:center;pointer-events:none;';
      document.body.appendChild(element);
    }
    clearTimeout(notificationTimer);
    element.setAttribute('role', type === 'error' ? 'alert' : 'status');
    element.textContent = String(message);
    element.hidden = false;
    notificationTimer = setTimeout(function () {
      element.hidden = true;
    }, type === 'error' ? 7000 : 3500);
  };
  api.confirm = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(confirmationText) {
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            return _context4.a(2, new Promise(function (resolve) {
              var element = document.createElement('dialog');
              element.classList.add('dialog');
              element.classList.add('rotarygroup');
              var message = document.createElement('div');
              message.classList.add('dialog-message');
              message.textContent = confirmationText;
              element.appendChild(message);
              var buttonbar = document.createElement('div');
              buttonbar.classList.add('dialog-buttonbar');
              element.appendChild(buttonbar);

              // confirm
              var confirmButton = api.button.create('confirm', 'fa fa-check', 'default', 'dialog-');
              confirmButton.addEventListener('click', function () {
                element.close(true);
                element.remove();
                resolve(true);
              });
              buttonbar.appendChild(confirmButton);

              // cancel
              var cancelButton = api.button.create('cancel', 'fa fa-times', 'default', 'dialog-');
              cancelButton.addEventListener('click', function () {
                element.close(false);
                element.remove();
                resolve(false);
              });
              buttonbar.appendChild(cancelButton);
              element.addEventListener('cancel', function () {
                element.close(false);
                element.remove();
                resolve(false);
              });
              document.body.append(element);
              element.showModal();
            }));
        }
      }, _callee4);
    }));
    return function (_x2) {
      return _ref5.apply(this, arguments);
    };
  }();
  api.askCopies = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          return _context5.a(2, new Promise(function (resolve) {
            var element = document.createElement('dialog');
            element.classList.add('dialog');
            element.classList.add('rotarygroup');
            var message = document.createElement('div');
            message.classList.add('dialog-message');
            message.textContent = api.getTranslation('print:choose_copies');
            element.appendChild(message);
            var inputSection = document.createElement('div');
            inputSection.classList.add('buttonbar--print-copies');
            var minusButton = api.button.create('', 'fa fa-minus', 'default', '');
            var plusButton = api.button.create('', 'fa fa-plus', 'default', '');
            var inputText = document.createElement('input');
            inputText.classList.add('form-input-copies');
            inputText.value = '1';
            minusButton.addEventListener('click', function () {
              var oldValue = parseInt(inputText.value, 10);
              inputText.value = String(Math.max(1, oldValue - 1));
            });
            plusButton.addEventListener('click', function () {
              var oldValue = parseInt(inputText.value, 10);
              inputText.value = String(Math.min(config.print.max_multi, oldValue + 1));
            });
            inputSection.append(minusButton);
            inputSection.append(inputText);
            inputSection.append(plusButton);
            element.append(inputSection);
            var buttonbar = document.createElement('div');
            buttonbar.classList.add('dialog-buttonbar');
            element.appendChild(buttonbar);

            // confirm
            var confirmButton = api.button.create('print', 'fa fa-check', 'default', 'dialog-');
            confirmButton.addEventListener('click', function () {
              element.close(true);
              element.remove();
              resolve(inputText.value);
            });
            buttonbar.appendChild(confirmButton);

            // cancel
            var cancelButton = api.button.create('cancel', 'fa fa-times', 'default', 'dialog-');
            cancelButton.addEventListener('click', function () {
              element.close(false);
              element.remove();
              resolve(false);
            });
            buttonbar.appendChild(cancelButton);
            element.addEventListener('cancel', function () {
              element.close(false);
              element.remove();
              resolve(false);
            });
            document.body.append(element);
            element.showModal();
          }));
      }
    }, _callee5);
  }));
  api.reloadPage = function () {
    var url = new URL(window.location.href);
    url.searchParams.set('refresh', '1');
    window.location.href = url.toString();
  };
  api.getRequest = function (url) {
    api.console.log('Sending GET request to: ' + url);
    fetch(new Request(addCsrfToUrl(url)), {
      method: 'GET',
      mode: 'cors',
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status === 200) {
        return response.text();
      } else if (response.status === 403) {
        return response.text().then(function (bodyText) {
          throw new Error(bodyText || 'Forbidden');
        });
      } else if (response.status === 404) {
        throw new Error('No records found');
      } else {
        throw new Error('Unhandled request status: ' + response.status);
      }
    }).then(function (data) {
      api.console.log(data);
    })["catch"](function (error) {
      if (api.isCsrfErrorText(error.message)) {
        api.handleCsrfMismatch(url);
        return;
      }
      api.console.log('Error occurred: ' + error.message);
    });
  };
  api.isVideoFile = function (filename) {
    var extension = api.getFileExtension(filename);
    return extension === 'mp4' || extension === 'gif';
  };
  api.getFileExtension = function (filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
  };
  api.resetPrintErrorMessage = function (cb, to) {
    setTimeout(function () {
      api.overlay.close();
      cb();
      api.isPrinting = false;
    }, to);
  };
  api.printImage = function (imageSrc, copies, cb) {
    if (api.isVideoFile(imageSrc)) {
      api.console.log('ERROR: An error occurred: attempt to print non printable file.');
      api.overlay.showError(api.getTranslation('no_printing'));
      setTimeout(function () {
        return api.overlay.close();
      }, notificationTimeout);
    } else if (api.isPrinting) {
      api.console.log('Printing in progress: ' + api.isPrinting);
    } else {
      api.overlay.show(api.getTranslation('printing'));
      api.isPrinting = true;
      if (typeof remoteBuzzerClient !== 'undefined') {
        remoteBuzzerClient.inProgress('print');
      }
      $.ajax({
        method: 'GET',
        url: environment.publicFolders.api + '/print.php',
        data: _defineProperty({
          filename: imageSrc,
          copies: copies
        }, csrf.key, csrf.token),
        success: function success(data) {
          api.console.log('Picture processed: ', data);
          if (data.status == 'locking') {
            api.overlay.showWarning(config.print.locking_msg + ' (' + api.getTranslation('printed') + ' ' + data.count + ')');
            api.resetPrintErrorMessage(cb, config.print.time);
            $('.print-unlock-button').removeClass('hidden');
          } else if (data.status == 'queued') {
            api.overlay.showWarning(api.getTranslation('print_queued'));
            api.resetPrintErrorMessage(cb, 2000);
          } else if (data.status == 'error') {
            if (data.error) {
              api.console.log('ERROR: An error occurred: ', data.error);
              api.overlay.showError(data.error);
            } else {
              api.console.log('ERROR: An error occurred on print.');
              api.overlay.showError(api.getTranslation('error'));
            }
            api.resetPrintErrorMessage(cb, config.print.time);
          } else {
            setTimeout(function () {
              api.overlay.close();
              cb();
              api.isPrinting = false;
            }, config.print.time);
          }
        },
        error: function error(jqXHR, textStatus) {
          api.console.log('ERROR: Print failed: ', textStatus);
          api.overlay.showError(api.getTranslation('error'));
          api.resetPrintErrorMessage(cb, notificationTimeout);
        }
      });
    }
  };
  $(document).on('keyup', function (ev) {
    if (config.reload.key && parseInt(config.reload.key, 10) === ev.keyCode) {
      api.reloadPage();
    }
  });
  return api;
}();
window.photoboothTools = photoboothTools;

// Init on domready
$(function () {
  photoboothTools.initialize().then(function () {
    photoboothTools.console.log('PhotoboothTools: initialized');
    photoboothTools.console.log('Loglevel: ' + config.dev.loglevel);
  });
});
