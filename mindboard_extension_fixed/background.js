
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.pendingUrl && tab.pendingUrl === 'chrome://newtab/') {
    chrome.storage.sync.get(['useCanvas'], ({ useCanvas }) => {
      if (useCanvas) {
        chrome.tabs.update(tab.id, { url: chrome.runtime.getURL('newtab.html') });
      }
    });
  }
});
