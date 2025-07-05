
chrome.storage.sync.get(['useCanvas'], ({ useCanvas }) => {
  if (useCanvas) {
    window.location.href = chrome.runtime.getURL('newtab.html');
  } else {
    window.location.href = 'https://www.google.com';
  }
});
