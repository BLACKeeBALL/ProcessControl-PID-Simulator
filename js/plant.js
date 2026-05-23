class FirstOrderDelayPlant {
  constructor(K, T, delay, dt, initialValue = 25) {
    this.K = K; this.T = Math.max(T, dt); this.delay = Math.max(0, delay);
    this.dt = dt; this.y = initialValue;
    this.delaySteps = Math.round(this.delay / this.dt);
    this.uBuffer = Array(this.delaySteps + 1).fill(0);
  }
  update(u, disturbance = 0) {
    this.uBuffer.push(u);
    const delayedU = this.uBuffer.shift();
    const dy = (this.dt / this.T) * (-this.y + this.K * delayedU);
    this.y += dy + disturbance;
    return this.y;
  }
}
