import { XOR128 } from "./lib.js";
import { Hexagon } from "./hexagon.js";

class Grid {
  constructor(size, cols, seed, size_delta = 25) {
    this._size = size;
    this._cols = cols;

    this._seed = seed;
    this._setupRandom();

    const scl = this._size / this._cols;

    this._hexagons = [];
    for (let x = 0; x < this._cols; x++) {
      const current_cols = x % 2 === 0 ? this._cols : this._cols - 1;
      for (let y = 0; y < current_cols; y++) {
        const dy = x % 2 === 0 ? 0 : 0.5;
        const hx = (x + 0.5) * scl;
        const hy = (y + 0.5 + dy) * scl;
        const seed = this._xor128.random_int(1e16);

        const h = new Hexagon(hx, hy, scl, size_delta, seed);
        this._hexagons.push(h);
      }
    }
  }

  setSeed(seed) {
    this._seed = seed;
    this._setupRandom();
  }

  update(t) {
    this._hexagons.forEach((hexagon) => hexagon.update(t));
  }

  show(ctx) {
    ctx.save();
    this._hexagons.forEach((hexagon) => hexagon.show(ctx));
    ctx.restore();
  }

  _setupRandom() {
    this._xor128 = new XOR128(this._seed);
  }
}

export { Grid };
