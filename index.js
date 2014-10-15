/* jshint node: true */
'use strict';

var ProxyMediaStream = require('rtc-proxy/mediastream');
var ProxyPeerConnection = require('rtc-proxy/peerconnection');
var reNICTAUserAgent = /\(iOS\;.*Mobile\/NICTA/;
var deviceReady = false;
var initialized = false;

/**
  # rtc-plugin-nicta-ios

  This is an experimental plugin for bridging the functionality provided
  an in-progress NICTA iOS webkit plugin.  While this plugin integration
  layer is provided opensource the iOS plugin is a commercial project
  currently under development.

  ## Getting More Information

  If you are after more information regarding the plugin feel free to
  reach out to either of the following people, and we will do our best
  to answer your questions:

  - Damon Oehlman <damon.oehlman@nicta.com.au>
  - Silvia Pfeiffer <silvia.pfeiffer@nicta.com.au>

**/

/**
  ### supported(platform) => Boolean

  The supported function returns true if the platform (as detected using
  `rtc-core/detect`) is compatible with the plugin. By doing this prelimenary
  detection you can specify a number of plugins to be loaded but only
  the first the is supported on the current platform will be used.

**/
exports.supported = function(platform) {
  return typeof navigator != 'undefined' && reNICTAUserAgent.test(navigator.userAgent);
};

/**
  ### init(callback)

  The `init` function is reponsible for ensuring that the current HTML
  document is prepared correctly.

**/
var init = exports.init = function(opts, callback) {
  function ready(evt) {
    var oldLogger;

    if (initialized) {
      return callback();
    }

    document.removeEventListener('deviceready', ready);

    // override the console.log implementation to report back to the iOS console
    oldLogger = window.console.log;
    console.log = function(msg) {
      var nativeMessage = [].slice.call(arguments).join(' ');

      try {
        NativeLog(nativeMessage);
      }
      catch (e) {
        alert(nativeMessage);
      }

      oldLogger.apply(console, arguments);
    };

    if (typeof getUserMedia == 'function') {
      navigator.getUserMedia = function(constraints, successCb, failureCb) {
        getUserMedia(constraints, function(stream) {
          successCb(new ProxyMediaStream(stream));
        }, failureCb);
      };
    }

    initialized = true;
    console.log('iOS plugin initialized, getUserMedia available = ' + (!!navigator.getUserMedia));

    callback();
  }

  // if the device is ready, then initialise immediately
  if (deviceReady) {
    // initialise after a 10ms timeout
    return setTimeout(ready, 10);
  }

  // wait for the device ready call
  document.addEventListener('deviceready', ready);
};

exports.attach = function(stream, opts) {
  var canvas = prepareElement(opts, (opts || {}).el);
  var context = canvas.getContext('2d');
  var lastWidth = 0;
  var lastHeight = 0;

  // if we are a proxyied stream, get the original stream
  if (stream && stream.__orig) {
    stream = stream.__orig;
  }

  iOSRTC_onDrawRegi(stream, function(imgData, width, height) {
    var resized = false;

    console.log('rendering stream frame');

    try {
      var img = new Image();
      resized = width !== lastWidth || height !== lastHeight;

      img.onload = function() {
        if (resized) {
          context.canvas.width = width;
          context.canvas.height = height;
        }
        context.drawImage(img, 0, 0, width, height);
      };
      img.src = imgData;
    }
    catch (e) {
      console.log('encountered error while drawing video');
      console.log('error: ' + e.message);
    }

    // update the last width and height
    lastWidth = width;
    lastHeight = height;
  });

  return canvas;
};

/**
  ### attachStream(stream, bindings)

**/
exports.attachStream = function(stream, bindings) {
  var contexts = [];
  var lastWidth = 0;
  var lastHeight = 0;

  // get the contexts for each of the bindings
  contexts = bindings.map(function(binding) {
    return binding.el.getContext('2d');
  });

  // if we are a proxyied stream, get the original stream
  if (stream && stream.__orig) {
    stream = stream.__orig;
  }

  iOSRTC_onDrawRegi(stream, function(imgData, width, height) {
    var resized = false;
    try {
      var img = new Image();
      resized = width !== lastWidth || height !== lastHeight;

      img.onload = function() {
        contexts.forEach(function(context) {
          if (resized) {
            context.canvas.width = width;
            context.canvas.height = height;
          }
          context.drawImage(img, 0, 0, width, height);
        });
      };
      img.src = imgData;
    }
    catch (e) {
      console.log('encountered error while drawing video');
      console.log('error: ' + e.message);
    }

    // update the last width and height
    lastWidth = width;
    lastHeight = height;
  });
};

/**
  ### prepareElement(opts, element) => HTMLElement

  The `prepareElement` function is used to prepare the video container
  for receiving a video stream.  If the plugin is able to work with
  standard `<video>` and `<audio>` elements then a plugin should simply
  not implement this function.

**/
var prepareElement = exports.prepareElement = function(opts, element) {
  var shouldReplace = (element instanceof HTMLVideoElement) ||
      (element instanceof HTMLAudioElement);

  // create our canvas
  var canvas = document.createElement('canvas');
  var srcStyle;
  var bounds;

  // if we should replace the element, then find the parent
  var container = shouldReplace ? element.parentNode : element;
  console.log('preparing element, created canvas');

  // if we should replace the target element, then do that now
  if (shouldReplace) {
    console.log('getting computed style for the element');
    srcStyle = window.getComputedStyle(element);

    console.log('getting client bounding rect');
    bounds = element.getBoundingClientRect();

    console.log('setting w and h');
    canvas.width = bounds.width;
    canvas.height = bounds.height;

    // add the classes from the source element to the canvas
    canvas.className = element.className;

//     Object.keys(srcStyle).forEach(function(key) {
//       canvas.style[key] = srcStyle[key];
//     });

    console.log('inserting canvas');
    container.insertBefore(canvas, element);
    container.removeChild(element);
  }
  else {
    container.appendChild(canvas);
  }

  return canvas;
};

/* peer connection plugin interfaces */

exports.createIceCandidate = function(opts) {
  console.log('creating ice candidate, keys: ' + Object.keys(opts).join(' '));

  return getRTCIceCandidate({
    sdpMLineIndex: (opts || {}).sdpMLineIndex,
    candidate: (opts || {}).candidate
  });
};

exports.createConnection = function(config, constraints) {
  config.iceServers = (config.iceServers || []).map(function(details) {
    var url = (details || {}).url;
    console.log('specifying ice url: ' + url);

    return { url: url };
  });

  return new ProxyPeerConnection(getPeerConnection(config, constraints));
};

exports.createSessionDescription = function(opts) {
  return getRTCSessionDescription(opts);
};

// listen for deviceready in case it happens before the plugin is called
if (typeof document != 'undefined') {
  document.addEventListener('deviceready', function() {
    deviceReady = true;
  });
}
