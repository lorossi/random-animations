/**
 * Gray-Scott reaction-diffusion running on an arbitrary neighbor graph
 * instead of a square grid, so cell shapes/adjacency are irregular.
 * Two chemicals U and V; V catalytically converts U into more V (feed),
 * and V decays (kill). Different feed/kill pairs give spots, stripes,
 * mazes or coral-like growth.
 */
class Automaton {
  /**
   * @param {Array<Array<number>>} neighbors adjacency list by site index
   * @param {XOR128} rand seeded random source
   * @param {object} [params]
   */
  constructor(neighbors, rand, params = {}) {
    this._neighbors = neighbors;
    this._n = neighbors.length;

    this._diffusion_u = params.diffusion_u ?? 0.16;
    this._diffusion_v = params.diffusion_v ?? 0.08;
    this._feed = params.feed ?? 0.037;
    this._kill = params.kill ?? 0.06;
    this._dt = params.dt ?? 1;

    this._u = new Float32Array(this._n).fill(1);
    this._v = new Float32Array(this._n).fill(0);

    // seed a handful of random blobs of V to kick off the reaction
    const seeds = Math.max(3, Math.floor(this._n / 80));
    for (let s = 0; s < seeds; s++) {
      const start = rand.random_int(this._n);
      this._seedBlob(start);
    }
  }

  _seedBlob(start) {
    const visited = new Set([start]);
    const queue = [start];
    this._v[start] = 1;

    // spread the seed a couple hops so it's wider than a single cell
    let hops = 0;
    while (queue.length > 0 && hops < 200) {
      const curr = queue.shift();
      for (const nb of this._neighbors[curr]) {
        if (!visited.has(nb)) {
          visited.add(nb);
          this._v[nb] = 1;
          queue.push(nb);
        }
      }
      hops++;
      if (visited.size > 6) break;
    }
  }

  step() {
    const next_u = new Float32Array(this._n);
    const next_v = new Float32Array(this._n);

    for (let i = 0; i < this._n; i++) {
      const nbs = this._neighbors[i];
      const deg = nbs.length || 1;

      let lap_u = -this._u[i] * deg;
      let lap_v = -this._v[i] * deg;
      for (const nb of nbs) {
        lap_u += this._u[nb];
        lap_v += this._v[nb];
      }
      // normalize by degree so irregular connectivity doesn't bias diffusion speed
      lap_u /= deg;
      lap_v /= deg;

      const u = this._u[i];
      const v = this._v[i];
      const reaction = u * v * v;

      next_u[i] =
        u +
        (this._diffusion_u * lap_u - reaction + this._feed * (1 - u)) *
          this._dt;
      next_v[i] =
        v +
        (this._diffusion_v * lap_v + reaction - (this._kill + this._feed) * v) *
          this._dt;
    }

    this._u = next_u;
    this._v = next_v;
  }

  get u() {
    return this._u;
  }

  get v() {
    return this._v;
  }

  draw(ctx, cells, low_color, high_color) {
    for (let i = 0; i < cells.length; i++) {
      const polygon = cells[i];
      if (polygon.length < 3) continue;

      const t = Math.min(1, Math.max(0, this._v[i] * 1.6));
      const color = low_color.mix(high_color, t);

      ctx.beginPath();
      ctx.moveTo(polygon[0].x, polygon[0].y);
      for (let p = 1; p < polygon.length; p++) {
        ctx.lineTo(polygon[p].x, polygon[p].y);
      }
      ctx.closePath();

      ctx.fillStyle = color.rgba;
      ctx.strokeStyle = color.rgba;
      ctx.fill();
      ctx.stroke();
    }
  }
}

export { Automaton };
