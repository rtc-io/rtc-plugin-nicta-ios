/* jshint node: true */
'use strict';

var crel = require('crel');
var raf = require('fdom/raf');
var noise = require('perlin').noise;
var extend = require('cog/extend');
var enabled = parseInt(localStorage.simulatorEnabled, 10) === 1;
var actions = {
  toggle: toggleSimulator
};
var overrideUserAgent =  '(' + function() {
  Object.defineProperty(navigator, 'userAgent', {
    get: function() {
      return 'foobar browser (iOS; mocked Mobile/NICTA)';
    }
  });
} + ')();';

function drawFrames(stream, callback) {
  var fn = 'simplex';
  var height = 0;
  var canvas = crel('canvas');
  var ctx = canvas.getContext('2d');
  var image;
  var data;

  canvas.width = 200;
  canvas.height = 80;
  image = ctx.createImageData(canvas.width, canvas.height);
  data = image.data;

  function drawFrame() {
    // Cache width and height values for the canvas.
    var cWidth = canvas.width;
    var cHeight = canvas.height;
    var max = -Infinity, min = Infinity;
    var noisefn = fn === 'simplex' ? noise.simplex3 : noise.perlin3;

    for (var x = 0; x < cWidth; x++) {
      for (var y = 0; y < cHeight; y++) {
        var value = noisefn(x / 50, y / 50, height);

        if (max < value) max = value;
        if (min > value) min = value;

        value = (1 + value) * 1.1 * 128;

        var cell = (x + y * cWidth) * 4;
        data[cell] = data[cell + 1] = data[cell + 2] = value;
        //data[cell] += Math.max(0, (25 - value) * 8);
        data[cell + 3] = 255; // alpha.
      }
    }

    ctx.fillColor = 'black';
    ctx.fillRect(0, 0, 100, 100);
    ctx.putImageData(image, 0, 0);

    height += 0.05;

    callback(canvas.toDataURL('image/png'), cWidth, cHeight);
    raf(drawFrame);
  }

  raf(drawFrame);
}


function toggleSimulator() {
  localStorage.simulatorEnabled = parseInt(localStorage.simulatorEnabled, 10) ^ 1;
}

function handleMessage(evt) {
  if (evt.data && evt.data.src === 'page') {
    // make a request to the runtime
    chrome.runtime.sendMessage(evt.data, function(response) {
      window.postMessage(extend(response, { src: 'extension' }, '*'));
    });
  }
}

chrome.runtime.onMessage.addListener(function(data, sender) {
  var action = actions[(data || {}).action];

  if (sender.tab) {
    return;
  }

  if (typeof action == 'function') {
    return action(data, sender);
  }
});

if (enabled) {
  // override the useragent
  document.documentElement.setAttribute('onreset', overrideUserAgent);
  document.documentElement.dispatchEvent(new CustomEvent('reset'));
  document.documentElement.removeAttribute('onreset');

  // attach getuser media helpers
  window.getUserMedia = require('rtc-core/detect')('getUserMedia');
  window.NativeLog = function() {};
  window.iOSRTC_onDrawRegi = drawFrames;

  setTimeout(function() {
    document.dispatchEvent(new Event('deviceready'));
  }, 500);
}

window.addEventListener('message', handleMessage);
