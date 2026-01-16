import { Cell } from "./cell.js";
import { SimplexNoise, XOR128 } from "./lib.js";

class Grid {
  constructor(size, cols, seed, palette) {
    this._size = size;
    this._cols = cols;
    this._cell_size = this._size / this._cols;
    this._seed = seed;
    this._palette = palette;

    this._noise = new SimplexNoise(this._seed);
    this._noise_rho = 1;
    this._noise_scl = 0.05;

    this._xor128 = new XOR128(this._seed);
    this._seeds = new Array(this._cols * this._cols)
      .fill(null)
      .map(() => this._xor128.random_interval(0, 5 * this._noise_scl));

    this._cells = new Array(this._cols * this._cols).fill(null).map((_, i) => {
      const x = (i % this._cols) * this._cell_size;
      const y = Math.floor(i / this._cols) * this._cell_size;
      return new Cell(x, y, this._cell_size, this._palette);
    });
  }

  update(t) {
    const theta = Math.PI * 2 * t;
    const nx = (1 + Math.cos(theta)) * this._noise_rho;
    const ny = (1 + Math.sin(theta)) * this._noise_rho;

    this._cells.forEach((cell, i) => {
      const x = (i % this._cols) * this._noise_scl;
      const y = Math.floor(i / this._cols) * this._noise_scl;
      const n = this._noise.noise(
        nx,
        ny,
        x + this._seeds[i],
        y + this._seeds[i]
      );
      cell.update(n);
    });
  }

  show(ctx) {
    ctx.save();
    this._cells.forEach((cell) => cell.show(ctx));
    ctx.restore();
  }
}

export { Grid };
