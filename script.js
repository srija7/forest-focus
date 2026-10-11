const $ = (id) => document.getElementById(id);

const app = $("app");
const timeEl = $("time");
const actionBtn = $("action");
const setupEl = $("setup");
const minutesInput = $("minutes");
const customChip = $("custom-chip");
const customRow = $("custom-row");
const messageEl = $("message");
const stageLabel = $("stage-label");
const ringProgress = $("ring-progress");
const forestEl = $("forest");
const forestCount = $("forest-count");
const forestHint = $("forest-hint");
const stages = document.querySelectorAll(".stage");
const presets = document.querySelectorAll(".preset");

const RING_LENGTH = 2 * Math.PI * parseFloat(ringProgress.getAttribute("r"));
ringProgress.style.strokeDasharray = RING_LENGTH;
ringProgress.style.strokeDashoffset = RING_LENGTH;

const STAGE_NAMES = ["Seed", "Sprout", "Sapling", "Young tree", "Full tree"];
// progress (0-1) at which each stage appears
const STAGE_THRESHOLDS = [0, 0.1, 0.35, 0.65, 0.95];

let totalSeconds = 25 * 60;
let endTime = null;
let tickId = null;
let running = false;

/* ---------------- Timer ---------------- */

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function stageFor(progress) {
  let idx = 0;
  STAGE_THRESHOLDS.forEach((t, i) => { if (progress >= t) idx = i; });
  return idx;
}

function showStage(idx) {
  stages.forEach((el) => el.classList.toggle("visible", Number(el.dataset.stage) === idx));
  stageLabel.textContent = STAGE_NAMES[idx];
}

function render(remaining) {
  const progress = running ? 1 - remaining / totalSeconds : 0;
  timeEl.textContent = fmt(remaining);
  ringProgress.style.strokeDashoffset = RING_LENGTH * (1 - progress);
  showStage(stageFor(progress));
  document.title = running ? `${fmt(remaining)} · Forest Focus` : "Forest Focus";
}

function start() {
  const mins = Math.max(1, Math.min(180, parseInt(minutesInput.value, 10) || 25));
  totalSeconds = mins * 60;
  endTime = Date.now() + totalSeconds * 1000;
  running = true;
  app.classList.add("running");
  actionBtn.textContent = "Give Up";
  actionBtn.classList.add("give-up");
  messageEl.textContent = "Stay focused. Your tree is growing.";
  tickId = setInterval(tick, 250);
  tick();
}

function tick() {
  const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  render(remaining);
  if (remaining <= 0) complete();
}

function stop() {
  clearInterval(tickId);
  running = false;
  app.classList.remove("running");
  actionBtn.textContent = "Plant";
  actionBtn.classList.remove("give-up");
}

function complete() {
  stop();
  saveTree();
  messageEl.textContent = `Well done! You focused for ${totalSeconds / 60} minutes. 🌳`;
  document.title = "Forest Focus";
  timeEl.textContent = fmt(totalSeconds);
  ringProgress.style.strokeDashoffset = 0;
  showStage(4);
  renderForest();
  renderStats();
}

function giveUp() {
  if (!confirm("Give up? Your tree won't be planted.")) return;
  stop();
  messageEl.textContent = "Your seed didn't make it. Try again!";
  render(totalSeconds);
}

/* ---------------- Saved forest ---------------- */

function loadForest() {
  try { return JSON.parse(localStorage.getItem("forest") || "[]"); }
  catch { return []; }
}

function saveTree() {
  const forest = loadForest();
  forest.push({ date: new Date().toISOString(), minutes: totalSeconds / 60 });
  try { localStorage.setItem("forest", JSON.stringify(forest)); } catch {}
}

/* ---------------- Stats ---------------- */

function fmtMinutes(m) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

function renderStats() {
  const forest = loadForest();
  const todayStr = new Date().toLocaleDateString();
  const today = forest.filter((t) => new Date(t.date).toLocaleDateString() === todayStr);
  const sum = (arr) => arr.reduce((a, t) => a + (t.minutes || 0), 0);

  $("stat-today").textContent = today.length;
  $("stat-today-min").textContent = fmtMinutes(sum(today));
  $("stat-total").textContent = fmtMinutes(sum(forest));
}

/* ---------------- Isometric forest ---------------- */

function treeSvg(cx, cy, kind, scale) {
  let body;
  if (kind === 0) {
    body = `
      <rect x="-2" y="-8" width="4" height="8" fill="#6b4a22"/>
      <polygon points="0,-28 13,-8 -13,-8" fill="#3a8a2a"/>
      <polygon points="0,-38 10,-20 -10,-20" fill="#5aa83a"/>`;
  } else if (kind === 1) {
    body = `
      <rect x="-2" y="-9" width="4" height="9" fill="#6b4a22"/>
      <circle cx="0" cy="-20" r="11" fill="#4f9f36"/>
      <circle cx="3" cy="-24" r="6" fill="#6cbc48"/>`;
  } else {
    body = `
      <rect x="-2" y="-8" width="4" height="8" fill="#6b4a22"/>
      <polygon points="0,-44 8,-12 -8,-12" fill="#2f7d2a"/>
      <polygon points="0,-44 8,-12 0,-12" fill="#3f9436"/>`;
  }
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">${body}</g>`;
}

function renderForest() {
  const all = loadForest();
  const MAX = 64;
  const shown = all.slice(-MAX);
  const offset = all.length - shown.length;
  const N = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(shown.length || 1))));
  const hw = 26, hh = 13, thick = 16;

  const vbX = -N * hw - 4;
  const vbY = -46;
  const vbW = 2 * N * hw + 8;
  const vbH = 2 * N * hh + 46 + thick + 6;

  let cells = "";
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const x = (i - j) * hw, y = (i + j) * hh;
      const fill = (i + j) % 2 ? "#96ca48" : "#8cc13d";
      cells += `<polygon points="${x},${y} ${x + hw},${y + hh} ${x},${y + 2 * hh} ${x - hw},${y + hh}" fill="${fill}"/>`;
    }
  }

  const placed = shown.map((t, k) => ({
    i: k % N,
    j: Math.floor(k / N),
    kind: (offset + k) % 3,
    minutes: t.minutes,
    date: t.date,
  }));
  placed.sort((a, b) => (a.i + a.j) - (b.i + b.j) || a.i - b.i);

  const trees = placed.map((p) => {
    const cx = (p.i - p.j) * hw;
    const cy = (p.i + p.j + 1) * hh;
    const s = p.minutes >= 45 ? 1.15 : 0.95;
    const title = `${new Date(p.date).toLocaleString()} · ${p.minutes} min`;
    return `<g><title>${title}</title>${treeSvg(cx, cy, p.kind, s)}</g>`;
  }).join("");

  const left = `${-N * hw},${N * hh} 0,${2 * N * hh} 0,${2 * N * hh + thick} ${-N * hw},${N * hh + thick}`;
  const right = `0,${2 * N * hh} ${N * hw},${N * hh} ${N * hw},${N * hh + thick} 0,${2 * N * hh + thick}`;

  forestEl.innerHTML = `
    <svg viewBox="${vbX} ${vbY} ${vbW} ${vbH}" role="img" aria-label="Your forest">
      <polygon points="${left}" fill="#7a4e24"/>
      <polygon points="${right}" fill="#5f3c1a"/>
      ${cells}
      ${trees}
    </svg>`;

  forestCount.textContent = all.length ? `(${all.length})` : "";
  forestHint.textContent = all.length
    ? (all.length > MAX ? `Showing your latest ${MAX} trees.` : "")
    : "Finish a focus session to plant your first tree.";
}

/* ---------------- Controls ---------------- */

actionBtn.addEventListener("click", () => (running ? giveUp() : start()));

function setMinutes(m) {
  minutesInput.value = m;
  totalSeconds = m * 60;
  render(totalSeconds);
}

presets.forEach((btn) => {
  btn.addEventListener("click", () => {
    presets.forEach((b) => b.classList.remove("active"));
    customChip.classList.remove("active");
    customRow.hidden = true;
    btn.classList.add("active");
    setMinutes(Number(btn.dataset.min));
  });
});

customChip.addEventListener("click", () => {
  presets.forEach((b) => b.classList.remove("active"));
  customChip.classList.add("active");
  customRow.hidden = false;
  minutesInput.focus();
  minutesInput.select();
});

minutesInput.addEventListener("input", () => {
  const m = parseInt(minutesInput.value, 10);
  if (m > 0) setMinutes(m);
});

render(totalSeconds);
renderForest();
renderStats();
