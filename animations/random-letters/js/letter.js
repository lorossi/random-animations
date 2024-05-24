import { Point } from "./engine.js";

class Symbol {
  constructor(seed, cols) {
    this.lines = [];
    this.cols = cols;
    this.seed = seed;

    const bits = seed
      .toString(2)
      .split("")
      .map((x) => parseInt(x));

    // horizontal
    for (let y = 0; y < cols + 1; y++) {
      for (let x = 0; x < cols; x++) {
        const i = x + y * cols;
        if (!bits[i]) continue;
        this.lines.push([new Point(x, y), new Point(x + 1, y)]);
      }
    }

    // vertical
    for (let x = 0; x < cols + 1; x++) {
      for (let y = 0; y < cols; y++) {
        const i = y + x * cols + (cols * cols + 1);
        if (!bits[i]) continue;
        this.lines.push([new Point(x, y), new Point(x, y + 1)]);
      }
    }

    // bottom-left to upper-right diagonal
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < cols; y++) {
        const i = x + y * cols + 2 * (cols * cols + 1);
        if (!bits[i]) continue;
        this.lines.push([new Point(x, y + 1), new Point(x + 1, y)]);
      }
    }

    // top-left to bottom-right diagonal
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < cols; y++) {
        const i = x + y * cols + 3 * cols * cols + 2;
        if (!bits[i]) continue;
        this.lines.push([new Point(x, y), new Point(x + 1, y + 1)]);
      }
    }
  }

  static Empty(cols) {
    return new Symbol(0, cols);
  }

  get parameters() {
    return 4 * this.cols * this.cols + 2;
  }

  show(ctx) {
    ctx.save();
    ctx.strokeStyle = "black";

    this.lines.forEach((l) => {
      ctx.beginPath();
      ctx.moveTo(l[0].x, l[0].y);
      ctx.lineTo(l[1].x, l[1].y);
      ctx.stroke();
    });
    ctx.restore();
  }
}

class Letter extends Symbol {
  constructor(x, y, size, scl, seed, cols = 3) {
    super(seed, cols);

    this._y = y;
    this._x = x;
    this._size = size;
    this._scl = scl;
  }

  show(ctx) {
    ctx.save();
    ctx.strokeStyle = "black";
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl, this._scl);
    ctx.translate(-this._size / 2, -this._size / 2);

    this.lines.forEach((l) => {
      ctx.beginPath();
      ctx.moveTo(
        (l[0].x * this._size) / this.cols,
        (l[0].y * this._size) / this.cols
      );
      ctx.lineTo(
        (l[1].x * this._size) / this.cols,
        (l[1].y * this._size) / this.cols
      );
      ctx.stroke();
    });
    ctx.restore();
  }
}

export { Letter, Symbol };
