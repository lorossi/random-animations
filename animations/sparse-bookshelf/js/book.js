import { Color } from "./engine.js";

class Book {
  constructor(x, y, w, h, xor128, palette) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
    this._xor128 = xor128;
    this._palette = palette;

    const r = this._xor128.random_interval(-1, 1);
    this._rotation = this._easeAroundZero(r) * (Math.PI / 64);
  }

  show(ctx) {
    const fill = this._palette.getRandomColor(this._xor128);
    const stroke = fill.copy().darken(this._xor128.random(8, 16));

    ctx.save();
    ctx.fillStyle = fill.rgba;
    ctx.strokeStyle = stroke.rgba;
    ctx.lineWidth = 2;

    ctx.translate(this._x, this._y);

    // rotate
    ctx.rotate(this._rotation);

    // draw book
    ctx.beginPath();
    ctx.rect(0, 0, this._w, -this._h);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  getActualWidth() {
    return this._w + Math.abs(this._h * Math.sin(this._rotation));
  }

  _easeAroundZero(t) {
    return Math.exp(-(t ** 2));
  }
}

export { Book };
