
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('mindboard');
  const ctx = canvas.getContext('2d');

  const clearBtn = document.getElementById('clear-btn');
  const saveBtn = document.getElementById('save-btn');
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  const linkBtn = document.getElementById('link-btn');
  const imageBtn = document.getElementById('image-btn');
  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.style.display = "none";
  document.body.appendChild(imageInput);
  const thicknessSlider = document.getElementById('thickness-slider');
  const thicknessValue = document.getElementById('thickness-value');
  const colorPicker = document.getElementById('color-picker');

  let drawing = false;
  let points = [];
  let redoStack = [];
  let skipNextRestore = false;
  let lineWidth = parseInt(localStorage.getItem('mindboard_lineWidth')) || 2;
  let strokeColor = localStorage.getItem('mindboard_color') || '#000000';
  let linkingMode = false;
  let nodes = [];
  let hoveredLinkIndex = -1;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!skipNextRestore) restoreCanvas();
    skipNextRestore = false;
  }

  function startDrawing(e) {
    if (linkingMode) {
      const x = e.clientX;
      const y = e.clientY;
      nodes.push({ x, y });

      if (nodes.length === 1) {
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
      }

      if (nodes.length === 2) {
        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.moveTo(nodes[0].x, nodes[0].y);
        ctx.lineTo(nodes[1].x, nodes[1].y);
        ctx.stroke();
        const label = prompt("Optional: enter label for this link");
        points.push({ type: "link", from: nodes[0], to: nodes[1], color: strokeColor, label });
        nodes = [];
        if (!linkingMode) linkBtn.textContent = "Link";
        restoreCanvas();
      }
      return;
    }

    drawing = true;
    const x = e.clientX;
    const y = e.clientY;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeColor;
    ctx.moveTo(x, y);
    points.push({ type: "stroke", color: strokeColor, width: lineWidth, path: [[x, y]] });
  }

  function stopDrawing() {
    drawing = false;
    redoStack = [];
  }

  function draw(e) {
    if (!drawing) return;
    const x = e.clientX;
    const y = e.clientY;
    ctx.lineTo(x, y);
    ctx.stroke();
    points[points.length - 1].path.push([x, y]);
  }

  function clearCanvas() {
    points = [];
    redoStack = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem('mindboard');
    skipNextRestore = true;
  }

  function saveCanvas() {
    localStorage.setItem('mindboard', JSON.stringify(points));
    localStorage.setItem('mindboard_lineWidth', lineWidth);
    localStorage.setItem('mindboard_color', strokeColor);
    showPopup("Saved!");
  }

  function restoreCanvas() {
    const saved = localStorage.getItem('mindboard');
    if (!saved) return;
    points = JSON.parse(saved);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const item of points) {
      if (item.type === "image") {
        const img = new Image();
        img.src = item.src;
        img.onload = () => {
          ctx.drawImage(img, item.x, item.y, item.width, item.height);
        };
        continue;
      }
      if (item.type === "stroke" && item.path.length > 1) {
        ctx.beginPath();
        ctx.lineWidth = item.width;
        ctx.strokeStyle = item.color;
        ctx.moveTo(item.path[0][0], item.path[0][1]);
        for (let i = 1; i < item.path.length; i++) {
          ctx.lineTo(item.path[i][0], item.path[i][1]);
        }
        ctx.stroke();
      } else if (item.type === "link") {
        ctx.beginPath();
        ctx.strokeStyle = item.color || "#10b981";
        ctx.lineWidth = 2;
        ctx.moveTo(item.from.x, item.from.y);
        ctx.lineTo(item.to.x, item.to.y);
        ctx.stroke();
        if (item.label) {
          ctx.font = "14px sans-serif";
          ctx.fillStyle = item.color || "#000";
          const midX = (item.from.x + item.to.x) / 2;
          const midY = (item.from.y + item.to.y) / 2;
          ctx.fillText(item.label, midX + 5, midY - 5);
        }
      }
    }
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeColor;
  }

  function showPopup(message) {
    const popup = document.createElement('div');
    popup.textContent = message;
    Object.assign(popup.style, {
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.75)',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      zIndex: 9999
    });
    document.body.appendChild(popup);
    requestAnimationFrame(() => { popup.style.opacity = '1'; });
    setTimeout(() => { popup.style.opacity = '0'; setTimeout(() => popup.remove(), 500); }, 1500);
  }

  function undo() {
    if (points.length > 0) {
      redoStack.push(points.pop());
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      restoreCanvas();
    }
  }

  function redo() {
    if (redoStack.length > 0) {
      points.push(redoStack.pop());
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      restoreCanvas();
    }
  }

  imageBtn.addEventListener("click", () => imageInput.click());
  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 100, 100, img.width / 2, img.height / 2);
        points.push({ type: "image", src: e.target.result, x: 100, y: 100, width: img.width / 2, height: img.height / 2 });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  canvas.addEventListener('mousemove', (e) => {
    hoveredLinkIndex = -1;
    const mx = e.clientX, my = e.clientY;
    points.forEach((item, i) => {
      if (item.type === 'link') {
        const { from, to } = item;
        const dist = pointLineDistance(mx, my, from.x, from.y, to.x, to.y);
        if (dist < 5) hoveredLinkIndex = i;
      }
    });
    canvas.style.cursor = hoveredLinkIndex !== -1 ? 'pointer' : 'crosshair';
  });

  canvas.addEventListener('click', (e) => {
    if (hoveredLinkIndex !== -1 && confirm("Delete this link?")) {
      points.splice(hoveredLinkIndex, 1);
      hoveredLinkIndex = -1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      restoreCanvas();
    }
  });

  function pointLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = px - xx, dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);
  canvas.addEventListener('mousemove', draw);
  clearBtn.addEventListener('click', clearCanvas);
  saveBtn.addEventListener('click', saveCanvas);
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);
  linkBtn.addEventListener('click', () => {
    linkingMode = !linkingMode;
    linkBtn.textContent = linkingMode ? "Linking..." : "Link";
    nodes = [];
  });
});
