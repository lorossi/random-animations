import { XOR128 } from "./lib.js";

class Circle {
  constructor(x, y, r, seed, color) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._color = color;

    this._xor128 = new XOR128(seed);
    this._offset = this._xor128.random();
    this._t = this._offset;
    this._rotation = (this._xor128.random(-1, 1) * Math.PI) / 3;
    this._lines_num = this._xor128.random_int(50, 80);
    this._line_length = this._xor128.random(0.2, 1) * this._r;
    this._direction = this._xor128.random_bool() ? 1 : -1;

    this._line_angle = Math.PI / this._lines_num;
    this._omega = this._xor128.random(
      this._lines_num / 20,
      this._lines_num / 10,
    );
  }

  update(t) {
    this._t = this._wrap_t(t * this._direction * this._omega + this._offset);
  }

  _wrap_t(t) {
    while (t < 0) t += 1;
    return t % 1;
  }

  show(ctx) {
    // compute the actual width and height considering the rotation
    const line_width = ((Math.PI * this._r) / this._lines_num) * 0.5;

    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.rotate(this._t * Math.PI * 2);

    ctx.fillStyle = this._color.rgba;

    for (let i = 0; i < this._lines_num; i++) {
      const theta = (i / this._lines_num) * 2 * Math.PI;

      ctx.save();
      ctx.rotate(theta);
      ctx.translate(this._r - this._line_length, 0);
      ctx.rotate(-Math.PI / 2 + this._rotation);
      ctx.fillRect(0, 0, line_width, this._line_length);

      ctx.restore();
    }

    ctx.restore();
  }
}

export { Circle };
