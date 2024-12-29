import { XOR128 } from "./xor128.js";

class Particle {
  constructor(inner_rho, rho, theta, seed, color) {
    this._inner_rho = inner_rho;
    this._rho = rho;
    this._theta = theta;
    this._seed = seed;
    this._color = color;

    this._xor128 = new XOR128(this._seed);
    this._t = 0;
    this._size = 10;
    this._offset = this._xor128.random();
  }

  update(t) {
    const tt = this._wrap_t(t + this._offset);
    const e = this._easeInPoly(tt, 2);
    this._t = e;
    this._size = 5 * (1 - e);
  }

  show(ctx) {
    const r = this._rho * this._t + this._inner_rho * (1 - this._t);

    ctx.save();
    ctx.fillStyle = this._color.rgba;
    ctx.strokeStyle = this._color.rgba;

    ctx.rotate(this._theta);
    ctx.translate(r, 0);

    ctx.beginPath();
    ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
    ctx.fill();
    ctx.restore();
  }

  _wrap_t(t) {
    while (t < 0) t += 1;
    while (t > 1) t -= 1;
    return t;
  }

  _easeInOutPoly(x, n = 2) {
    return x < 0.5
      ? 0.5 * Math.pow(2 * x, n)
      : 1 - 0.5 * Math.pow(2 * (1 - x), n);
  }

  _easeInPoly(x, n = 2) {
    return Math.pow(x, n);
  }
}

export { Particle };
