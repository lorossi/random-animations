import { XOR128 } from "./lib.js";

class Grid {
  constructor(cols, rows, cell_size, palette, seed) {
    this._cols = cols;
    this._rows = rows;
    this._cell_size = cell_size;
    this._palette = palette;
    this._seed = seed;

    this._xor128 = new XOR128(this._seed);

    this._states = new Array(cols).fill(null).map(() => this._xor128.random());

    this._lines = [];
    this._k = this._xor128.random(0.0005, 0.02);
    this._rotation = this._xor128.random_int(2) * Math.PI;

    this._init();
  }

  _indexToXY(i) {
    const x = i % this._cols;
    const y = Math.floor(i / this._cols);
    return [x, y];
  }

  _getNeighbors(x, row) {
    const neighbors = [];

    if (x > 0) neighbors.push(row[x - 1]);
    if (x < this._cols - 1) neighbors.push(row[x + 1]);

    return neighbors;
  }

  _init() {
    this._lines = [];
    let row = 0;
    let previous_row = this._states;

    while (row < this._rows) {
      const new_row = previous_row.map((state, x) => {
        const neighbors = this._getNeighbors(x, previous_row);

        return this._stateFunction(state, neighbors);
      });
      this._lines = this._lines.concat(new_row);

      previous_row = new_row;
      row += 1;
    }
  }

  _stateFunction(state, neighbors) {
    const avg =
      (neighbors.reduce((sum, state) => sum + state, 0) / neighbors.length) % 1;
    state * this._cols, state * this._rows;

    return ((avg % 1) + this._k) % 1;
  }

  draw(ctx) {
    const polyEaseInOut = (t, n = 2) => {
      if (t < 0.5) return 0.5 * Math.pow(2 * t, n);
      return 1 - 0.5 * Math.pow(2 * (1 - t), n);
    };

    const size_x = this._cols * this._cell_size;
    const size_y = this._rows * this._cell_size;

    ctx.save();
    ctx.translate(size_x / 2, size_y / 2);
    ctx.rotate(this._rotation);
    ctx.translate(-size_x / 2, -size_y / 2);

    this._lines.forEach((state, index) => {
      const [x, y] = this._indexToXY(index);
      const color = this._palette.getSmoothColor(state, polyEaseInOut);

      ctx.fillStyle = color.rgba;
      ctx.fillRect(
        x * this._cell_size,
        y * this._cell_size,
        this._cell_size,
        this._cell_size
      );
    });

    ctx.restore();
  }
}

export { Grid };
