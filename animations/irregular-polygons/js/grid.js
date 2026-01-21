import { Cell } from "./cell.js";
import { XOR128 } from "./lib.js";

class Grid {
  constructor(size, palette, cols, cell_scl, seed) {
    this._size = size;
    this._palette = palette;
    this._cols = cols;
    this._cell_scl = cell_scl;
    this._seed = seed;

    this._xor128 = new XOR128(this._seed);
    this._cell_size = this._size / this._cols;
    this._cells = new Array(this._cols * this._cols)
      .fill(null)
      .map(
        () =>
          new Cell(
            this._cell_size,
            this._palette,
            this._xor128.random_int(1e9),
          ),
      );
  }

  update() {
    this._cells.forEach((cell) => cell.update());
  }

  show(ctx) {
    ctx.save();
    this._cells.forEach((cell, i) => {
      const x = (i % this._cols) * this._cell_size + this._cell_size / 2;
      const y =
        Math.floor(i / this._cols) * this._cell_size + this._cell_size / 2;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(this._cell_scl, this._cell_scl);
      cell.show(ctx);
      ctx.restore();
    });

    ctx.restore();
  }
}

export { Grid };
