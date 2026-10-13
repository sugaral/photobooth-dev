"use strict";

// eslint-disable-next-line no-unused-vars
function adminImageSelect(element, path) {
  var parent = element.closest('.adminImageSelection');
  var origin = element.dataset.origin;
  var src = element.src;
  var previewElement = parent.querySelector('.adminImageSelection-preview');
  var textElement = parent.querySelector('.adminImageSelection-text');
  var inputElement = parent.querySelector('input[name="' + path + '"]');
  previewElement.src = src;
  textElement.textContent = origin;
  inputElement.value = origin;
  if (src !== '') {
    previewElement.parentElement.classList.remove('hidden');
  } else {
    previewElement.parentElement.classList.add('hidden');
  }
  var event = new Event('change');
  inputElement.dispatchEvent(event);
  var toggleGeneralCheckbox = function toggleGeneralCheckbox(checkboxName) {
    var checkbox = document.querySelector("input[name='".concat(checkboxName, "'][data-trigger='general']"));
    if (checkbox && checkbox.checked === false) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
    }
  };
  if (path === 'generator-background') {
    toggleGeneralCheckbox('show-background');
  }
  if (path === 'generator-frame') {
    toggleGeneralCheckbox('show-frame');
  }
  parent.classList.remove('isOpen');
}

// eslint-disable-next-line no-unused-vars
function openAdminImageSelect(element) {
  element.closest('.adminImageSelection').classList.add('isOpen');
}

// eslint-disable-next-line no-unused-vars
function closeAdminImageSelect() {
  var selections = document.querySelectorAll('.adminImageSelection');
  selections.forEach(function (selection) {
    selection.classList.remove('isOpen');
  });
}