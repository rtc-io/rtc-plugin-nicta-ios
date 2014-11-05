/* jshint node: true */
'use strict';

var extend = require('cog/extend');
var enabled = parseInt(localStorage.simulatorEnabled, 10) === 1;
var actions = {
  toggle: toggleSimulator
};
var s = document.createElement('script');

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
  s.src = chrome.extension.getURL('simulator.js');
  s.onload = function() {
    this.parentNode.removeChild(this);
  };

  (document.head||document.documentElement).appendChild(s);
}

window.addEventListener('message', handleMessage);
