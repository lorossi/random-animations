import { Cell } from "./cell.js";

class Grid {
  constructor(rows, cols, size, palette, seed, cell_scl) {
    this._rows = rows;
    this._cols = cols;
    this._size = size;
    this._palette = palette;
    this._seed = seed;
    this._cell_scl = cell_scl;
  }

  update() {
    const cell_w = this._size / this._cols;
    const cell_h = this._size / this._rows;
    this._cells = new Array(this._rows * this._cols).fill(null).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);
      const cell_seed = this._seed + i;
      return new Cell(
        x * cell_w,
        y * cell_h,
        cell_w,
        cell_h,
        this._palette,
        cell_seed,
        this._cell_scl
      );
    });
  }

  show(ctx) {
    this._cells.forEach((cell) => cell.show(ctx));
  }
}

export { Grid };
