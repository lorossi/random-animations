import { Color, Point } from "./engine.js";

class Sine {
  constructor(rho, omega, phi) {
    this._rho = rho;
    this._omega = omega;
    this._phi = phi;
  }

  get(t) {
    return this._rho * Math.sin(this._omega * t * Math.PI * 2 + this._phi);
  }
}

class Frame {
  constructor(x, y, size, scl) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._scl = scl;

    this._reset = true;
    this._point = null;
    this._old_point = null;
    this._sines = [];
    this._sines_scl = 1;
  }

  setSines(sines) {
    this._sines = sines;
  }

  setOffset(offset) {
    this._offset = offset;
  }

  setBG(bg) {
    this._bg = bg;
  }

  setRandom(xor128) {
    this._xor128 = xor128;
  }

  _calculateX(t) {
    return this._sines
      .slice(this._sines.length / 2, this._sines.length)
      .reduce((acc, s) => acc + s.get(t), 0);
  }

  _calculateY(t) {
    return this._sines
      .slice(0, this._sines.length / 2)
      .reduce((acc, s) => acc + s.get(t), 0);
  }

  init() {
    this._point = null;
    this._old_point = null;

    const steps = 100;
    const time_steps = new Array(steps).fill(0).map((_, i) => i / steps);

    const max_x = time_steps.reduce((acc, t) => {
      const x = this._calculateX(t);
      return x > acc ? x : acc;
    }, 0);
    const max_y = time_steps.reduce((acc, t) => {
      const y = this._calculateY(t);
      return y > acc ? y : acc;
    }, 0);
    const min_x = time_steps.reduce((acc, t) => {
      const x = this._calculateX(t);
      return x < acc ? x : acc;
    }, 0);
    const min_y = time_steps.reduce((acc, t) => {
      const y = this._calculateY(t);
      return y < acc ? y : acc;
    }, 0);

    this._sines_scl = this._size / Math.max(max_x - min_x, max_y - min_y);
  }

  update(t) {
    this._old_point = this._point;

    const tt = (t + this._offset) % 1;

    const x = this._calculateX(tt) * this._sines_scl;
    const y = this._calculateY(tt) * this._sines_scl;
    this._point = new Point(x, y);

    if (tt == 0) {
      this._reset = true;
    }
  }

  show(ctx) {
    if (this._old_point == null) return;

    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl, this._scl);

    ctx.strokeStyle = Color.fromMonochrome(80).rgb;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
    ctx.stroke();

    ctx.save();
    ctx.scale(0.9, 0.9); // make sure the line is not clipped
    ctx.strokeStyle = Color.fromMonochrome(180, 0.5).rgba;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(this._old_point.x, this._old_point.y);
    ctx.lineTo(this._point.x, this._point.y);
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  }

  get reset() {
    return this._reset;
  }
}

export { Frame, Sine };
