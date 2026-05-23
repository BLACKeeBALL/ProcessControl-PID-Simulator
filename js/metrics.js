function calculateMetrics(data, setpoint, dt) {
  const yValues = data.map(d => d.output);
  const errors = data.map(d => d.error);
  const maxY = Math.max(...yValues);
  const finalY = yValues[yValues.length - 1];
  const overshoot = setpoint === 0 ? 0 : Math.max(0, (maxY - setpoint) / Math.abs(setpoint) * 100);
  const steadyError = Math.abs(setpoint - finalY);
  let iae = 0, ise = 0;
  for (const e of errors) { iae += Math.abs(e) * dt; ise += e * e * dt; }
  const band = Math.abs(setpoint) * 0.02;
  let settlingTime = null;
  for (let i = 0; i < yValues.length; i++) {
    let stable = true;
    for (let j = i; j < yValues.length; j++) {
      if (Math.abs(yValues[j] - setpoint) > band) { stable = false; break; }
    }
    if (stable) { settlingTime = data[i].time; break; }
  }
  return { overshoot, steadyError, iae, ise, settlingTime };
}
function generateAnalysis(metrics) {
  const parts = [];
  if (metrics.overshoot < 5) parts.push("系统超调量较小，说明当前参数下响应较平稳。");
  else if (metrics.overshoot < 20) parts.push("系统存在一定超调，响应速度较快但平稳性一般。");
  else parts.push("系统超调量较大，建议适当减小 Kp 或增大 Kd。");
  if (metrics.steadyError < 1) parts.push("稳态误差较小，积分环节能够有效消除静差。");
  else parts.push("稳态误差仍然明显，可以适当增大 Ki，但需注意避免振荡。");
  if (metrics.settlingTime === null) parts.push("在当前仿真时间内系统未完全进入 2% 误差带，说明调节时间较长或系统存在振荡。");
  else parts.push(`系统约在 ${metrics.settlingTime.toFixed(1)} s 后进入稳定范围。`);
  return parts.join("");
}
