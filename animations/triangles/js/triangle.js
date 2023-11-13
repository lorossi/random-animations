import { Color } from "./engine.js";

class Triangle {
  constructor(x, y, scl, y_percent) {
    this._x = x;
    this._y = y;
    this._scl = scl;
    this._y_percent = y_percent;
  }

  setDependences(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;

    this._seeds = new Array(2).fill(null).map(() => xor128.random_int(1e9));
    this._rotation = xor128.random_int(4);
  }

  setAttributes(color, noise_scl, time_scl) {
    this._color = color;
    this._noise_scl = noise_scl;
    this._time_scl = time_scl;
  }

  _drawTriangle(ctx) {
    ctx.rotate((Math.PI / 2) * this._rotation);

    ctx.beginPath();

    ctx.moveTo(-this._scl / 2, -this._scl / 2);
    ctx.lineTo(-this._scl / 2, this._scl / 2);
    ctx.lineTo(this._scl / 2, this._scl / 2);

    ctx.closePath();
    ctx.fill();
  }

  _drawSquare(ctx) {
    ctx.beginPath();

    ctx.rect(-this._scl / 2, -this._scl / 2, this._scl, this._scl);
    ctx.closePath();
    ctx.fill();
  }

  _calculateN(t) {
    const theta = t * Math.PI * 2;
    const nx = 1 + Math.cos(theta) * this._time_scl;
    const ny = 1 + Math.sin(theta) * this._time_scl;

    const n1 = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      nx + this._seeds[0],
      ny + this._seeds[0]
    );

    const h = this._easeOutPoly((n1 + 1) / 2) - this._y_percent;
    if (h < 0) return 0;

    const n2 = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      nx + this._seeds[1],
      ny + this._seeds[1]
    );
    return (n2 + 1) / 2;
  }

  _easeOutPoly(t, n = 0.8) {
    return 1 - (1 - t) ** n;
  }

  _map(x, old_min, old_max, new_min, new_max) {
    return (
      ((x - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min
    );
  }

  show(t, ctx) {
    const n = this._calculateN(t);
    if (n <= 0.33) return;

    const ch = this._map(this._y_percent, 0, 1, 0, 100);
    const fill = Color.fromMonochrome(ch);
    ctx.save();
    ctx.fillStyle = fill.rgba;
    ctx.translate(this._x + this._scl / 2, this._y + this._scl / 2);

    if (n <= 0.66) this._drawTriangle(ctx);
    else this._drawSquare(ctx);

    ctx.restore();
  }
}
export { Triangle };
