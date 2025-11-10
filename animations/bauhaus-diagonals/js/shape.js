import { XOR128 } from "./xor128.js";

class Shape {
  constructor(x, y, size, scl, seed, colors) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._scl = scl;
    this._seed = seed;
    this._colors = colors;

    this._xor128 = new XOR128(this._seed);
  }

  show(ctx) {
    const draw_functions = [
      this._drawCircle,
      this._drawSquare,
      this._drawSemiCircle,
      this._drawTriangle,
    ];
    const color_dir = this._xor128.pick([-1, 1]);
    const color_i = this._wrap(
      this._x + this._y * color_dir,
      0,
      this._colors.length
    );
    const color = this._colors[color_i];

    ctx.save();
    ctx.translate(this._x * this._size, this._y * this._size);
    ctx.scale(this._scl, this._scl);

    ctx.fillStyle = color.rgba;
    this._xor128.pick(draw_functions).bind(this)(ctx);

    ctx.restore();
  }

  _drawCircle(ctx) {
    ctx.translate(this._size / 2, this._size / 2);
    ctx.beginPath();
    ctx.arc(0, 0, this._size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawSemiCircle(ctx) {
    ctx.translate(0, this._size / 2);
    ctx.beginPath();
    ctx.arc(0, 0, this._size / 2, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(0, 0);
    ctx.fill();
  }

  _drawSquare(ctx) {
    ctx.fillRect(0, 0, this._size / 2, this._size);
  }

  _drawTriangle(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this._size, 0);
    ctx.lineTo(0, this._size);
    ctx.closePath();
    ctx.fill();
  }

  _wrap(x, min, max) {
    while (x < min) x += max - min;
    while (x >= max) x -= max - min;
    return x;
  }
}

export { Shape };
