// override console log
var oldLogger = window.console.log;
console.log = function() {
  if (typeof NativeLog == 'function') {
    NativeLog.apply(null, arguments);
  }

  oldLogger.apply(console, arguments);
};

// enable logging
require('cog/logger').enable('*');

var media = require('rtc-media');
var localMedia = media({
  plugins: [
    require('../')
  ]
});

console.log('navigator.getUserMedia = ', typeof navigator.getUserMedia);
console.log('getUserMedia = ', typeof getUserMedia);

localMedia.render(document.body);
