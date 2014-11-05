var crel = require('crel');
var cuid = require('cuid');
var raf = require('fdom/raf');
var attach = require('attachmediastream');
var canplay = require('canplay');
var getUserMedia = require('rtc-core/detect').call(navigator, 'getUserMedia');
var FakeStream = require('./fakestream');
var streams = {};

function drawFrames(stream, callback) {
  var canvas = crel('canvas');
  var ctx = canvas.getContext('2d');
  var image;
  var data;
  var video = attach(stream._real || stream);

  function drawFrame() {
    ctx.drawImage(video, 0, 0);
    callback(canvas.toDataURL('image/png'), canvas.width, canvas.height);

    raf(drawFrame);
  }

  canplay(video, function(err) {
    if (err) {
      return console.error('cannot play video stream');
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    raf(drawFrame);
  });
}

function getPeerConnection(config, constraints) {
  var pc = new webkitRTCPeerConnection(config, constraints);
  var addStream = pc.addStream;

  pc.addStream = function(stream) {
    addStream.call(pc, stream._real);
  };

  return pc;
}

Object.defineProperty(navigator, 'userAgent', {
  get: function() {
    return 'foobar browser (iOS; mocked Mobile/NICTA)';
  }
});

// attach getuser media helpers
window.getUserMedia = function(constraints, successCallback, failureCallback) {
  getUserMedia.call(navigator, constraints, function(stream) {
    // create a new uuid for the stream
    successCallback(new FakeStream(stream));
  }, failureCallback);
};
window.NativeLog = function() {};
window.iOSRTC_onDrawRegi = drawFrames;
window.getPeerConnection = getPeerConnection;

window.getRTCSessionDescription = function(opts) {
  return new RTCSessionDescription(opts);
};

window.getRTCIceCandidate = function(data) {
  return new RTCIceCandidate(data);
};

setTimeout(function() {
  document.dispatchEvent(new Event('deviceready'));
}, 500);
