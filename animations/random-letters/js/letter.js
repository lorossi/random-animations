import { Point } from "./lib.js";

class Symbol {
  constructor(seed, cols, color) {
    this._cols = cols;
    this._seed = seed;
    this._color = color;

    this._lines = [];

    const bits = seed
      .toString(2)
      .split("")
      .map((x) => parseInt(x));

    // horizontal
    for (let y = 0; y < this._cols + 1; y++) {
      for (let x = 0; x < this._cols; x++) {
        const i = x + y * this._cols;
        if (!bits[i]) continue;
        this._lines.push([new Point(x, y), new Point(x + 1, y)]);
      }
    }

    // vertical
    for (let x = 0; x < this._cols + 1; x++) {
      for (let y = 0; y < this._cols; y++) {
        const i = y + x * this._cols + (this._cols * this._cols + 1);
        if (!bits[i]) continue;
        this._lines.push([new Point(x, y), new Point(x, y + 1)]);
      }
    }

    // bottom-left to upper-right diagonal
    for (let x = 0; x < this._cols; x++) {
      for (let y = 0; y < this._cols; y++) {
        const i = x + y * this._cols + 2 * (this._cols * this._cols + 1);
        if (!bits[i]) continue;
        this._lines.push([new Point(x, y + 1), new Point(x + 1, y)]);
      }
    }

    // top-left to bottom-right diagonal
    for (let x = 0; x < this._cols; x++) {
      for (let y = 0; y < this._cols; y++) {
        const i = x + y * this._cols + 3 * this._cols * this._cols + 2;
        if (!bits[i]) continue;
        this._lines.push([new Point(x, y), new Point(x + 1, y + 1)]);
      }
    }
  }

  static Empty(cols) {
    return new Symbol(0, cols);
  }

  get parameters() {
    return 4 * this._cols * this._cols + 2;
  }

  show(ctx) {
    ctx.save();
    ctx.strokeStyle = this._color.rgba;

    this._lines.forEach((l) => {
      ctx.beginPath();
      ctx.moveTo(l[0].x, l[0].y);
      ctx.lineTo(l[1].x, l[1].y);
      ctx.stroke();
    });
    ctx.restore();
  }
}

class Letter extends Symbol {
  constructor(x, y, size, scl, seed, color, cols = 3) {
    super(seed, color, cols);

    this._y = y;
    this._x = x;
    this._size = size;
    this._scl = scl;
  }

  show(ctx) {
    ctx.save();
    ctx.strokeStyle = this._color.rgba;
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl, this._scl);
    ctx.translate(-this._size / 2, -this._size / 2);

    this._lines.forEach((l) => {
      ctx.beginPath();
      ctx.moveTo(
        (l[0].x * this._size) / this._cols,
        (l[0].y * this._size) / this._cols,
      );
      ctx.lineTo(
        (l[1].x * this._size) / this._cols,
        (l[1].y * this._size) / this._cols,
      );
      ctx.stroke();
    });
    ctx.restore();
  }
}

export { Letter, Symbol };
