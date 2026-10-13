"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* eslint n/no-unsupported-features/node-builtins: "off" */
/* globals photoboothTools shellCommand csrf */
$(function () {
  // Highlight save button on form changes
  var $saveButton = $('#save-admin-btn');
  var initialSerialized = $('form').serialize();
  $(document).on('change input', 'form :input', function () {
    var currentSerialized = $('form').serialize();
    if (currentSerialized !== initialSerialized) {
      $saveButton.addClass('isDirty');
    } else {
      $saveButton.removeClass('isDirty');
    }
  });
  $('#reset-btn').on('click', function (e) {
    e.preventDefault();
    var msg = photoboothTools.getTranslation('really_delete');
    var really = confirm(msg);
    var elem = $(this);
    elem.addClass('saving');
    if (really) {
      // show loader
      $('.pageLoader').addClass('isActive');
      $('.pageLoader').find('label').html(photoboothTools.getTranslation('saving'));
      var data = new FormData(document.querySelector('form'));
      data.append('type', 'reset');
      if (typeof csrf !== 'undefined') {
        data.append(csrf.key, csrf.token);
      }
      fetch('../api/admin.php', {
        method: 'POST',
        body: data
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        if (data.status === 'success') {
          window.location.reload();
        } else {
          photoboothTools.console.logDev(data.message);
          window.location.reload();
        }
      })["catch"](function (error) {
        photoboothTools.console.logDev('Error:', error);
      });
    } else {
      elem.removeClass('saving');
    }
  });
  $('#save-admin-btn').on('click', function (e) {
    e.preventDefault();

    // show loader
    $('.pageLoader').addClass('isActive');
    $('.pageLoader').find('label').html(photoboothTools.getTranslation('saving'));
    var data = new FormData(document.querySelector('form'));
    data.append('type', 'config');
    if (typeof csrf !== 'undefined') {
      data.append(csrf.key, csrf.token);
    }
    fetch('../api/admin.php', {
      method: 'POST',
      body: data
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      if (data.status === 'success') {
        window.location.reload();
      } else {
        photoboothTools.console.logDev(data.message);
        window.location.reload();
      }
    })["catch"](function (error) {
      photoboothTools.console.logDev('Error:', error);
    });
  });
  $('#screensaver-preview-btn').on('click', function (e) {
    e.preventDefault();
    window.open('../?screensaverPreview=1', '_blank');
    return false;
  });
  $('#layout-generator').on('click', function (ev) {
    ev.preventDefault();
    window.open('../admin/generator');
    return false;
  });
  $('#test-connection').on('click', function (e) {
    e.preventDefault();
    var elem = $(this);

    // show loader
    $('.pageLoader').addClass('isActive');
    $('.pageLoader').find('label').html(photoboothTools.getTranslation('checking'));
    $.ajax({
      url: '../api/testFtpConnection.php',
      dataType: 'json',
      data: function () {
        var formData = $('form').serializeArray();
        if (typeof csrf !== 'undefined') {
          formData.push({
            name: csrf.key,
            value: csrf.token
          });
        }
        return formData;
      }(),
      type: 'post',
      success: function success(resp) {
        photoboothTools.console.log('resp', resp);
        resp.missing.forEach(function (el) {
          photoboothTools.console.log(el);
          $('#ftp\\:' + el).addClass('required');
        });
        alert(photoboothTools.getTranslation(resp.message));
      },
      error: function error(jqXHR) {
        photoboothTools.console.log('Error checking FTP connection: ', jqXHR.responseText);
      },
      complete: function complete(jqXHR, textStatus) {
        var status = jqXHR.status;
        var classes = 'isActive isSuccess';
        var findClasses = '.success span';
        if (status != 200 || jqXHR.responseJSON.response != 'success' || textStatus != 'success') {
          classes = 'isActive isError';
          findClasses = '.error span';
        }
        $('.pageLoader').removeClass('isActive');
        $('.adminToast').addClass(classes);
        var msg = elem.find(findClasses).html();
        $('.adminToast').find('.headline').html(msg);
        setTimeout(function () {
          $('.adminToast').removeClass('isActive');
        }, 2000);
      }
    });
  });
  $('#diskusage-btn').on('click', function (e) {
    e.preventDefault();
    location.assign('../admin/diskusage');
    return false;
  });
  $('#databaserebuild-btn').on('click', function (e) {
    e.preventDefault();
    var elem = $(this);

    // show loader
    $('.pageLoader').addClass('isActive');
    $('.pageLoader').find('label').html(photoboothTools.getTranslation('busy'));
    $.ajax({
      url: '../api/rebuildImageDB.php',
      data: _defineProperty({}, csrf.key, csrf.token),
      // eslint-disable-next-line no-unused-vars
      success: function success(resp) {
        $('.pageLoader').removeClass('isActive');
        $('.adminToast').addClass('isActive isSuccess');
        var msg = elem.find('.success span').html();
        $('.adminToast').find('.headline').html(msg);
        setTimeout(function () {
          $('.adminToast').removeClass('isActive');
        }, 3000);
      }
    });
  });
  $('#checkversion-btn').on('click', function (ev) {
    ev.preventDefault();
    var elem = $(this);

    // show loader
    $('.pageLoader').addClass('isActive');
    $('.pageLoader').find('label').html(photoboothTools.getTranslation('checking'));
    $.ajax({
      url: '../api/checkVersion.php',
      method: 'GET',
      data: _defineProperty({}, csrf.key, csrf.token),
      success: function success(data) {
        $('#checkVersion').empty();
        photoboothTools.console.log('data', data);
        if (!data.updateAvailable) {
          $('#current_version_text').text(photoboothTools.getTranslation('using_latest_version'));
        } else if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(data.availableVersion)) {
          $('#current_version_text').text(photoboothTools.getTranslation('current_version'));
          $('#current_version').text(data.currentVersion);
          $('#available_version_text').text(photoboothTools.getTranslation('available_version'));
          $('#available_version').text(data.availableVersion);
        } else {
          $('#current_version_text').text(photoboothTools.getTranslation('test_update_available'));
        }
        $('.pageLoader').removeClass('isActive');
        $('.adminToast').addClass('isActive isSuccess');
        var msg = elem.find('.success span').html();
        $('.adminToast').find('.headline').html(msg);
        setTimeout(function () {
          $('.adminToast').removeClass('isActive');
        }, 2000);
      },
      error: function error(jqXHR) {
        photoboothTools.console.log('Error checking Version: ', jqXHR.responseText);
        $('.pageLoader').removeClass('isActive');
        $('.adminToast').addClass('isActive isError');
        var msg = elem.find('.error span').html();
        $('.adminToast').find('.headline').html(msg);
        setTimeout(function () {
          $('.adminToast').removeClass('isActive');
        }, 2000);
      }
    });
  });
  $('#reset-print-lock-btn').on('click', function (e) {
    e.preventDefault();
    var elem = $(this);

    // show loader
    $('.pageLoader').addClass('isActive');
    $('.pageLoader').find('label').html(photoboothTools.getTranslation('busy'));
    $.ajax({
      method: 'GET',
      url: '../api/printDB.php',
      data: _defineProperty({
        action: 'unlockPrint'
      }, csrf.key, csrf.token),
      success: function success(data) {
        $('.pageLoader').removeClass('isActive');
        if (data.success) {
          $('.adminToast').addClass('isActive isSuccess');
          var msg = elem.find('.success span').html();
          $('.adminToast').find('.headline').html(msg);
        } else {
          $('.adminToast').addClass('isActive isError');
          var _msg = elem.find('.error span').html();
          $('.adminToast').find('.headline').html(_msg);
        }
        setTimeout(function () {
          $('.adminToast').removeClass('isActive');
        }, 2000);
      }
    });
  });
  $('#soundtest-btn').on('click', function (ev) {
    ev.preventDefault();
    var audioElement = document.getElementById('testaudio');
    if (audioElement === null) {
      audioElement = document.createElement('audio');
      audioElement.id = 'testaudio';
      document.body.append(audioElement);
    }
    var soundfile;
    if ($('[name="sound[voice]"]').val() === 'custom') {
      soundfile = '/private/sounds/' + $('[name="sound[voice]"]').val() + '/counter-' + Math.floor(Math.random() * 10 + 1) + '.mp3';
    } else {
      soundfile = '/resources/sounds/' + $('[name="sound[voice]"]').val() + '/' + $('[name="ui[language]"]').val() + '/counter-' + Math.floor(Math.random() * 10 + 1) + '.mp3';
    }
    audioElement.src = soundfile;
    audioElement.play()["catch"](function (error) {
      photoboothTools.console.log('Error with audio.play: ' + error);
    });
    return false;
  });
  $('#debugpanel-btn').on('click', function (ev) {
    ev.preventDefault();
    window.open('../admin/debug');
    return false;
  });
  $('#translate-btn').on('click', function (ev) {
    ev.preventDefault();
    window.open('https://crowdin.com/project/photobooth');
    return false;
  });
  $('#filesupload-btn').on('click', function (ev) {
    ev.preventDefault();
    window.open('../admin/upload');
    return false;
  });
  $('#reboot-btn').on('click', function (ev) {
    ev.preventDefault();
    shellCommand('reboot');
    return false;
  });
  $('#shutdown-btn').on('click', function (ev) {
    ev.preventDefault();
    shellCommand('shutdown');
    return false;
  });
});