import { Point } from "./engine.js";

class Circle {
  constructor(from, to, r, lines_num, color) {
    this._from = from.copy();
    this._to = to.copy();
    this._r = r;
    this._lines_num = lines_num;
    this._color = color;

    this._pos = from;
  }

  update(t) {
    const e = this._easeInOutPoly(t);
    const x = this._lerp(this._from.x, this._to.x, e);
    const y = this._lerp(this._from.y, this._to.y, e);
    this._pos = new Point(x, y);
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._pos.x, this._pos.y);
    ctx.fillStyle = this._color.rgba;

    for (let i = 0; i < this._lines_num; i++) {
      const outer_r = (this._r * (2 * i + 1)) / (this._lines_num * 2);
      const inner_r = (this._r * 2 * i) / (this._lines_num * 2);

      ctx.beginPath();
      ctx.arc(0, 0, inner_r, 0, 2 * Math.PI);
      ctx.arc(0, 0, outer_r, 0, 2 * Math.PI, true);
      ctx.fill();
    }

    ctx.restore();
  }

  _lerp(from, to, t) {
    return from + (to - from) * t;
  }

  _easeInOutPoly(x, n = 2) {
    return x < 0.5
      ? 0.5 * Math.pow(2 * x, n)
      : 1 - 0.5 * Math.pow(2 * (1 - x), n);
  }
}

export { Circle };
