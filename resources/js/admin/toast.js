"use strict";

// eslint-disable-next-line no-unused-vars
function openToast(msg) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'isSuccess';
  var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2000;
  $('.adminToast').addClass('isActive ' + type);
  $('.adminToast').find('.headline').html(msg);
  if (type == 'isError') {
    $('.adminToast-icon').removeClass('fa-check');
    $('.adminToast-icon').addClass('fa-times');
  } else if (type == 'isWarning') {
    $('.adminToast-icon').removeClass('fa-check');
    $('.adminToast-icon').addClass('fa-triangle-exclamation');
  }
  setTimeout(function () {
    $('.adminToast').removeClass('isActive');
  }, duration);
}