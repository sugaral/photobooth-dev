"use strict";

function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/* eslint n/no-unsupported-features/node-builtins: "off" */
/* globals photoboothTools csrf */
$(function () {
  function initThemes() {
    var apiBase = environment.publicFolders.api + '/themes.php';
    var $nameInput = $('#theme-name');
    var $saveButton = $('#theme-save-btn');
    var $loadButton = $('#theme-load-btn');
    var $deleteButton = $('#theme-delete-btn');
    var $exportButton = $('#theme-export-btn');
    var $importButton = $('#theme-import-btn');
    var $importInput = $('#theme-import-input');
    var $select = $('#theme-select');
    var $currentInput = $('input[name="theme[current]"]');
    var lastAppliedThemeSnapshot = null;
    function snapshotTheme() {
      lastAppliedThemeSnapshot = JSON.stringify(collectCurrentTheme());
    }
    function hasUnsavedChanges() {
      if (lastAppliedThemeSnapshot === null) {
        return false;
      }
      return JSON.stringify(collectCurrentTheme()) !== lastAppliedThemeSnapshot;
    }
    function updateLoadButtonState() {
      if ($loadButton.length === 0 || $deleteButton.length === 0 || $exportButton.length === 0) {
        return;
      }
      var selected = $select.val();
      var current = $currentInput.length ? $currentInput.val() : '';
      var isDifferent = selected && current && selected !== current;

      // Highlight load button in green when a different theme is selected
      if (isDifferent) {
        $loadButton.addClass('ring-2 ring-green-500');
      } else {
        $loadButton.removeClass('ring-2 ring-green-500');
      }

      // Disable load button when no theme is selected
      if (!selected) {
        $loadButton.prop('disabled', true);
        $loadButton.addClass('opacity-40 cursor-not-allowed');
      } else {
        $loadButton.prop('disabled', false);
        $loadButton.removeClass('opacity-40 cursor-not-allowed');
      }
      var disabledClasses = 'opacity-40 cursor-not-allowed';
      var toggleButton = function toggleButton(button, isDisabled) {
        button.prop('disabled', isDisabled);
        button.toggleClass(disabledClasses, isDisabled);
      };
      toggleButton($deleteButton, !selected);
      toggleButton($exportButton, !selected);
    }
    function getThemeElements() {
      var elements = [];
      $('[data-theme-field="true"]').each(function (_, el) {
        var $el = $(el);
        if ($el.attr('type') === 'hidden') {
          return;
        }
        elements.push(el);
      });
      return elements;
    }
    function parseFieldName(name) {
      var parts = [];
      var regex = /([^[]+)|\[([^\]]*)\]/g;
      var match;
      while ((match = regex.exec(name)) !== null) {
        var key = match[1] || match[2];
        if (key !== '') {
          parts.push(key);
        }
      }
      return parts;
    }
    function setNestedValue(target, path, value) {
      if (!Array.isArray(path) || path.length === 0) {
        return;
      }
      var current = target;
      for (var i = 0; i < path.length - 1; i++) {
        var key = path[i];
        if (!Object.prototype.hasOwnProperty.call(current, key) || _typeof(current[key]) !== 'object' || current[key] === null) {
          current[key] = {};
        }
        current = current[key];
      }
      current[path[path.length - 1]] = value;
    }
    function getNestedValue(source, path) {
      if (!Array.isArray(path) || path.length === 0) {
        return undefined;
      }
      var current = source;
      for (var i = 0; i < path.length; i++) {
        var key = path[i];
        if (!current || !Object.prototype.hasOwnProperty.call(current, key)) {
          return undefined;
        }
        current = current[key];
      }
      return current;
    }
    function collectCurrentTheme() {
      var elements = getThemeElements();
      var data = {};
      elements.forEach(function (el) {
        var $el = $(el);
        var name = $el.attr('name');
        if (!name) {
          return;
        }
        var path = parseFieldName(name);
        if (!path.length) {
          return;
        }
        var value;
        if (el.tagName === 'INPUT') {
          if ($el.attr('type') === 'checkbox') {
            value = $el.is(':checked') ? 'true' : 'false';
          } else {
            value = $el.val();
          }
        } else if (el.tagName === 'SELECT') {
          value = $el.val();
        } else if (el.tagName === 'TEXTAREA') {
          value = $el.val();
        }
        setNestedValue(data, path, value);
      });
      return data;
    }
    function applyTheme(theme) {
      if (!theme || _typeof(theme) !== 'object') {
        return;
      }
      var elements = getThemeElements();
      elements.forEach(function (el) {
        var $el = $(el);
        var name = $el.attr('name');
        if (!name) {
          return;
        }
        var path = parseFieldName(name);
        var value = getNestedValue(theme, path);

        // Fallback for older flat themes
        if (typeof value === 'undefined' && Object.prototype.hasOwnProperty.call(theme, name)) {
          value = theme[name];
        }
        if (el.tagName === 'INPUT') {
          var isCheckbox = $el.attr('type') === 'checkbox';
          var normalized = typeof value === 'undefined' ? isCheckbox ? false : '' : value;
          if (isCheckbox) {
            $el.prop('checked', normalized === true || normalized === 'true');
          } else {
            $el.val(normalized);
          }
        } else if (el.tagName === 'SELECT') {
          $el.val(typeof value === 'undefined' ? '' : value).trigger('change');
        } else if (el.tagName === 'TEXTAREA') {
          $el.val(typeof value === 'undefined' ? '' : value);
        }
        $el.trigger('change');
      });
    }
    function refreshSelect() {
      var desiredSelection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var current = $currentInput.length ? $currentInput.val() : '';
      var previousSelected = $select.val();
      var targetSelection = desiredSelection !== null && desiredSelection !== void 0 ? desiredSelection : previousSelected;
      $.getJSON(apiBase, {
        action: 'list',
        _: Date.now()
      }).done(function (data) {
        var themes = Array.isArray(data.themes) ? data.themes : [];
        $select.empty();
        $('<option>', {
          value: '',
          text: photoboothTools.getTranslation('theme_choose')
        }).appendTo($select);
        themes.slice().sort().forEach(function (key) {
          $('<option>', {
            value: key,
            text: key,
            selected: key === previousSelected || key === targetSelection
          }).appendTo($select);
        });
        if (current && $nameInput.length) {
          $nameInput.val(current);
        }
        if (targetSelection) {
          $select.val(targetSelection);
        }
        updateLoadButtonState();
        if (lastAppliedThemeSnapshot === null) {
          snapshotTheme();
        }
      }).fail(function () {
        photoboothTools.overlay.showError(photoboothTools.getTranslation('error'));
      });
    }
    $select.on('change', function () {
      updateLoadButtonState();
    });
    $saveButton.on('click', function () {
      var name = $nameInput.val().trim();
      if (!name) {
        return;
      }
      var themeExists = Array.from($select.find('option')).some(function (opt) {
        return opt.value === name;
      });
      if (themeExists) {
        var confirmMessage = photoboothTools.getTranslation('theme_override_confirm').replace('%s', name);
        var confirmed = window.confirm(confirmMessage);
        if (!confirmed) {
          return;
        }
      }
      var payload = _defineProperty({
        action: 'save',
        name: name,
        theme: collectCurrentTheme()
      }, csrf.key, csrf.token);
      $.ajax({
        url: apiBase,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        dataType: 'json'
      }).done(function () {
        if ($currentInput.length) {
          $currentInput.val(name);
        }
        $select.val(name);
        $nameInput.val(name);
        refreshSelect();
        updateLoadButtonState();
        snapshotTheme();
      }).fail(function () {
        photoboothTools.overlay.showError(photoboothTools.getTranslation('error'));
      });
    });
    $loadButton.on('click', function () {
      var selected = $select.val();
      if (!selected) {
        return;
      }
      if (hasUnsavedChanges()) {
        var confirmMessage = photoboothTools.getTranslation('theme_unsaved_confirm');
        var confirmed = window.confirm(confirmMessage);
        if (!confirmed) {
          return;
        }
      }
      $.getJSON(apiBase, _defineProperty({
        action: 'get',
        name: selected,
        _: Date.now()
      }, csrf.key, csrf.token)).done(function (data) {
        if (data.status === 'success' && data.theme) {
          applyTheme(data.theme);
          if ($currentInput.length) {
            $currentInput.val(selected);
          }
          if ($nameInput.length) {
            $nameInput.val(selected);
          }
          snapshotTheme();
          updateLoadButtonState();
        }
      }).fail(function () {
        photoboothTools.overlay.showError(photoboothTools.getTranslation('error'));
      });
    });
    $deleteButton.on('click', function () {
      var selected = $select.val();
      if (!selected) {
        return;
      }
      var payload = _defineProperty({
        action: 'delete',
        name: selected
      }, csrf.key, csrf.token);
      $.ajax({
        url: apiBase,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        dataType: 'json'
      }).done(function () {
        refreshSelect();
        updateLoadButtonState();
      }).fail(function () {
        photoboothTools.overlay.showError(photoboothTools.getTranslation('error'));
      });
    });
    $exportButton.on('click', function () {
      var selected = $select.val();
      if (!selected) {
        return;
      }
      var url = "".concat(apiBase, "?action=export&name=").concat(encodeURIComponent(selected), "&_=").concat(Date.now());
      var sep = url.includes('?') ? '&' : '?';
      var csrfUrl = "".concat(url).concat(sep).concat(csrf.key, "=").concat(encodeURIComponent(csrf.token));
      var link = document.createElement('a');
      link.href = csrfUrl;
      link.download = "".concat(selected, ".zip");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    $importButton.on('click', function () {
      if ($importInput.length) {
        $importInput.trigger('click');
      }
    });
    $importInput.on('change', function onImportChange() {
      var file = this.files ? this.files[0] : null;
      if (!file) {
        return;
      }
      $('.pageLoader').addClass('isActive');
      $('.pageLoader').find('label').html(photoboothTools.getTranslation('busy'));
      var formData = new FormData();
      formData.append('action', 'import');
      formData.append('theme_zip', file);
      formData.append(csrf.key, csrf.token);
      var desiredName = $nameInput.length ? $nameInput.val().trim() : '';
      if (desiredName) {
        formData.append('name', desiredName);
      }
      $.ajax({
        url: apiBase,
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json'
      }).done(function (data) {
        if (data.status !== 'success') {
          photoboothTools.overlay.showError(photoboothTools.getTranslation('error'));
          return;
        }
        var importedName = data.name || desiredName;
        if (data.theme) {
          applyTheme(data.theme);
          snapshotTheme();
        }
        if ($currentInput.length && importedName) {
          $currentInput.val(importedName);
        }
        if ($nameInput.length && importedName) {
          $nameInput.val(importedName);
        }
        refreshSelect(importedName);
        updateLoadButtonState();
      }).fail(function () {
        photoboothTools.overlay.showError(photoboothTools.getTranslation('error'));
      }).always(function () {
        $('.pageLoader').removeClass('isActive');
        $importInput.val('');
      });
    });
    refreshSelect();
    updateLoadButtonState();
  }
  photoboothTools.initialize().then(function () {
    initThemes();
  });
});