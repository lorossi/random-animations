import { Color } from "./engine.js";

class Circle {
  constructor(x, y, size, scl, xor128) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._scl = scl;
    this._xor128 = xor128;

    this._seed = this._xor128.random();
    this._rotation = this._xor128.random(Math.PI * 2);

    this._color_from = Color.fromHEX("#ffbf00");
    this._color_to = Color.fromHEX("#e83f6f");
    this._orbit_color = Color.fromHEX("#8ea604");

    this.update(0);
  }

  update(t) {
    const tt = this._wrap(t + this._seed);
    const e = Math.sin(tt * Math.PI) ** 2;

    this._color = this._mixColor(this._color_from, this._color_to, e);
    this._radius = (this._size / 2) * e;

    const f = Math.sin((tt * Math.PI) / 2) ** 2;
    this._x_len = this._size * 4 * f;
    this._orbit_len = this._size * (1 - f);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate((this._x + 0.5) * this._size, (this._y + 0.5) * this._size);
    ctx.scale(this._scl, this._scl);
    ctx.rotate(this._rotation);

    ctx.fillStyle = this._color.rgba;
    ctx.beginPath();
    ctx.arc(0, 0, this._radius, 0, Math.PI * 2);
    ctx.arc(this._x_len, 0, this._radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawOrbit(ctx) {
    ctx.save();
    ctx.translate((this._x + 0.5) * this._size, (this._y + 0.5) * this._size);
    ctx.scale(this._scl, this._scl);

    ctx.strokeStyle = this._orbit_color.rgba;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.arc(0, 0, this._orbit_len, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  _mixColor(from, to, t) {
    const r = from.r + (to.r - from.r) * t;
    const g = from.g + (to.g - from.g) * t;
    const b = from.b + (to.b - from.b) * t;

    return new Color(r, g, b);
  }

  _wrap(value) {
    while (value < 0) value += 1;
    while (value >= 1) value -= 1;

    return value;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }
}

export { Circle };
