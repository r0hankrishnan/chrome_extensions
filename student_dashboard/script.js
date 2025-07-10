document.addEventListener("DOMContentLoaded", () => {
  const courseForm = document.getElementById("courseForm");
  const courseInput = document.getElementById("courseInput");

  const assignmentForm = document.getElementById("assignmentForm");
  const assignmentInput = document.getElementById("assignmentInput");
  const assignmentCourseSelect = document.getElementById("assignmentCourseSelect");

  const resourceForm = document.getElementById("resourceForm");
  const resourceNameInput = document.getElementById("resourceNameInput");
  const resourceUrlInput = document.getElementById("resourceUrlInput");

  courseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = courseInput.value.trim();
    if (val) {
      addCourse(val);
      courseInput.value = "";
    }
  });

  assignmentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = assignmentInput.value.trim();
    const courseTag = assignmentCourseSelect.value || "Other";
    if (val) {
      addAssignment(val, courseTag);
      assignmentInput.value = "";
      assignmentCourseSelect.value = "Other";
    }
  });

  resourceForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = resourceNameInput.value.trim();
    const url = resourceUrlInput.value.trim();
    if (name && url) {
      addResource(name, url);
      resourceNameInput.value = "";
      resourceUrlInput.value = "";
    }
  });

  function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  function setData(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function addCourse(name) {
    const courses = getData("courses");
    courses.push(name);
    setData("courses", courses);
    renderCourses();
    populateCourseSelect();
  }

  function addAssignment(text, courseTag) {
    const assignments = getData("assignments");
    assignments.push({ text, done: false, courseTag });
    setData("assignments", assignments);
    renderAssignments();
  }

  function addResource(name, url) {
    const resources = getData("resources");
    resources.push({ name, url });
    setData("resources", resources);
    renderResources();
  }

  function populateCourseSelect() {
    const courses = getData("courses");

    assignmentCourseSelect.innerHTML = ""; // Clear all existing options

    const otherOption = document.createElement("option");
    otherOption.value = "Other";
    otherOption.textContent = "Other";
    assignmentCourseSelect.appendChild(otherOption);

    courses.forEach((course) => {
      const option = document.createElement("option");
      option.value = course;
      option.textContent = course;
      assignmentCourseSelect.appendChild(option);
    });

    assignmentCourseSelect.value = "Other";
  }

  function renderCourses() {
    const ul = document.getElementById("courseLinks");
    ul.innerHTML = "";
    const courses = getData("courses");
    courses.forEach((name, idx) => {
      const li = document.createElement("li");
      li.className = "card-list-item";
      li.textContent = name;

      const btn = createRemoveBtn(() => {
        removeItem("courses", idx);
      });

      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  function renderAssignments() {
    const ul = document.getElementById("assignments");
    ul.innerHTML = "";
    const assignments = getData("assignments");

    assignments.forEach(({ text, done, courseTag }, idx) => {
      const li = document.createElement("li");
      li.className = "card-list-item";

      const label = document.createElement("label");
      label.className = "checkbox-label";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = done;
      checkbox.addEventListener("change", () => {
        const assignments = getData("assignments");
        assignments[idx].done = checkbox.checked;
        setData("assignments", assignments);
        renderAssignments();
      });

      const span = document.createElement("span");
      span.textContent = text;

      label.appendChild(checkbox);
      label.appendChild(span);
      li.appendChild(label);

      // Add course tag
      const tag = document.createElement("span");
      tag.className = "assignment-tag";
      tag.textContent = courseTag;
      li.appendChild(tag);

      const btn = createRemoveBtn(() => {
        removeItem("assignments", idx);
      });

      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  function renderResources() {
    const ul = document.getElementById("resources");
    ul.innerHTML = "";
    const resources = getData("resources");
    resources.forEach(({ name, url }, idx) => {
      const li = document.createElement("li");
      li.className = "card-list-item";

      const link = document.createElement("a");
      link.href = url;
      link.textContent = name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "resource-link";

      li.appendChild(link);

      const btn = createRemoveBtn(() => {
        removeItem("resources", idx);
      });
      li.appendChild(btn);

      ul.appendChild(li);
    });
  }

  function createRemoveBtn(handler) {
    const btn = document.createElement("button");
    btn.textContent = "✖";
    btn.className = "remove-btn";
    btn.addEventListener("click", handler);
    return btn;
  }

  function removeItem(key, idx) {
    const data = getData(key);
    data.splice(idx, 1);
    setData(key, data);

    if (key === "courses") {
      renderCourses();
      populateCourseSelect();
    } else if (key === "assignments") {
      renderAssignments();
    } else if (key === "resources") {
      renderResources();
    }
  }

  // Initial render
  renderCourses();
  renderAssignments();
  renderResources();
  populateCourseSelect();
});

