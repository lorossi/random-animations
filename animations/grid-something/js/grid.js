import { Point } from "./engine.js";
import { Walker } from "./walker.js";

class Grid {
  constructor(size, cols, walkers_num, color, palette, xor128) {
    this._size = size;
    this._cols = cols;
    this._color = color;
    this._palette = palette;
    this._xor128 = xor128;

    this._walkers = new Array(walkers_num).fill(null).map(() => {
      const start = new Point(
        this._xor128.random_int(1, this._cols),
        this._xor128.random_int(1, this._cols)
      );

      return new Walker(this._cols, start, this._palette, this._xor128);
    });
  }

  update() {}

  show(ctx) {
    const scl = this._size / this._cols;

    ctx.save();
    ctx.strokeStyle = this._color.rgba;
    ctx.lineWidth = 2;

    for (let i = 0; i <= this._cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * scl, 0);
      ctx.lineTo(i * scl, this._size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * scl);
      ctx.lineTo(this._size, i * scl);
      ctx.stroke();
    }

    // draw walkers
    ctx.save();
    this._walkers.forEach((w) => w.showTrails(ctx, scl));
    this._walkers.forEach((w) => w.showPoints(ctx, scl));
    ctx.restore();

    ctx.restore();
  }

  get cols() {
    return this._cols;
  }
}

export { Grid };
