document.addEventListener("DOMContentLoaded", () => {
  const hideToggle = document.getElementById("hideToggle");
  const blockToggle = document.getElementById("blockToggle");
  const status = document.getElementById("statusMessage");
  const themeToggle = document.getElementById("themeToggle");
  const saveRedirectBtn = document.getElementById("saveRedirectBtn");
  const clearRedirectBtn = document.getElementById("clearRedirectBtn");
  const body = document.body;

  // Get saved values
  chrome.storage.local.get(["hideShorts", "blockShorts", "theme"], (res) => {
    hideToggle.checked = res.hideShorts ?? true;
    blockToggle.checked = res.blockShorts ?? true;
    updateStatus(hideToggle.checked, blockToggle.checked);

    if (res.theme === "dark") {
      body.classList.add("dark");
    }
  });

  hideToggle.addEventListener("change", () => {
    chrome.storage.local.set({ hideShorts: hideToggle.checked });
    chrome.storage.local.get(["blockShorts"], (res) => {
      updateStatus(hideToggle.checked, res.blockShorts);
    });
  });

  blockToggle.addEventListener("change", () => {
    chrome.storage.local.set({ blockShorts: blockToggle.checked });
    chrome.storage.local.get(["hideShorts"], (res) => {
      updateStatus(res.hideShorts, blockToggle.checked);
    });
  });
  
  // saveRedirectBtn.addEventListener("click", () => {
  //   const url = redirectInput.value.trim();

  //   if (url && !/^https?:\/\//.test(url)) {
  //     status.textContent = "Please enter a valid URL starting with http(s)://";
  //     return;
  //   }

  //   chrome.storage.local.set({ customRedirect: url });
  //   status.textContent = url
  //     ? "Custom redirect saved!"
  //     : "Redirect set to default.";
  // });
  
  clearRedirectBtn.addEventListener("click", () => {
    chrome.storage.local.remove("customRedirect", () => {
      redirectInput.value = "";
      status.textContent = "Redirect cleared. Using default block screen.";
    });
  });
  
  saveRedirectBtn.addEventListener("click", () => {
    let url = redirectInput.value.trim();
    
    // If URL is non-empty and doesn't start with http or https, add https://
    if (url && !/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    
    try {
      new URL(url);
    } catch (e) {
      status.textContent = "Invalid URL. Please try again.";
      return;
    }

    chrome.storage.local.set({ customRedirect: url });
    status.textContent = url
    ? "Custom redirect saved!"
    : "Redirect set to default.";
  });


  function updateStatus(hide, block) {
    if (hide && block) {
      status.textContent = "Shorts blocked and hidden. Go touch grass!";
    } else if (block) {
      status.textContent = "Blocking Shorts URLs only.";
    } else if (hide) {
      status.textContent = "Hiding Shorts UI only.";
    } else {
      status.textContent = "Shorts are not being blocked.";
    }
  }

  themeToggle.addEventListener("click", () => {
    const isDark = body.classList.toggle("dark");
    chrome.storage.local.set({ theme: isDark ? "dark" : "light" });
  });
});