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
  return true;
//   return ['safari'].indexOf(platform.browser.toLowerCase()) >= 0;
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

  function drawVideo(imageData, width, height) {
    var img = new Image();

    img.src = imageData;
    img.onload = function() {
      contexts.forEach(function(context) {
        context.drawImage(img, 0, 0, width, height);
      });
    };
  }

  // get the contexts for each of the bindings
  contexts = bindings.map(function(binding) {
    return binding.el.getContext('2d');
  });

  stream.ondrawvideo = drawVideo;
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
