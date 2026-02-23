import { SimplexNoise, XOR128, Utils } from "./lib.js";

class Grid {
  constructor(size, cols, rows, seed, palette) {
    this._size = size;
    this._cols = cols;
    this._rows = rows;
    this._seed = seed;
    this._palette = palette;

    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(2e32));

    this._noise_scl = 0.0025;
    this._grid_scl = 0.5;

    this._column_widths = new Array(cols).fill(0);
    this._row_heights = new Array(rows).fill(0);
  }

  _generate_size_array(length, total_size, tx, ty, seed) {
    let widths = new Array(length).fill(0).map((_, i) => {
      const n = this._noise.noise(i * this._grid_scl, tx, ty, seed);
      return Utils.remap(n, -1, 1, 0.1, 1);
    });

    const sum = widths.reduce((a, b) => a + b, 0);
    return widths.map((w) => (w / sum) * total_size);
  }

  update(tx, ty) {
    this._column_widths = this._generate_size_array(
      this._cols,
      this._size,
      tx,
      ty,
      2000,
    );
    this._row_heights = this._generate_size_array(
      this._rows,
      this._size,
      tx,
      ty,
      3000,
    );
  }

  show(ctx) {
    ctx.save();

    let x = 0;
    for (let i = 0; i < this._cols; i++) {
      let y = 0;
      for (let j = 0; j < this._rows; j++) {
        const n = this._noise.noise(
          x * this._noise_scl,
          y * this._noise_scl,
          1000,
        );
        const k = Utils.remap(n, -1, 1, 0, 1);
        const c = this._palette.getSmoothColor(k, Utils.ease_in_out_exp);

        ctx.fillStyle = c.rgba;
        ctx.strokeStyle = c.rgba;

        ctx.beginPath();
        ctx.rect(x, y, this._column_widths[i], this._row_heights[j]);
        ctx.fill();
        ctx.stroke();

        y += this._row_heights[j];
      }
      x += this._column_widths[i];
    }

    ctx.restore();
  }
}

export { Grid };
