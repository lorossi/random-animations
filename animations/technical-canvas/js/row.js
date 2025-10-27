import { Color, SimplexNoise } from "./engine.js";
import { XOR128 } from "./xor128.js";

class Row {
  constructor(y, width, height, seed, color) {
    this._y = y;
    this._width = width;
    this._height = height;
    this._seed = seed;
    this._color = color;

    this._xor128 = new XOR128(this._seed);
    const noise_seed = this._xor128.random_int(1e3);
    this._noise = new SimplexNoise(noise_seed);

    this._generateCols();
  }

  _generateCols() {
    this._col_num = this._xor128.random_int(1, 4);
    this._cols_width = new Array(this._col_num).fill(0).map(() => {
      return this._xor128.random_int(5, 20);
    });
    const columns_sum = this._cols_width.reduce((a, b) => a + b, 0);
    this._cols_width = this._cols_width.map(
      (w) => (w / columns_sum) * this._width
    );
    this._cols_x = [0];
    for (let i = 1; i < this._col_num; i++) {
      this._cols_x[i] = this._cols_x[i - 1] + this._cols_width[i - 1];
    }

    this._cols = new Array(this._col_num).fill(0).map((_, i) => {
      const spacing = this._xor128.random_int(5, 20);
      const line_width = this._xor128.random_int(3, 5);
      const offset_x = this._xor128.random_interval(0, line_width * 3);
      const offset_y = this._xor128.random_interval(0, line_width * 3);
      const offset_h = this._xor128.random_interval(0, this._height / 10);
      const rotation =
        this._xor128.random_interval(0, Math.PI / 240) +
        this._xor128.random_int(0, 4) * (Math.PI / 2);
      const fade = this._xor128.random(0.9, 1);
      const color_copy = this._color.copy();
      color_copy.lighten(fade);

      const col = new Col(
        this._cols_x[i] + offset_x,
        this._y + offset_y,
        this._cols_width[i],
        this._height + offset_h,
        spacing,
        line_width,
        rotation,
        color_copy
      );

      const n = this._noise.noise(this._y * 0.01, this._cols_x[i] * 0.01);
      if (n < 0) col.setEmpty();
      else if (n > 0.65) col.setFull();

      return col;
    });
  }

  show(ctx) {
    ctx.save();
    this._cols.forEach((col) => col.show(ctx));
    ctx.restore();
  }
}

class Col {
  constructor(x, y, width, height, spacing, line_width, rotation, color) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._spacing = spacing;
    this._line_width = line_width;
    this._rotation = rotation;
    this._color = color;

    this._empty = false;
    this._full = false;
  }

  setEmpty() {
    this._empty = true;
  }

  setFull() {
    this._full = true;
  }

  show(ctx) {
    if (this._empty) return;

    if (this._full) this._drawRect(ctx);
    else this._drawLines(ctx);
  }
  _drawRect(ctx) {
    ctx.save();
    ctx.fillStyle = this._color.rgba;
    ctx.fillRect(this._x, this._y, this._width, this._height);
    ctx.restore();
  }

  _drawLines(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.rotate(this._rotation);
    ctx.strokeStyle = this._color.rgba;
    ctx.lineWidth = this._line_width;

    for (let i = 0; i < this._width; i += this._spacing) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, this._height);
      ctx.stroke();
    }

    ctx.restore();
  }
}

export { Row };
