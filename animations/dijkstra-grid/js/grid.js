import { Color, SimplexNoise } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette } from "./palette-factory.js";

const DESTINATION_COST = 1e9; // high cost to prevent pathing through destinations

class Grid {
  constructor(size, rows) {
    this._size = size;
    this._rows = rows;
    this._destinations = [];

    this._fg_color = Color.fromMonochrome(15);
    this._destination_palette = Palette.fromArrayHEX(["#FF0000", "#00FF00"]);
    this._source = 0;
    this._noise_scale = 0.1;
    this._noise_amplitude = 1;
    this._destination_scl = 0.5;

    const seed = new Date().getTime();
    this.setSeed(seed);
  }

  setSeed(seed) {
    this._seed = seed;
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e6));
  }

  setNoiseDetails(scl, amplitude) {
    this._noise_scale = scl;
    this._noise_amplitude = amplitude;
  }

  addDestination(x, y) {
    const destination_i = this._xyToIndex(x, y);
    this._destinations.push(destination_i);
  }

  hasDestination(x, y) {
    return this._destinations.includes(this._xyToIndex(x, y));
  }

  setSource(x, y) {
    const source_i = this._xyToIndex(x, y);
    this._source = source_i;
  }

  setFgColor(color) {
    this._fg_color = color;
  }

  setDestinationPalette(palette) {
    this._destination_palette = palette;
  }

  _xyToIndex(x, y) {
    return x + y * this._rows;
  }

  _indexToXY(index) {
    return [index % this._rows, Math.floor(index / this._rows)];
  }

  _resetArrays(rows) {
    this._dist = new Array(rows * rows).fill(Infinity);
    this._prev = new Array(rows * rows).fill(null);
    this._queue = new Array(rows * rows).fill(null).map((_, i) => i);
    this._costs = new Array(rows * rows).fill(0).map((_, i) => {
      if (this._destinations.includes(i)) return DESTINATION_COST;
      const [x, y] = this._indexToXY(i);
      const n = this._noise.noise(x * this._noise_scale, y * this._noise_scale);
      return (n + 1) * 0.5 * this._noise_amplitude;
    });
    this._drawn_path = new Array(rows * rows).fill(new Array());
  }

  _findClosestInQueue(Q) {
    let min = Infinity;
    let min_i = -1;

    for (let i = 0; i < Q.length; i++) {
      const v = Q[i];
      const d = this._dist[v];
      if (d < min) {
        min = d;
        min_i = v;
      }
    }

    return min_i;
  }

  _findNeighborsInQueue(i, Q) {
    const [x, y] = this._indexToXY(i);
    let neighbors = [];

    for (const dx of [-1, 1]) {
      if (x + dx < 0 || x + dx >= this._rows) continue;

      const n_index = this._xyToIndex(x + dx, y);
      if (Q.includes(n_index)) neighbors.push(n_index);
    }

    for (const dy of [-1, 1]) {
      if (y + dy < 0 || y + dy >= this._rows) continue;

      const n_index = this._xyToIndex(x, y + dy);
      if (Q.includes(n_index)) neighbors.push(n_index);
    }

    return neighbors;
  }

  _buildPath(destination) {
    let S = [];
    let u = destination;
    if (this._prev[u] != null || u === this._source) {
      while (u != null) {
        S.push(u);
        u = this._prev[u];
      }
    }
    return S.reverse();
  }

  update() {
    // meant to be called only once
    // will work to make this animated and thus called in in loop
    this._resetArrays(this._rows);

    this._dist[this._source] = 0;

    while (this._queue.length > 0) {
      // extract the closed
      const u_index = this._findClosestInQueue(this._queue);
      // remove from queue
      this._queue = this._queue.filter((u) => u !== u_index);
      // find neighbors
      const n_indexes = this._findNeighborsInQueue(u_index, this._queue);
      for (const n_index of n_indexes) {
        const alt = this._dist[u_index] + this._costs[n_index];
        if (alt < this._dist[n_index]) {
          this._dist[n_index] = alt;
          this._prev[n_index] = u_index;
        }
      }
    }
  }

  show(ctx) {
    ctx.save();
    // draw path from destinations to start
    this._destinations.forEach((d) => this._drawDestinationPath(ctx, d));
    this._destinations.forEach((d) => this._drawDestination(ctx, d));
    ctx.restore();
  }

  _drawDestinationPath(ctx, destination) {
    const scl = this._size / this._rows;
    const S = this._buildPath(destination);

    // draw path
    ctx.save();
    ctx.strokeStyle = this._fg_color.rgb;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < S.length - 1; i++) {
      const u = S[i];
      const v = S[i + 1];

      if (this._drawn_path[u].includes(v)) {
        continue;
      }

      this._drawn_path[u].push(v);

      const [vx, vy] = this._indexToXY(v);
      const [ux, uy] = this._indexToXY(u);

      ctx.moveTo((ux + 0.5) * scl, (uy + 0.5) * scl);
      ctx.lineTo((vx + 0.5) * scl, (vy + 0.5) * scl);
    }

    ctx.stroke();
    ctx.restore();
  }

  _drawDestination(ctx, destination) {
    const scl = this._size / this._rows;
    const [x, y] = this._indexToXY(destination);
    const functions = [this._drawRect.bind(this), this._drawCircle.bind(this)];

    // draw destination
    ctx.save();
    ctx.fillStyle = this._destination_palette.getRandomColor(this._xor128);
    ctx.translate((x + 0.5) * scl, (y + 0.5) * scl);
    ctx.scale(this._destination_scl, this._destination_scl);
    ctx.beginPath();
    this._xor128.pick(functions)(ctx, scl);
    ctx.fill();
    ctx.restore();
  }

  _drawRect(ctx, scl) {
    ctx.fillRect(-scl / 2, -scl / 2, scl, scl);
  }

  _drawCircle(ctx, scl) {
    ctx.beginPath();
    ctx.arc(0, 0, 0.5 * scl, 0, 2 * Math.PI);
    ctx.fill();
  }
}

export { Grid };
