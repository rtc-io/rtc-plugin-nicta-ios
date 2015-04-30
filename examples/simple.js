// create the video target
var crel = require('crel');
var video = crel('video');

// specify a plugin
require('rtc-media')({
  target: video,
  maxfps: 10,
  plugins: [
    require('..')
  ]
});

// add the target to the document
// NOTE: original video element may be removed and replaced with
// an element suited to plugin rendering requirements (e.g. canvas)
document.body.appendChild(video);
