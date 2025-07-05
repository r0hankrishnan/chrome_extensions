function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function removeShortsUI() {
  document.querySelectorAll('a[href*="/shorts/"]').forEach(el => el.remove());
  document.querySelectorAll('ytd-rich-section-renderer').forEach(section => {
    const text = section.innerText || "";
    if (text.toLowerCase().includes("shorts")) {
      section.remove();
    }
  });
  document.querySelectorAll('ytd-reel-shelf-renderer').forEach(el => el.remove());
}

// function redirectIfOnShorts() {
//   if (location.pathname.startsWith("/shorts/")) {
//     chrome.storage.local.get(["blockShorts"], (res) => {
//       if (res.blockShorts) {
//         window.location.href = "https://www.touchgrasss.com/";
//       }
//     });
//   }
// }

function redirectIfOnShorts() {
  if (location.pathname.startsWith("/shorts/")) {
    chrome.storage.local.get(["blockShorts", "customRedirect"], (res) => {
      if (res.blockShorts) {
        const redirectURL = res.customRedirect && res.customRedirect.trim()
          ? res.customRedirect
          : chrome.runtime.getURL("redirect.html");
        window.location.href = redirectURL;
      }
    });
  }
}

let lastUrl = location.href;
const checkUrlChange = () => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    chrome.storage.local.get(["hideShorts"], (res) => {
      if (res.hideShorts) removeShortsUI();
    });
    redirectIfOnShorts();
  }
};

async function waitForYouTubeLoadAndStart() {
  while (!document.querySelector('ytd-app')) {
    await sleep(100);
  }

  chrome.storage.local.get(["hideShorts"], (res) => {
    if (res.hideShorts) removeShortsUI();
  });
  redirectIfOnShorts();

  const domObserver = new MutationObserver(() => {
    chrome.storage.local.get(["hideShorts"], (res) => {
      if (res.hideShorts) removeShortsUI();
    });
  });
  domObserver.observe(document, { childList: true, subtree: true });

  setInterval(checkUrlChange, 500);
}

waitForYouTubeLoadAndStart();