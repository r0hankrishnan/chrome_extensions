let settings = {
  enabled: true,
  timerMinutes: 10,
  sites: ["reddit.com", "youtube.com"]
};

const activeTimers = new Map(); // tabId -> interval

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set(settings);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "getSettings") {
    chrome.storage.local.get(["enabled", "timerMinutes", "sites"], sendResponse);
    return true;
  }

  if (msg.type === "updateSettings") {
    chrome.storage.local.set(msg.payload);
    return;
  }

  if (msg.type === "newTab") {
    chrome.storage.local.get(["enabled", "timerMinutes", "sites"], (data) => {
      if (!data.enabled) return;

      const url = new URL(sender.tab.url);
      const isMatch = data.sites.some(site => url.hostname.includes(site));
      if (!isMatch) return;

      const tabId = sender.tab.id;
      const closeTime = Date.now() + data.timerMinutes * 60000;

      // If already tracking this tab, don't set another interval
      if (activeTimers.has(tabId)) return;

      const interval = setInterval(() => {
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError || !tab) {
            clearInterval(interval);
            activeTimers.delete(tabId);
            return;
          }

          const timeLeft = closeTime - Date.now();

          if (timeLeft <= 0) {
            chrome.tabs.remove(tabId, () => {
              if (chrome.runtime.lastError) {
                console.warn("Failed to close tab:", chrome.runtime.lastError.message);
              }
              clearInterval(interval);
              activeTimers.delete(tabId);
            });
            return;
          }

          chrome.scripting.executeScript({
            target: { tabId },
            func: updateTimerUI,
            args: [timeLeft]
          }, () => {
            if (chrome.runtime.lastError) {
              console.warn("executeScript failed:", chrome.runtime.lastError.message);
              clearInterval(interval);
              activeTimers.delete(tabId);
            }
          });
        });
      }, 1000);

      activeTimers.set(tabId, interval);
    });
  }
});

function updateTimerUI(timeLeft) {
  const id = "temp-tab-timer";
  let div = document.getElementById(id);
  if (!div) {
    div = document.createElement("div");
    div.id = id;
    Object.assign(div.style, {
      position: "fixed",
      top: "10px",
      right: "10px",
      background: "#111",
      color: "white",
      padding: "5px 12px",
      borderRadius: "6px",
      fontSize: "14px",
      fontFamily: "monospace",
      zIndex: 999999,
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
    });
    document.body.appendChild(div);
  }
  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  div.textContent = `⏳ ${mins}:${secs.toString().padStart(2, "0")}`;
}
