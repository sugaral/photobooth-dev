"use strict";

/* globals photoboothTools */
/* exported adminsettings */
var admincount = 0;
function countreset() {
  admincount = 0;
}

// eslint-disable-next-line no-unused-vars
function adminsettings() {
  var rootPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  if (admincount == 5) {
    window.location.href = rootPath + 'login';
  }
  photoboothTools.console.log(admincount);
  admincount++;
  setTimeout(countreset, 5000);
}