import { Color } from "./engine.js";
import { Potato } from "./potato.js";
import { XOR128 } from "./xor128.js";

class Grid {
  constructor(x, y, cols, rows, hole_r) {
    this._x = x;
    this._y = y;
    this._cols = cols;
    this._rows = rows;
    this._hole_r = hole_r;
  }

  setFillColor(color) {
    this._fill_c = color;
  }

  setRandom(random_seed) {
    this._random_seed = random_seed;
    this._xor128 = new XOR128(this._random_seed);
  }

  show(ctx) {
    const w = this._cols * this._hole_r;
    const h = this._rows * this._hole_r;
    const r = this._hole_r;

    ctx.save();
    ctx.translate(this._x - w / 2, this._y - h / 2);
    ctx.fillStyle = this._fill_c.rgba;

    for (let i = 0; i < this._cols; i++) {
      for (let j = 0; j < this._rows; j++) {
        const x = (i + 0.5) * w;
        const y = (j + 0.5) * h;

        const seed = this._xor128.random_int(1e16);
        const p = new Potato(x, y, r, seed);

        ctx.save();
        p.show(ctx);
        ctx.restore();
      }
    }

    ctx.restore();
  }
}

export { Grid };
