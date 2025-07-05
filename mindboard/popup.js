document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("toggle-canvas");

  chrome.storage.sync.get(["useCanvas"], ({ useCanvas }) => {
    checkbox.checked = !!useCanvas;
  });

  checkbox.addEventListener("change", () => {
    chrome.storage.sync.set({ useCanvas: checkbox.checked });
    // Removed window.close();
  });
});
