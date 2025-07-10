const toggle = document.getElementById("toggle");
const timer = document.getElementById("timer");
const siteInput = document.getElementById("site-input");
const addSiteBtn = document.getElementById("add-site");
const siteList = document.getElementById("site-list");
const statusText = document.getElementById("statusText");
const darkModeToggle = document.getElementById("darkModeToggle");

let settings = {};

function renderSites() {
  siteList.innerHTML = "";
  settings.sites.forEach((site, index) => {
    const li = document.createElement("li");

    const input = document.createElement("input");
    input.value = site;
    input.disabled = true;

    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = () => {
      if (input.disabled) {
        input.disabled = false;
        input.focus();
        editBtn.textContent = "💾";
      } else {
        settings.sites[index] = input.value.trim();
        input.disabled = true;
        editBtn.textContent = "✏️";
        saveSettings();
      }
    };

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "🗑️";
    removeBtn.className = "remove";
    removeBtn.onclick = () => {
      settings.sites.splice(index, 1);
      saveSettings();
      renderSites();
    };

    actions.append(editBtn, removeBtn);
    li.append(input, actions);
    siteList.appendChild(li);
  });
}

function saveSettings() {
  chrome.runtime.sendMessage({ type: "updateSettings", payload: settings });
}

chrome.runtime.sendMessage({ type: "getSettings" }, (res) => {
  settings = res;
  toggle.checked = settings.enabled;
  timer.value = settings.timerMinutes;
  statusText.textContent = settings.enabled ? "Enabled ✅" : "Disabled ❌";
  renderSites();
});

toggle.addEventListener("change", () => {
  settings.enabled = toggle.checked;
  statusText.textContent = toggle.checked ? "Enabled ✅" : "Disabled ❌";
  saveSettings();
});

timer.addEventListener("change", () => {
  const value = parseInt(timer.value);
  if (value >= 1 && value <= 60) {
    settings.timerMinutes = value;
    saveSettings();
  }
});

addSiteBtn.addEventListener("click", () => {
  const site = siteInput.value.trim();
  if (site && !settings.sites.includes(site)) {
    settings.sites.push(site);
    saveSettings();
    renderSites();
    siteInput.value = "";
  }
});

// Dark Mode
const applyTheme = () => {
  const isDark = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark", isDark);
  darkModeToggle.checked = isDark;
};

darkModeToggle.addEventListener("change", () => {
  const isDark = darkModeToggle.checked;
  localStorage.setItem("darkMode", isDark);
  applyTheme();
});

applyTheme();
