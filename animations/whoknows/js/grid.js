import { Color, SimplexNoise, XOR128 } from "./lib.js";

class Grid {
  constructor(cols, size, grid_options) {
    this._cols = cols;
    this._size = size;

    this._cells = this._generateGrid(grid_options);
  }

  _generateGrid(options) {
    const xor128 = new XOR128(options.seed);
    const noise = new SimplexNoise(xor128.random_int(1e6));

    let disruption_scl = options.disruption_scl.map((s) => s);
    let noise_scl = options.noise_scl.map((s) => s);

    if (xor128.random_bool()) noise_scl = noise_scl.reverse();
    if (xor128.random_bool()) disruption_scl = disruption_scl.reverse();

    let cells = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      const n1 = noise.noise(
        x * disruption_scl[0],
        y * disruption_scl[1],

        1000,
      );

      let color;
      let disrupted = false;

      if ((n1 + 1) / 2 < options.distruption_threshold) {
        const i = (x + y) % options.disruption_palette.length;
        color = options.disruption_palette.getColor(i);
        disrupted = true;
      } else {
        const n2 = noise.noise(x * noise_scl[0], y * noise_scl[1], 2000);

        const t2 = Math.floor(options.palette.length * ((n2 + 1) / 2));
        color = options.palette.getColor(t2);
      }

      return {
        color,
        disrupted,
        swapped: false,
      };
    });

    // shuffle some cells
    const to_shuffle = cells.length * options.shuffle_chance;

    for (let i = 0; i < to_shuffle; i++) {
      const a = xor128.random_int(cells.length);
      const ca = cells[a];
      if (ca.disrupted || ca.swapped) continue;

      // extract coordinates
      const x = a % this._cols;
      const y = Math.floor(a / this._cols);
      // pick another cell that's not too far
      const r = xor128.random_int(options.shuffle_radius);
      const angle = xor128.random(2 * Math.PI);
      const dx = Math.floor(r * Math.cos(angle));
      const dy = Math.floor(r * Math.sin(angle));

      const nx = Math.min(Math.max(x + dx, 0), this._cols - 1);
      const ny = Math.min(Math.max(y + dy, 0), this._cols - 1);
      const b = nx + ny * this._cols;
      const cb = cells[b];
      if (cb.disrupted || cb.swapped) continue;

      // swap colors
      cells[a].color = cb.color;
      cells[b].color = ca.color;
      cells[a].swapped = true;
      cells[b].swapped = true;
    }

    return cells;
  }

  draw(ctx) {
    // fill the cells with colors from the palette based on noise
    const cell_scl = Math.floor(this._size / this._cols);
    ctx.save();
    ctx.translate(this._x, this._y);

    this._cells.forEach((cell, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      ctx.save();
      ctx.translate(x * cell_scl, y * cell_scl);
      ctx.fillStyle = cell.color.rgb;
      ctx.fillRect(0, 0, cell_scl, cell_scl);
      ctx.restore();
    });
    ctx.restore();
  }

  getDominantColor() {
    const color_count = new Map();

    this._cells.forEach((cell) => {
      if (cell.disrupted) return;

      const key = cell.color.hex;
      if (!color_count.has(key)) {
        color_count.set(key, 0);
      }
      color_count.set(key, color_count.get(key) + 1);
    });

    let dominant_color = null;
    let max_count = 0;

    for (const [key, count] of color_count.entries()) {
      if (count > max_count) {
        max_count = count;
        dominant_color = key;
      }
    }

    return Color.fromHex(dominant_color);
  }

  getColor(x, y) {
    const index = x + y * this._cols;
    return this._cells[index].color;
  }
}

export { Grid };
