"use strict";

/* globals photoboothTools */
$(function () {
  initDirtyTracking();
  initStartpageTextPositionConstraint();

  // adminRangeInput
  $(document).on('input', '.adminRangeInput', function () {
    document.querySelector('#' + this.name.replace('[', '\\[').replace(']', '\\]') + '-value span').innerHTML = this.value;
  });

  // Localization of toggle button text
  $('.adminCheckbox').on('click', function () {
    if ($(this).find('input').is(':checked')) {
      $('.adminCheckbox-true', this).removeClass('hidden');
      $('.adminCheckbox-false', this).addClass('hidden');
    } else {
      $('.adminCheckbox-true', this).addClass('hidden');
      $('.adminCheckbox-false', this).removeClass('hidden');
    }
  });
  initCollageLayoutOptions();
});
function initStartpageTextPositionConstraint() {
  var $logoEnabled = $('input[type="checkbox"][name="logo[enabled]"]');
  var $logoPosition = $('select[name="logo[position]"]');
  var $textPosition = $('select[name="ui[startpage_text_position]"]');
  if ($logoEnabled.length === 0 || $logoPosition.length === 0 || $textPosition.length === 0) {
    return;
  }
  var sync = function sync() {
    var isCenteredLogo = $logoEnabled.is(':checked') && $logoPosition.val() === 'center';
    $textPosition.find('option').each(function () {
      var shouldDisable = isCenteredLogo && this.value !== 'bottom';
      $(this).prop('disabled', shouldDisable);
    });
    if (isCenteredLogo && $textPosition.val() !== 'bottom') {
      $textPosition.val('bottom').trigger('change');
    }
  };
  $logoEnabled.on('change', sync);
  $logoPosition.on('change', sync);
  $textPosition.on('change', sync);
  sync();
}
function initCollageLayoutOptions() {
  if (typeof environment === 'undefined' || !environment.publicFolders || !environment.publicFolders.api) {
    return;
  }
  var layoutSelect = document.querySelector('select[name="collage[layout]"]');
  var layoutGrid = document.querySelector('[data-setting-name="collage[layouts_enabled]"]');
  if (!layoutSelect && !layoutGrid) {
    return;
  }
  fetchCollageLayouts().then(function (layouts) {
    if (!layouts) {
      return;
    }
    if (layoutSelect) {
      updateCollageLayoutSelect(layoutSelect, layouts);
    }
    if (layoutGrid) {
      updateCollageLayoutsEnabled(layoutGrid, layouts);
    }
  });
}
function fetchCollageLayouts() {
  var orientation = 'landscape';
  if (typeof config !== 'undefined' && config.collage && config.collage.orientation) {
    orientation = String(config.collage.orientation);
  }
  var url = environment.publicFolders.api + '/getCollageLayouts.php?orientation=' + encodeURIComponent(orientation);
  return new Promise(function (resolve) {
    $.ajax({
      url: url,
      method: 'GET',
      cache: false,
      dataType: 'json'
    }).done(function (data) {
      resolve(Array.isArray(data) ? data : []);
    }).fail(function () {
      resolve(null);
    });
  });
}
function updateCollageLayoutSelect(selectEl, layouts) {
  var currentValue = selectEl.value;
  if ((!currentValue || currentValue === '') && typeof config !== 'undefined' && config.collage) {
    currentValue = String(config.collage.layout || '');
  }
  var ordered = [];
  var seen = {};
  layouts.forEach(function (layout) {
    if (!layout || !layout.id) {
      return;
    }
    var id = String(layout.id);
    if (seen[id]) {
      return;
    }
    seen[id] = true;
    ordered.push({
      id: id,
      label: layout.label ? String(layout.label) : id
    });
  });
  if (currentValue && !seen[currentValue]) {
    ordered.push({
      id: currentValue,
      label: currentValue
    });
  }
  selectEl.innerHTML = '';
  ordered.forEach(function (layout) {
    var option = document.createElement('option');
    option.value = layout.id;
    option.textContent = layout.label;
    if (layout.id === currentValue) {
      option.selected = true;
    }
    selectEl.appendChild(option);
  });
}
function updateCollageLayoutsEnabled(gridEl, layouts) {
  var selected = readSelectedLayouts();
  var ordered = [];
  var seen = {};
  layouts.forEach(function (layout) {
    if (!layout || !layout.id) {
      return;
    }
    var id = String(layout.id);
    if (seen[id]) {
      return;
    }
    seen[id] = true;
    ordered.push({
      id: id,
      label: layout.label ? String(layout.label) : id,
      preview: layout.preview ? String(layout.preview) : ''
    });
  });
  selected.forEach(function (id) {
    if (!seen[id]) {
      ordered.push({
        id: id,
        label: id,
        preview: ''
      });
    }
  });
  gridEl.innerHTML = '';
  ordered.forEach(function (layout) {
    var isSelected = selected.indexOf(layout.id) !== -1;
    gridEl.appendChild(buildLayoutToggleOption(layout.id, layout.label, isSelected, layout.preview));
  });
  bindToggleButtons(gridEl);
  setupAllowSelectionGuard(gridEl);
}
function readSelectedLayouts() {
  if (typeof config !== 'undefined' && config.collage && Array.isArray(config.collage.layouts_enabled)) {
    return config.collage.layouts_enabled.map(function (value) {
      return String(value);
    });
  }
  var selected = [];
  document.querySelectorAll('input[name="collage[layouts_enabled][]"]:checked').forEach(function (checkbox) {
    selected.push(checkbox.value);
  });
  return selected;
}
function buildLayoutToggleOption(layoutId, label, isSelected, previewSvg) {
  var wrapper = document.createElement('label');
  wrapper.className = 'relative cursor-pointer';
  var input = document.createElement('input');
  input.type = 'checkbox';
  input.name = 'collage[layouts_enabled][]';
  input.value = layoutId;
  input.className = 'hidden toggle-checkbox';
  if (isSelected) {
    input.checked = true;
  }
  var activeClass = isSelected ? 'bg-brand-1 text-white border-brand-1' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-1';
  var button = document.createElement('div');
  button.className = 'toggle-button px-3 py-2 border text-sm rounded-md text-center transition-all ' + activeClass;
  button.style.display = 'flex';
  button.style.flexDirection = 'column';
  button.style.alignItems = 'center';
  button.style.gap = '0.5rem';
  if (previewSvg) {
    var preview = document.createElement('div');
    preview.className = 'bg-white border border-gray-200 rounded overflow-hidden';
    preview.style.display = 'flex';
    preview.style.alignItems = 'center';
    preview.style.justifyContent = 'center';
    preview.style.width = '112px';
    preview.style.height = '80px';
    preview.innerHTML = previewSvg;
    var previewSvgNode = preview.querySelector('svg');
    if (previewSvgNode) {
      previewSvgNode.setAttribute('width', '112');
      previewSvgNode.setAttribute('height', '80');
    }
    button.appendChild(preview);
  }
  var labelEl = document.createElement('div');
  labelEl.className = 'text-xs font-medium';
  labelEl.textContent = label;
  button.appendChild(labelEl);
  wrapper.appendChild(input);
  wrapper.appendChild(button);
  return wrapper;
}
function bindToggleButtons(container) {
  container.querySelectorAll('.toggle-checkbox').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      var button = this.nextElementSibling;
      if (!button) {
        return;
      }
      if (this.checked) {
        button.classList.remove('bg-white', 'text-gray-700', 'border-gray-300', 'hover:border-brand-1');
        button.classList.add('bg-brand-1', 'text-white', 'border-brand-1');
      } else {
        button.classList.remove('bg-brand-1', 'text-white', 'border-brand-1');
        button.classList.add('bg-white', 'text-gray-700', 'border-gray-300', 'hover:border-brand-1');
      }
    });
    var button = checkbox.nextElementSibling;
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        checkbox.click();
      });
    }
  });
}
function setupAllowSelectionGuard(container) {
  var allowSelection = document.querySelector('input[type="checkbox"][name="collage[allow_selection]"]');
  if (!allowSelection) {
    return;
  }
  var allowWrapper = allowSelection.closest('.adminCheckbox');
  var warningId = 'collage-allow-selection-warning';
  var warning = document.getElementById(warningId);
  if (!warning && allowWrapper) {
    warning = document.createElement('div');
    warning.id = warningId;
    warning.className = 'mt-2 text-xs text-red-600';
    warning.style.display = 'none';
    if (typeof photoboothTools !== 'undefined' && photoboothTools.getTranslation) {
      warning.textContent = photoboothTools.getTranslation('collage_select_min_two_layouts');
    } else {
      warning.textContent = 'Select at least two layouts to enable selection.';
    }
    allowWrapper.insertAdjacentElement('afterend', warning);
  }
  var syncAllowToggleText = function syncAllowToggleText(isChecked) {
    if (!allowWrapper) {
      return;
    }
    var onLabel = allowWrapper.querySelector('.adminCheckbox-true');
    var offLabel = allowWrapper.querySelector('.adminCheckbox-false');
    if (onLabel && offLabel) {
      if (isChecked) {
        onLabel.classList.remove('hidden');
        offLabel.classList.add('hidden');
      } else {
        onLabel.classList.add('hidden');
        offLabel.classList.remove('hidden');
      }
    }
  };
  var getUniqueSelectedLayoutCount = function getUniqueSelectedLayoutCount() {
    var checked = container.querySelectorAll('input[type="checkbox"][name="collage[layouts_enabled][]"]:checked');
    var values = new Set();
    checked.forEach(function (checkbox) {
      return values.add(checkbox.value);
    });
    return values.size;
  };
  var guardAllowSelection = function guardAllowSelection() {
    var count = getUniqueSelectedLayoutCount();
    if (warning) {
      warning.style.display = count < 2 ? 'block' : 'none';
    }
    if (allowSelection.checked && count < 2) {
      allowSelection.checked = false;
      syncAllowToggleText(false);
    }
  };
  allowSelection.addEventListener('change', guardAllowSelection);
  container.querySelectorAll('.toggle-checkbox').forEach(function (checkbox) {
    checkbox.addEventListener('change', guardAllowSelection);
  });
  guardAllowSelection();
}

// eslint-disable-next-line no-unused-vars
var shellCommand = function shellCommand($mode) {
  var $filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var command = {
    mode: $mode,
    filename: $filename
  };
  photoboothTools.console.log('Run' + $mode);
  photoboothTools.ajaxWithCsrf({
    url: '../api/shellCommand.php',
    method: 'POST',
    data: command
  }).done(function (result) {
    photoboothTools.console.log($mode, 'result: ', result);
  }).fail(function (xhr, status, errorThrown) {
    if (photoboothTools.isCsrfErrorResponse(xhr)) {
      photoboothTools.handleCsrfMismatch('../api/shellCommand.php');
      return;
    }
    photoboothTools.console.log($mode, 'result: ', errorThrown);
  });
};
function initDirtyTracking() {
  var $fields = $('.adminSection').find('input, select, textarea').not('[type="hidden"]');
  $fields.each(function () {
    var $el = $(this);
    $el.data('initial', readFieldValue($el));
  });
  $(document).on('change input', '.adminSection input, .adminSection select, .adminSection textarea', function () {
    updateDirtyState($(this));
  });
  $(document).on('click', '.adminSettingCard-revert', function (e) {
    e.preventDefault();
    var $card = $(this).closest('.adminSettingCard');
    revertCard($card);
  });
}
function readFieldValue($el) {
  var el = $el[0];
  if (el.tagName === 'SELECT' && el.multiple) {
    return ($el.val() || []).slice().sort().join('|');
  }
  if (el.type === 'checkbox') {
    return $el.is(':checked') ? '1' : '0';
  }
  return $el.val();
}
function updateDirtyState($el) {
  var initial = $el.data('initial');
  var current = readFieldValue($el);
  var isDirty = initial !== current;
  var $card = $el.closest('.adminSettingCard');
  if ($card.length === 0) {
    return;
  }
  if (isDirty) {
    $card.addClass('ring-2 ring-indigo-200 shadow-indigo-200');
    $el.data('dirty', true);
    ensureRevertButton($card);
  } else {
    $el.data('dirty', false);
    if (!$card.find('input,select,textarea').filter(function () {
      return $(this).data('dirty');
    }).length) {
      $card.removeClass('ring-2 ring-indigo-200 shadow-indigo-200');
      removeRevertButton($card);
    }
  }
}
function ensureRevertButton($card) {
  if ($card.find('.adminSettingCard-revert').length) {
    return;
  }
  var btn = $('<button type="button" class="adminSettingCard-revert h-7 w-7 absolute right-2 top-2 text-xs font-semibold text-amber-700 border border-amber-400 rounded-full bg-amber-50 hover:bg-amber-100" title="Revert">' + '<i class="fa fa-undo"></i>' + '</button>');
  $card.append(btn);
}
function removeRevertButton($card) {
  $card.find('.adminSettingCard-revert').remove();
}
function revertCard($card) {
  $card.find('input,select,textarea').each(function () {
    var $el = $(this);
    var initial = $el.data('initial');
    restoreFieldValue($el, initial);
    $el.data('dirty', false);
  });
  $card.removeClass('ring-2 ring-indigo-400 shadow-indigo-200');
  removeRevertButton($card);
}
function restoreFieldValue($el, value) {
  var el = $el[0];
  if (el.tagName === 'SELECT' && el.multiple) {
    var list = (value || '').split('|').filter(function (v) {
      return v !== '';
    });
    $el.val(list);
  } else if (el.type === 'checkbox') {
    $el.prop('checked', value === '1');
  } else {
    $el.val(value);
  }
  $el.trigger('change');

  // Keep range labels in sync after revert
  if ($el.hasClass('adminRangeInput')) {
    var labelId = '#' + el.name.replace('[', '\\[').replace(']', '\\]') + '-value span';
    var labelEl = document.querySelector(labelId);
    if (labelEl) {
      labelEl.innerHTML = $el.val();
    }
  }
}