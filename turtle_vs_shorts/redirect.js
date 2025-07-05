
chrome.storage.local.get(['theme'], (res) => {
  if (res.theme === 'dark') {
    document.body.classList.add('dark');
  }
});
