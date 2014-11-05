/* jshint node: true */
'use strict';

var enabled = parseInt(localStorage.simulatorEnabled, 10) === 1;
var s = document.createElement('script');

chrome.runtime.onMessage.addListener(function(data, sender) {
  if (sender.tab) {
    return;
  }

  if (data.setting) {
    localStorage[data.setting] = data.value;
  }
});

// make a request to the runtime
chrome.runtime.sendMessage({ action: 'checkState' });

if (enabled) {
  s.src = chrome.extension.getURL('simulator.js');
  s.onload = function() {
    this.parentNode.removeChild(this);
  };

  (document.head||document.documentElement).appendChild(s);
}
