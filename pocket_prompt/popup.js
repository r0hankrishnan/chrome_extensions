
let editingIndex = null;
let tagFilter = null;
let promptToDeleteIndex = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}

function showDeleteModal(index) {
  promptToDeleteIndex = index;
  document.getElementById('confirm-modal').classList.remove('hidden');
}

function hideDeleteModal() {
  promptToDeleteIndex = null;
  document.getElementById('confirm-modal').classList.add('hidden');
}

document.getElementById('confirm-delete-btn').addEventListener('click', () => {
  chrome.storage.local.get(["prompts"], (result) => {
    const allPrompts = result.prompts || [];
    allPrompts.splice(promptToDeleteIndex, 1);
    chrome.storage.local.set({ prompts: allPrompts }, () => {
      loadPrompts();
      showToast("Prompt deleted.");
      hideDeleteModal();
    });
  });
});

document.getElementById('cancel-delete-btn').addEventListener('click', hideDeleteModal);


function getTagColorClass(tagText) {
  const colors = 6;
  let hash = 0;
  for (let i = 0; i < tagText.length; i++) {
    hash = tagText.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % colors);
  return `tag-color-${index}`;
}

function loadPrompts() {
  chrome.storage.local.get(["prompts"], (result) => {
    let prompts = Array.isArray(result.prompts) ? result.prompts : [];
    if (tagFilter) {
      prompts = prompts.filter(p => p.tags.includes(tagFilter));
    }
    renderPrompts(prompts);
  });
}

document.getElementById('save-btn').addEventListener('click', () => {
  const title = document.getElementById('prompt-title').value.trim();
  const prompt = document.getElementById('prompt-text').value.trim();
  const tags = document.getElementById('prompt-tags').value.split(',').map(tag => tag.trim()).filter(Boolean);

  if (!title || !prompt) return;

  chrome.storage.local.get({ prompts: [] }, (data) => {
    const prompts = data.prompts;
    if (editingIndex !== null) {
      prompts[editingIndex] = { ...prompts[editingIndex], title, prompt, tags };
      editingIndex = null;
    } else {
      prompts.push({ title, prompt, tags, pinned: false });
    }
    chrome.storage.local.set({ prompts }, () => {
      loadPrompts();
      document.getElementById('prompt-title').value = '';
      document.getElementById('prompt-text').value = '';
      document.getElementById('prompt-tags').value = '';
      document.getElementById('save-btn').textContent = 'Save';
    });
  });
});

function renderPrompts(prompts) {
  const list = document.getElementById("prompt-list");
  list.innerHTML = "";

  prompts
    .sort((a, b) => (b.pinned === true) - (a.pinned === true)) // Pinned first
    .forEach((prompt, index) => {
      const entry = document.createElement("div");
      entry.className = "prompt-entry";
      if (prompt.pinned) entry.classList.add("pinned");

      const title = document.createElement("div");
      title.className = "prompt-title";
      title.textContent = prompt.title;
      entry.appendChild(title);

      const tagsDiv = document.createElement("div");
      tagsDiv.className = "tags";
      prompt.tags.forEach((tagText) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = tagText.trim();
        tag.onclick = () => {
          tagFilter = tagText;
          document.getElementById('tag-filter-clear').style.display = 'inline';
          loadPrompts();
        };
        tagsDiv.appendChild(tag);
      });
      entry.appendChild(tagsDiv);

      const actions = document.createElement("div");
      actions.className = "prompt-actions";

      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.textContent = "Copy";
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(prompt.prompt).then(() => {
          showToast("Prompt copied to clipboard!");
        });
      };

      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => {
        document.getElementById('prompt-title').value = prompt.title;
        document.getElementById('prompt-text').value = prompt.prompt;
        document.getElementById('prompt-tags').value = prompt.tags.join(", ");
        editingIndex = index;
        document.getElementById('save-btn').textContent = 'Update';
      };

      const pinBtn = document.createElement("button");
      pinBtn.className = "pin-btn";
      pinBtn.textContent = prompt.pinned ? "Unpin" : "Pin";
      pinBtn.onclick = () => {
        chrome.storage.local.get(["prompts"], (result) => {
          const allPrompts = result.prompts || [];
          allPrompts[index].pinned = !allPrompts[index].pinned;
          chrome.storage.local.set({ prompts: allPrompts }, () => {
            loadPrompts();
          });
        });
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => {
        showDeleteModal(index);
      };

      actions.appendChild(copyBtn);
      actions.appendChild(editBtn);
      actions.appendChild(pinBtn);
      actions.appendChild(deleteBtn);
      entry.appendChild(actions);

      list.appendChild(entry);
    });
}

document.getElementById('search').addEventListener('input', () => {
  chrome.storage.local.get(["prompts"], (result) => {
    let allPrompts = Array.isArray(result.prompts) ? result.prompts : [];
    const searchTerm = document.getElementById('search').value.toLowerCase();
    allPrompts = allPrompts.filter(p =>
      p.title.toLowerCase().includes(searchTerm) ||
      p.prompt.toLowerCase().includes(searchTerm) ||
      (p.tags || []).some(tag => tag.toLowerCase().includes(searchTerm))
    );
    renderPrompts(allPrompts);
  });
});

document.getElementById('tag-filter-clear').addEventListener('click', () => {
  tagFilter = null;
  document.getElementById('tag-filter-clear').style.display = 'none';
  loadPrompts();
});

document.addEventListener('DOMContentLoaded', () => {
  loadPrompts();

  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.checked = true;
  }

  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  });
});
