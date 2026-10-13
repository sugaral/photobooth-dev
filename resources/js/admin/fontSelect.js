"use strict";

// eslint-disable-next-line no-unused-vars
function adminFontSelect(element, path, fontclass) {
  var parent = element.closest('.adminFontSelection');
  var origin = element.dataset.origin;
  var src = element.src;
  var previewElement = parent.querySelector('.adminFontSelection-preview');
  var textElement = parent.querySelector('.adminFontSelection-text');
  var inputElement = parent.querySelector('input[name="' + path + '"]');
  previewElement.src = src;
  textElement.textContent = origin;
  inputElement.value = origin;
  inputElement.setAttribute('data-fontclass', fontclass);
  var event = new Event('change');
  inputElement.dispatchEvent(event);
  parent.classList.remove('isOpen');
}

// eslint-disable-next-line no-unused-vars
function openAdminFontSelect(element) {
  element.closest('.adminFontSelection').classList.add('isOpen');
}

// eslint-disable-next-line no-unused-vars
function closeAdminFontSelect() {
  var selections = document.querySelectorAll('.adminFontSelection');
  selections.forEach(function (selection) {
    selection.classList.remove('isOpen');
  });
}