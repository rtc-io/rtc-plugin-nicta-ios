var media = require('rtc-media');
var localMedia = media({
  plugins: [
    require('../')
  ]
});

localMedia.render(document.body);
