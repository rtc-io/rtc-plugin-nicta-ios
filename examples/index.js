// override console log
var oldLogger = window.console.log;
console.log = function() {
  try {
    NativeLog.apply(null, arguments);
  }
  catch (e) {
    alert('cannot native log :(');
  }

  oldLogger.apply(console, arguments);
};

setTimeout(function() {
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
}, 500);
