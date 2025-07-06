chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ blockShorts: true, hideShorts: true });
  updateBlocking(true);
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockShorts) {
    updateBlocking(changes.blockShorts.newValue);
  }
});

const SHORTS_RULE_ID = 1;

function updateBlocking(enabled) {
  if (enabled) {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [SHORTS_RULE_ID],
      addRules: [{
        "id": SHORTS_RULE_ID,
        "priority": 1,
        "action": {
          "type": "redirect",
          "redirect": { "url": "https://www.touchgrasss.com/" }
        },
        "condition": {
          "urlFilter": "youtube.com/shorts/",
          "resourceTypes": ["main_frame"]
        }
      }]
    });
  } else {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [SHORTS_RULE_ID]
    });
  }
}

// Show badge icon on YouTube
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("youtube.com")) {
    chrome.action.setBadgeText({ tabId, text: "" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#6BD46C" });
  } else {
    chrome.action.setBadgeText({ tabId, text: "" });
  }
});