class PIDController {
  constructor(kp, ki, kd, dt, uMin, uMax) {
    this.kp = kp; this.ki = ki; this.kd = kd; this.dt = dt;
    this.uMin = uMin; this.uMax = uMax;
    this.integral = 0; this.prevError = 0;
  }
  clamp(value) { return Math.max(this.uMin, Math.min(this.uMax, value)); }
  update(setpoint, output) {
    const error = setpoint - output;
    this.integral += error * this.dt;
    const derivative = (error - this.prevError) / this.dt;
    let u = this.kp * error + this.ki * this.integral + this.kd * derivative;
    const unclamped = u;
    u = this.clamp(u);
    if (u !== unclamped) this.integral -= error * this.dt;
    this.prevError = error;
    return { u, error };
  }
}
