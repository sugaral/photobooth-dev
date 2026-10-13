"use strict";

// eslint-disable-next-line no-unused-vars
var virtualKeyboard = function () {
  var api = {};
  var layouts = {
    azerty: ['0123456789,←', 'azertyuiop', 'qsdfghjklm', 'wxcvbn@._-'],
    qwertz: ['0123456789,←', 'qwertzuiop', 'asdfghjkl', 'yxcvbnm@.,_-'],
    qwerty: ['0123456789,←', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm@._-']
  };
  var inputElement = null;
  var containerElement = null;
  var selectedLayout = layouts.qwerty;
  api.initialize = function (layoutType, inputSelector, containerSelector) {
    if (layouts[layoutType]) {
      selectedLayout = layouts[layoutType];
    } else {
      console.warn('Invalid layout type provided. Falling back to QWERTY.');
      selectedLayout = layouts.qwerty;
    }
    inputElement = document.querySelector(inputSelector);
    containerElement = document.querySelector(containerSelector);
    if (!inputElement || !containerElement) {
      console.error('Invalid input or container selector');
      return;
    }
    this.renderKeyboard();
  };
  api.renderKeyboard = function () {
    var keyboardContainer = document.createElement('div');
    keyboardContainer.id = 'virtual-keyboard';
    var createButton = function createButton(key) {
      var button = document.createElement('button');
      button.textContent = key;
      button.type = 'button';
      button.className = 'keyboard-button';
      if (key === '←') {
        button.classList.add('backspace');
        button.addEventListener('click', function () {
          inputElement.value = inputElement.value.slice(0, -1);
          animateButton(button);
        });
      } else {
        button.addEventListener('click', function () {
          inputElement.value += key;
          animateButton(button);
        });
      }
      return button;
    };
    var animateButton = function animateButton(button) {
      button.classList.add('active');
      setTimeout(function () {
        return button.classList.remove('active');
      }, 100);
    };
    selectedLayout.forEach(function (row) {
      var rowContainer = document.createElement('div');
      rowContainer.className = 'keyboard-row';
      row.split('').forEach(function (key) {
        var button = createButton(key);
        rowContainer.appendChild(button);
      });
      keyboardContainer.appendChild(rowContainer);
    });
    containerElement.appendChild(keyboardContainer);
  };
  return api;
}();