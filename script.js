const $ = (id) => document.getElementById(id);

const timeEl = $("time");
const actionBtn = $("action");
const setupEl = $("setup");
const minutesInput = $("minutes");
const messageEl = $("message");
const stageLabel = $("stage-label");
const ringProgress = $("ring-progress");
const forestEl = $("forest");
const forestCount = $("forest-count");
const stages = document.querySelectorAll(".stage");

const RING_LENGTH = 2 * Math.PI * 94;
const STAGE_NAMES = ["Seed", "Sprout", "Sapling", "Young tree", "Full tree"];
// progress thresholds (0-1) at which each stage appears
const STAGE_THRESHOLDS = [0, 0.1, 0.35, 0.65, 0.95];

let totalSeconds = 25 * 60;
let endTime = null;
let tickId = null;
let running = false;

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

function render(remaining) {
  const progress = running ? 1 - remaining / totalSeconds : 0;
  timeEl.textContent = fmt(remaining);
  ringProgress.style.strokeDashoffset = RING_LENGTH * (1 - progress);

  const idx = stageFor(progress);
  stages.forEach((el) => {
    el.classList.toggle("visible", Number(el.dataset.stage) === idx);
  });
  stageLabel.textContent = STAGE_NAMES[idx];
  document.title = running ? `${fmt(remaining)} · Forest Focus` : "Forest Focus";
}

function start() {
  const mins = Math.max(1, Math.min(180, parseInt(minutesInput.value, 10) || 25));
  totalSeconds = mins * 60;
  endTime = Date.now() + totalSeconds * 1000;
  running = true;
  setupEl.style.display = "none";
  actionBtn.textContent = "Give Up";
  actionBtn.classList.add("give-up");
  messageEl.textContent = "Stay focused — your tree is growing.";
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
  setupEl.style.display = "";
  actionBtn.textContent = "Plant";
  actionBtn.classList.remove("give-up");
}

function complete() {
  stop();
  saveTree();
  messageEl.textContent = `Well done! You focused for ${totalSeconds / 60} minutes. 🌳`;
  render(totalSeconds);
  stages.forEach((el) => el.classList.toggle("visible", Number(el.dataset.stage) === 4));
  stageLabel.textContent = STAGE_NAMES[4];
  renderForest();
}

function giveUp() {
  if (!confirm("Give up? Your tree won't be planted.")) return;
  stop();
  messageEl.textContent = "Your seed didn't make it. Try again!";
  render(totalSeconds);
}

// ---- Forest (saved in the browser) ----
function loadForest() {
  try { return JSON.parse(localStorage.getItem("forest") || "[]"); }
  catch { return []; }
}

function saveTree() {
  const forest = loadForest();
  forest.push({ date: new Date().toISOString(), minutes: totalSeconds / 60 });
  try { localStorage.setItem("forest", JSON.stringify(forest)); } catch {}
}

function renderForest() {
  const forest = loadForest();
  forestCount.textContent = forest.length ? `(${forest.length})` : "";
  forestEl.innerHTML = forest.length
    ? forest.map((t) => `<span title="${new Date(t.date).toLocaleString()} · ${t.minutes} min">🌲</span>`).join("")
    : '<span class="empty">No trees yet. Finish a session to plant one.</span>';
}

// ---- Controls ----
actionBtn.addEventListener("click", () => (running ? giveUp() : start()));

document.querySelectorAll(".preset").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".preset").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    minutesInput.value = btn.dataset.min;
    totalSeconds = Number(btn.dataset.min) * 60;
    render(totalSeconds);
  });
});

minutesInput.addEventListener("input", () => {
  document.querySelectorAll(".preset").forEach((b) => b.classList.remove("active"));
  const m = parseInt(minutesInput.value, 10);
  if (m > 0) { totalSeconds = m * 60; render(totalSeconds); }
});

render(totalSeconds);
renderForest();
