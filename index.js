/* jshint node: true */
'use strict';

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
  console.log(navigator.userAgent);
  console.log(platform.browser.toLowerCase());
  return ['chrome'].indexOf(platform.browser.toLowerCase()) < 0;
};

/**
  ### init(callback)

  The `init` function is reponsible for ensuring that the current HTML
  document is prepared correctly.

**/
var init = exports.init = function(callback) {
  // override console log
  var oldLogger = window.console.log;

  // initialise after a 10ms timeout
  setTimeout(function() {
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
      navigator.getUserMedia = getUserMedia;
    }

    console.log('navigator.getUserMedia = ', typeof navigator.getUserMedia);
    console.log('getUserMedia = ', typeof getUserMedia);

    callback();
  }, 10);
};

/**
  ### attachStream(stream, bindings)

**/
exports.attachStream = function(stream, bindings) {
  var contexts = [];
  var buffers = [];
  var lastWidth = 0;
  var lastHeight = 0;

  document.addEventListener('videoFrame:' + stream.id, function(evt) {
    var detail = evt.detail;

    console.log('captured videoFrame event');
    drawFrame(detail.imageData, detail.width, detail.height);
  });

  function drawFrame(imageData, width, height) {
    var img;
    var resized = false;

    console.log('captured video frame: w = ' + width + ', h = ' + height);

    try {
      img = new Image();
      resized = width !== lastWidth || height !== lastHeight;

      img.src = imageData;
      img.onload = function() {
        console.log('image loaded, drawing to attached contexts');

        contexts.forEach(function(context) {
          if (resized) {
            context.canvas.width = width;
            context.canvas.height = height;
          }

          context.drawImage(img, 0, 0, width, height);
        });
      };
    }
    catch (e) {
      console.log('encountered error while drawing video');
      console.log('error: ' + e.message);
    }

    // update the last width and height
    lastWidth = width;
    lastHeight = height;
  }

  // get the contexts for each of the bindings
  contexts = bindings.map(function(binding) {
    return binding.el.getContext('2d');
  });

  console.log('attaching stream ' + stream.id + ' to ' + bindings.length + ' bindings');

  stream.ondrawvideo = function(imgData, width, height, streamId) {
    console.log('captured draw request for streamid: ' + streamId);
    try {
      var evt = new CustomEvent('videoFrame:' + streamId, {
        detail: {
          imageData: imgData,
          width: width,
          height: height,
          streamId: streamId
        }
      });

      document.dispatchEvent(evt);
    }
    catch (e) {
      console.log('error creating custom event: ' + e.message);
    }
  };

  console.log('ondrawvideo handler = ', typeof stream.ondrawvideo);
};

/**
  ### prepareElement(opts, element) => HTMLElement

  The `prepareElement` function is used to prepare the video container
  for receiving a video stream.  If the plugin is able to work with
  standard `<video>` and `<audio>` elements then a plugin should simply
  not implement this function.

**/
exports.prepareElement = function(opts, element) {
  var shouldReplace = (element instanceof HTMLVideoElement) ||
      (element instanceof HTMLAudioElement);

  // create our canvas
  var canvas = document.createElement('canvas');

  // if we should replace the element, then find the parent
  var container = shouldReplace ? element.parentNode : element;
  console.log('preparing element, created canvas');

  // if we should replace the target element, then do that now
  if (shouldReplace) {
    container.insertBefore(element, canvas);
    container.removeChild(element);
  }
  else {
    container.appendChild(canvas);
  }

  return canvas;
};

/* peer connection plugin interfaces */

exports.createIceCandidate = function(opts) {
  return getRTCIceCandidate(opts);
};

exports.createPeerConnection = function(config, constraints) {
  return getPeerConnection(config, constraints);
};

exports.createSessionDescription = function(opts) {
  return getRTCSessionDescription(opts);
};
