/* jshint node: true */
'use strict';

function handleRequest(request, sender, sendResponse) {
  console.log(arguments);
}

chrome.runtime.onMessage.addListener(handleRequest);

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, { action: 'toggle' });

  setTimeout(function() {
    chrome.tabs.executeScript(tab.id, { code: 'window.location.reload();' });
  }, 100);
});
