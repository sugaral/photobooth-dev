"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* globals photoboothTools csrf */

function keypadAdd(value) {
  var keypadPin = $('#keypad_pin').html();
  var newPin = keypadPin + value;
  var pinLength = newPin.length;
  $('#keypad_pin').html(newPin);
  $('.keypad_keybox.active').addClass('checked');
  $('.keypad_keybox').find('.keypad_key.active').addClass('checked');
  $('.keypad_keybox.active').addClass('checked');
  $('.keypad_keybox').find('.keypad_key.active').addClass('checked');
  $('.keypad_keybox').removeClass('active');
  $('.keypad_keybox').find('.keypad_key').removeClass('active');
  $('.keypad_keybox').eq(pinLength).addClass('active');
  $('.keypad_keybox').eq(pinLength).find('.keypad_key').addClass('active');
  if (pinLength == 4) {
    checkKeypadPin(newPin);
  }
}
function keypadRemoveLastValue() {
  var newPin = $('#keypad_pin').html().slice(0, -1);
  var pinLength = newPin.length;
  $('#keypad_pin').html(newPin);
  $('.keypad_keybox').eq(pinLength + 1).removeClass('active').removeClass('checked');
  $('.keypad_keybox').eq(pinLength + 1).find('.keypad_key').removeClass('active').removeClass('checked');
  $('.keypad_keybox').eq(pinLength).addClass('active');
  $('.keypad_keybox').eq(pinLength).find('.keypad_key').addClass('active');
  $('.keypad_keybox').eq(pinLength).removeClass('checked');
  $('.keypad_keybox').eq(pinLength).find('.keypad_key').removeClass('checked');
}
function keypadClear() {
  $('#keypad_pin').html('');
  $('.keypad_keybox').removeClass('active');
  $('.keypad_keybox').find('.keypad_key').removeClass('active');
  $('.keypad_keybox').removeClass('checked');
  $('.keypad_keybox').find('.keypad_key').removeClass('checked');
  $('.keypad_keybox').eq(0).addClass('active');
  $('.keypad_keybox').eq(0).find('.keypad_key').addClass('active');
}
document.addEventListener('keydown', function (event) {
  var keypadPinElement = document.getElementById('keypad_pin');
  if (!keypadPinElement) {
    return;
  }
  var key = event.key || String.fromCharCode(event.which || event.keyCode);
  if (/^[0-9]$/.test(key)) {
    keypadAdd(parseInt(key, 10));
  } else if (key === 'Escape') {
    keypadClear();
  } else if (key === 'Backspace' || key === 'Delete') {
    keypadRemoveLastValue();
  }
});
function checkKeypadPin(pin) {
  $('.keypadLoader').removeClass('hidden');
  $('.keypadLoader').addClass('flex');
  $.ajax({
    url: environment.publicFolders.api + '/controller.php',
    dataType: 'json',
    type: 'POST',
    data: _defineProperty({
      controller: 'keypadLogin',
      pin: pin
    }, csrf.key, csrf.token),
    success: function success(data) {
      if (data.blocked) {
        var waitSeconds = data.retry_after || 0;
        $('.keypadLoader').addClass('hidden').removeClass('flex');
        var msg = data.message || photoboothTools.getTranslation('error');
        $('#keypad_message').text(msg + (waitSeconds ? ' (' + waitSeconds + 's)' : ''));
        $('.keypad_keybox').addClass('error');
        $('.keypad_key').addClass('error');
        // Keep message visible; user must wait out the window
        keypadClear();
        return;
      }
      if (data.state == true) {
        window.location.href = '../admin';
      } else {
        $('.keypad_keybox').addClass('error');
        $('.keypad_key').addClass('error');
        setTimeout(function () {
          $('.keypadLoader').addClass('hidden');
        }, 100);
        setTimeout(function () {
          $('.keypad_keybox').removeClass('error');
          $('.keypad_key').removeClass('error');
          keypadClear();
        }, 555);
      }
    },
    error: function error() {
      keypadClear();
      $('.keypadLoader').addClass('hidden');
      $('.keypadLoader').removeClass('flex');
    }
  });
}