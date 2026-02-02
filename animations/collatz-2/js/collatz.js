import { Point } from "./lib.js";

class Collatz {
  constructor(n, step_len, start_angle, delta_angle, palette) {
    this._n = n;
    this._step_len = step_len;
    this._start_angle = start_angle;
    this._delta_angle = delta_angle;
    this._palette = palette.copy();

    this._start_n = n;
    this._angle = this._start_angle;
    this._ended = false;

    this._p0 = new Point(0, 0);
    this._p1 = new Point(0, 0);
  }

  step() {
    if (this._ended) return false;

    if (this._n == 1) {
      this._ended = true;
      return false;
    }

    if (this._n % 2 == 0) {
      this._n /= 2;
      this._angle -= this._delta_angle / 2;
    } else {
      this._n = 3 * this._n + 1;
      this._angle += this._delta_angle;
    }

    this._angle = this._wrapAngle(this._angle);

    this._p0 = this._p1.copy();
    const delta_p = new Point(
      Math.cos(this._angle),
      Math.sin(this._angle),
    ).multiply(this._step_len);
    this._p1 = this._p1.add(delta_p);

    return true;
  }

  _wrapAngle(angle) {
    const two_pi = Math.PI * 2;
    return ((angle % two_pi) + two_pi) % two_pi;
  }

  show(ctx) {
    if (this._ended) return;

    const normalized_angle = this._angle / (Math.PI * 2);
    const t = Math.sin(normalized_angle * Math.PI);

    const c = this._palette.getSmoothColor(t);
    c.a = 0.25;

    ctx.save();

    ctx.lineWidth = 1;
    ctx.strokeStyle = c.rgba;
    ctx.beginPath();
    ctx.moveTo(this._p0.x, this._p0.y);
    ctx.lineTo(this._p1.x, this._p1.y);
    ctx.stroke();
    ctx.restore();
  }

  get ended() {
    return this._ended;
  }
}

export { Collatz };
