document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("themeToggle");
  const body = document.body;

  // Apply saved theme on load
  chrome.storage.sync.get("theme", ({ theme }) => {
    const currentTheme = theme || "light";
    body.classList.add(currentTheme);
    themeToggleBtn.innerHTML = currentTheme === "light" ? "🌙" : "☀️";
  });

  // Theme toggle handler
  themeToggleBtn.addEventListener("click", () => {
    const isDark = body.classList.contains("dark");
    body.classList.toggle("dark", !isDark);
    body.classList.toggle("light", isDark);

    const newTheme = isDark ? "light" : "dark";
    themeToggleBtn.innerHTML = newTheme === "light" ? "🌙" : "☀️";
    chrome.storage.sync.set({ theme: newTheme });
  });

  // Elements
  const saveBtn = document.getElementById("saveBtn");
  const sessionTitleInput = document.getElementById("sessionTitle");
  const sessionNoteInput = document.getElementById("sessionNote");
  const sessionsList = document.getElementById("sessions");

  // Load and render saved sessions
  function loadSessions() {
    chrome.storage.local.get({ sessions: [] }, (data) => {
      const sessions = data.sessions;
      sessionsList.innerHTML = "";
      if (sessions.length === 0) {
        sessionsList.innerHTML = "<li>No saved sessions</li>";
        return;
      }

      sessions.forEach((session, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${session.title}</strong>
          <small>${session.note || ""}</small>
          <small><em>${new Date(session.savedAt).toLocaleString()}</em></small>
          <div class="button-group">
            <button class="restoreBtn">Restore</button>
            <button class="deleteBtn">Delete</button>
          </div>
        `;
        sessionsList.appendChild(li);

        // Restore session tabs
        li.querySelector(".restoreBtn").addEventListener("click", () => {
          session.tabs.forEach((tab) => {
            chrome.tabs.create({ url: tab.url });
          });
        });

        // Delete session
        li.querySelector(".deleteBtn").addEventListener("click", () => {
          deleteSession(index);
        });
      });
    });
  }

  // Save current tabs as session
  saveBtn.addEventListener("click", () => {
    const title = sessionTitleInput.value.trim();
    const note = sessionNoteInput.value.trim();

    if (!title) {
      alert("Please enter a session title.");
      return;
    }

    // Get current tabs in current window
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const newSession = {
        title,
        note,
        savedAt: Date.now(),
        tabs: tabs.map((tab) => ({
          url: tab.url,
          title: tab.title,
        })),
      };

      chrome.storage.local.get({ sessions: [] }, (data) => {
        const sessions = data.sessions;
        sessions.push(newSession);
        chrome.storage.local.set({ sessions }, () => {
          showMessage("Session saved!");
          sessionTitleInput.value = "";
          sessionNoteInput.value = "";
          loadSessions();
        });
      });
    });
  });

  // Delete session by index
  function deleteSession(index) {
    chrome.storage.local.get({ sessions: [] }, (data) => {
      const sessions = data.sessions;
      sessions.splice(index, 1);
      chrome.storage.local.set({ sessions }, () => {
        loadSessions();
      });
    });
  }

  function showMessage(text) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = text;
    messageDiv.classList.add("show");
    setTimeout(() => {
        messageDiv.classList.remove("show");
    }, 2000);
}


  // Initial load
  loadSessions();
});

