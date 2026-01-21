import { Color } from "./lib.js";

class Square {
  constructor(x, y, size, color, theta) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._color = color;
    this._theta = theta;
  }

  show(ctx) {
    ctx.save();
    ctx.fillStyle = this._color.rgba;

    ctx.translate(this._x, this._y);
    ctx.rotate(this._theta);

    ctx.beginPath();
    ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

class Layer {
  constructor(size, squares_num = 25) {
    this._size = size;
    this._squares = new Array(squares_num).fill();

    this._fg_color = Color.fromCSS("red");
    this._xor128 = null;
  }

  update() {
    if (this._xor128 == null) return;
    const base_hue = this._fg_color.h;
    const base_sat = this._fg_color.s;

    for (let i = 0; i < this._squares.length; i++) {
      const x = this._xor128.random(this._size);
      const y = this._xor128.random(this._size);
      const theta = this._xor128.random(Math.PI * 2);
      const d_hue = this._xor128.random_interval(0, 32);
      const d_sat = this._xor128.random_interval(-10, 10);

      const size = this._xor128.random(1 / 20, 1 / 5) * this._size;

      const hue = this._wrapHue(d_hue + base_hue);
      const sat = this._clampSat(d_sat + base_sat);
      const color = Color.fromHSL(hue, sat, 50, 0.8);

      const square = new Square(x, y, size, color, theta);
      this._squares[i] = square;
    }
  }

  show(ctx) {
    if (this._squares.some((s) => s == null)) return;
    ctx.save();

    // clip the layer to prevent triangles from overflowing
    ctx.beginPath();
    ctx.rect(0, 0, this._size, this._size);
    ctx.clip();

    ctx.fillStyle = this._fg_color.rgba;
    ctx.fillRect(0, 0, this._size, this._size);

    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(this._size / 2, this._size / 2);
      ctx.rotate((i * Math.PI) / 2);
      ctx.translate(-this._size / 2, -this._size / 2);
      this._squares.forEach((square) => square.show(ctx));
      ctx.restore();
    }

    ctx.restore();
  }

  setFGColor(color) {
    this._fg_color = color;
  }

  setXOR128(xor128) {
    this._xor128 = xor128;
  }

  setSquares(squares) {
    this._squares = squares;
  }

  _wrapHue(h) {
    while (h < 0) h += 360;
    while (h >= 360) h -= 360;
    return h;
  }

  _clampSat(s) {
    return Math.min(100, Math.max(0, s));
  }
}

export { Layer, Square };
