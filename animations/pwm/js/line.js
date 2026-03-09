import { Utils } from "./lib.js";

class Line {
  constructor(y, width, height, rectangles, scl, color, xor128) {
    this._y = y;
    this._width = width;
    this._height = height;
    this._rectangles = rectangles;
    this._scl = scl;
    this._color = color;
    this._xor128 = xor128;

    this._phi = this._xor128.random();
    this._direction = this._xor128.pick([-1, 1]);
    this._margin = 0.05;

    this.update(0);
  }

  update(t) {
    const tt = (t + this._phi) % 1;
    if (tt > 1 - this._margin) {
      this._t = 1;
      this._e = 1;
      return;
    }

    this._t = Utils.remap(tt, 0, 1 - this._margin, 0, 1);
    this._e = Utils.ease_in_out_exp(this._t);
    this._rectangle_w = this._width / this._rectangles;
  }

  draw(ctx) {
    const w = Math.ceil(this._e * this._rectangle_w);

    ctx.save();
    ctx.translate(this._width / 2, this._y + this._height / 2);
    ctx.scale(this._direction, this._scl);
    ctx.translate(-this._width / 2, -this._height / 2);

    ctx.fillStyle = this._color.rgba;

    for (let i = 0; i < this._rectangles; i++) {
      ctx.fillRect(i * this._rectangle_w, 0, w, this._height);
    }

    ctx.restore();
  }
}

export { Line };
