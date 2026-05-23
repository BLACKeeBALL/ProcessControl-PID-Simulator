let latestData = [];
const $ = id => document.getElementById(id);
function getNumber(id) { const value = Number($(id).value); return Number.isFinite(value) ? value : 0; }
function setDefaults() {
  $("setpoint").value = 80; $("simTime").value = 120; $("dt").value = 0.1;
  $("kp").value = 2.0; $("ki").value = 0.05; $("kd").value = 0.8;
  $("plantK").value = 1.0; $("plantT").value = 18; $("delay").value = 3;
  $("uMax").value = 100; $("uMin").value = 0;
  $("disturbEnable").checked = true; $("disturbTime").value = 60; $("disturbValue").value = -8;
}
function applyPreset(name) {
  const presets = {
    conservative: { kp: 1.2, ki: 0.02, kd: 0.4 },
    stable: { kp: 2.0, ki: 0.05, kd: 0.8 },
    fast: { kp: 3.5, ki: 0.08, kd: 1.2 }
  };
  const p = presets[name]; if (!p) return;
  $("kp").value = p.kp; $("ki").value = p.ki; $("kd").value = p.kd;
  runSimulation();
}
function runSimulation() {
  const setpoint = getNumber("setpoint");
  const simTime = Math.max(1, getNumber("simTime"));
  const dt = Math.max(0.01, getNumber("dt"));
  const steps = Math.round(simTime / dt);
  const pid = new PIDController(getNumber("kp"), getNumber("ki"), getNumber("kd"), dt, getNumber("uMin"), getNumber("uMax"));
  const plant = new FirstOrderDelayPlant(getNumber("plantK"), getNumber("plantT"), getNumber("delay"), dt, 25);
  const disturbEnable = $("disturbEnable").checked;
  const disturbTime = getNumber("disturbTime");
  const disturbValue = getNumber("disturbValue");
  const data = [];
  for (let i = 0; i <= steps; i++) {
    const time = i * dt;
    const control = pid.update(setpoint, plant.y);
    let disturbance = 0;
    if (disturbEnable && Math.abs(time - disturbTime) <= dt / 2) disturbance = disturbValue;
    const output = plant.update(control.u, disturbance);
    data.push({ time, setpoint, output, control: control.u, error: setpoint - output });
  }
  latestData = data;
  const metrics = calculateMetrics(data, setpoint, dt);
  updateMetrics(metrics);
  drawCharts(data);
  $("analysisText").textContent = generateAnalysis(metrics);
}
function updateMetrics(m) {
  $("overshoot").textContent = `${m.overshoot.toFixed(2)} %`;
  $("settlingTime").textContent = m.settlingTime === null ? "未稳定" : `${m.settlingTime.toFixed(1)} s`;
  $("steadyError").textContent = m.steadyError.toFixed(3);
  $("iae").textContent = m.iae.toFixed(2);
  $("ise").textContent = m.ise.toFixed(2);
}
function drawCharts(data) {
  drawLineChart($("responseChart"), data, [{ key: "setpoint", label: "设定值" }, { key: "output", label: "系统输出" }]);
  drawLineChart($("controlChart"), data, [{ key: "control", label: "控制量" }]);
}
function drawLineChart(canvas, data, series) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width, height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  const margin = { left: 58, right: 24, top: 24, bottom: 46 };
  const plotW = width - margin.left - margin.right, plotH = height - margin.top - margin.bottom;
  const xMin = 0, xMax = data[data.length - 1].time;
  let yValues = [];
  for (const s of series) yValues = yValues.concat(data.map(d => d[s.key]));
  let yMin = Math.min(...yValues), yMax = Math.max(...yValues);
  if (Math.abs(yMax - yMin) < 1e-9) { yMax += 1; yMin -= 1; }
  const yPad = (yMax - yMin) * 0.12; yMax += yPad; yMin -= yPad;
  const xToPx = x => margin.left + (x - xMin) / (xMax - xMin) * plotW;
  const yToPx = y => margin.top + (yMax - y) / (yMax - yMin) * plotH;
  ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1; ctx.font = "14px Microsoft YaHei, Arial"; ctx.fillStyle = "#64748b";
  for (let i = 0; i <= 5; i++) {
    const x = margin.left + i / 5 * plotW;
    ctx.beginPath(); ctx.moveTo(x, margin.top); ctx.lineTo(x, margin.top + plotH); ctx.stroke();
    ctx.fillText((xMin + i / 5 * (xMax - xMin)).toFixed(0), x - 10, height - 18);
  }
  for (let i = 0; i <= 5; i++) {
    const y = margin.top + i / 5 * plotH;
    ctx.beginPath(); ctx.moveTo(margin.left, y); ctx.lineTo(margin.left + plotW, y); ctx.stroke();
    ctx.fillText((yMax - i / 5 * (yMax - yMin)).toFixed(1), 8, y + 5);
  }
  ctx.strokeStyle = "#111827"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(margin.left, margin.top); ctx.lineTo(margin.left, margin.top + plotH); ctx.lineTo(margin.left + plotW, margin.top + plotH); ctx.stroke();
  const colors = ["#2563eb", "#f97316", "#16a34a", "#7c3aed"];
  series.forEach((s, index) => {
    ctx.strokeStyle = colors[index % colors.length]; ctx.lineWidth = 2.5; ctx.beginPath();
    data.forEach((d, i) => { const x = xToPx(d.time), y = yToPx(d[s.key]); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.fillStyle = colors[index % colors.length]; ctx.fillRect(margin.left + 12 + index * 140, 12, 14, 14);
    ctx.fillStyle = "#334155"; ctx.fillText(s.label, margin.left + 32 + index * 140, 24);
  });
  ctx.fillStyle = "#64748b"; ctx.fillText("时间 / s", width / 2 - 24, height - 8);
}
function exportCSV() {
  if (!latestData.length) runSimulation();
  const header = "time,setpoint,output,control,error\n";
  const rows = latestData.map(d => [d.time.toFixed(3), d.setpoint.toFixed(3), d.output.toFixed(3), d.control.toFixed(3), d.error.toFixed(3)].join(",")).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "pid_simulation_data.csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
document.addEventListener("DOMContentLoaded", () => {
  $("runBtn").addEventListener("click", runSimulation);
  $("csvBtn").addEventListener("click", exportCSV);
  $("resetBtn").addEventListener("click", () => { setDefaults(); runSimulation(); });
  document.querySelectorAll("[data-preset]").forEach(btn => btn.addEventListener("click", () => applyPreset(btn.dataset.preset)));
  runSimulation();
});
