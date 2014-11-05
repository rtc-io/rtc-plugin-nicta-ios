var actions = {
  checkState: checkState
};

function checkState(tab) {
  var key = 'simulator:' + tab.id;
  var enabled = parseInt(localStorage[key], 10) === 1;

  console.log('enabled: ', enabled, key);
  chrome.browserAction.setTitle({
    title: (enabled ? 'Disable' : 'Activate') + ' the build.rtc.io iOS simulator - foobar',
    tabId: tab.id
  });
}

function handleRequest(request, sender, sendResponse) {
  var action = actions[(request || {}).action];

  if (typeof action == 'function') {
    action(sender.tab, sendResponse);
  }
}

chrome.browserAction.onClicked.addListener(function(tab) {
  var key = 'simulator:' + tab.id;

  // toggle and then get the enabled state
  localStorage[key] = parseInt(localStorage[key], 10) ^ 1;
  chrome.tabs.sendMessage(tab.id, { setting: 'simulatorEnabled', value: localStorage[key] });

  setTimeout(function() {
    chrome.tabs.executeScript(tab.id, { code: 'window.location.reload();' });
  }, 500);
});

chrome.runtime.onMessage.addListener(handleRequest);
