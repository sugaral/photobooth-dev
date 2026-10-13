"use strict";

// eslint-disable-next-line no-unused-vars
function adminVideoSelect(element, path) {
  var parent = element.closest('.adminVideoSelection');
  var origin = element.dataset.origin;
  var src = element.src;
  var previewElement = parent.querySelector('.adminVideoSelection-preview');
  var textElement = parent.querySelector('.adminVideoSelection-text');
  var inputElement = parent.querySelector('input[name="' + path + '"]');
  previewElement.src = src;
  textElement.textContent = origin;
  inputElement.value = origin;
  var event = new Event('change');
  inputElement.dispatchEvent(event);
  parent.classList.remove('isOpen');
}

// eslint-disable-next-line no-unused-vars
function openAdminVideoSelect(element) {
  element.closest('.adminVideoSelection').classList.add('isOpen');
}

// eslint-disable-next-line no-unused-vars
function closeAdminVideoSelect() {
  var selections = document.querySelectorAll('.adminVideoSelection');
  selections.forEach(function (selection) {
    selection.classList.remove('isOpen');
  });
}