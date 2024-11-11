import { Color } from "./engine.js";

class Book {
  constructor(x, y, w, h, xor128, palette) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
    this._xor128 = xor128;
    this._palette = palette;

    this._rotation =
      this._xor128.random() > 0.3 ? 0 : this._xor128.random(Math.PI / 64);
  }

  show(ctx) {
    const fill = this._palette.getRandomColor(this._xor128);
    const stroke = fill.copy().darken(this._xor128.random(8, 24));

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
}

export { Book };
