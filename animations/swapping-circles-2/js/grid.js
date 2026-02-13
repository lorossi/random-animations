import { XOR128, SimplexNoise, Utils, Point } from "./lib.js";

class Grid {
  constructor(slots, seed, max_tries, noise_scl = 0.001) {
    this._slots = slots;
    this._seed = seed;
    this._max_tries = max_tries;
    this._noise_scl = noise_scl;

    this._init();
  }

  _init() {
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._start_pos = 0;
    this._cells = new Array(this._slots ** 2).fill(false);
    this._costs = new Array(this._slots ** 2).fill().map((_, i) => {
      const [x, y] = Utils.i_to_xy(i, this._slots);
      const n = this._noise.noise(
        (y / this._slots) * this._noise_scl,
        (x / this._slots) * this._noise_scl,
        1000,
      );
      return (n + 1) / 2; // normalize to [0, 1]
    });

    this._ended = false;

    this._dxy = [
      new Point(0, 1),
      new Point(1, 0),
      new Point(0, -1),
      new Point(-1, 0),
    ];

    const start_i = this._start_pos;
    this._path = [start_i];
    this._cells[start_i] = true;
    this._queue = [this._get_neighbours(start_i)];
    this._steps_count = 0;
  }

  _backtrack() {
    if (this._queue.length === 0) return;
    if (this._path.length === 0) return;

    this._queue.pop();
    const last_i = this._path.pop();
    this._cells[last_i] = false;
  }

  _get_neighbours(i) {
    const p = Utils.i_to_point(i, this._slots);

    const neighbours = [];
    for (const d of this._dxy) {
      const np = p.add(d);
      if (np.x >= this._slots || np.x < 0) continue;
      if (np.y >= this._slots || np.y < 0) continue;

      const ni = Utils.point_to_i(np, this._slots);
      if (this._cells[ni]) continue;

      neighbours.push({ n: ni, cost: this._costs[ni] });
    }

    return neighbours.sort((a, b) => a.cost - b.cost).map((n) => n.n);
  }

  _is_neighbour(i1, i2) {
    const p1 = Utils.i_to_point(i1, this._slots);
    const p2 = Utils.i_to_point(i2, this._slots);
    const dx = Math.abs(p1.x - p2.x);
    const dy = Math.abs(p1.y - p2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  _bfs(start) {
    const target = this._path[0];

    const visited = new Array(this._slots ** 2).fill(false);
    const queue = [start];
    visited[start] = true;

    let target_reachable = false;

    while (queue.length > 0) {
      const current = queue.shift();
      if (this._is_neighbour(current, target)) {
        target_reachable = true;
      }

      const p = Utils.i_to_point(current, this._slots);
      for (const d of this._dxy) {
        const np = p.add(d);
        if (np.x >= this._slots || np.x < 0 || np.y >= this._slots || np.y < 0)
          continue;
        const ni = Utils.point_to_i(np, this._slots);

        if (visited[ni] || (this._cells[ni] && ni !== target)) continue;

        visited[ni] = true;
        queue.push(ni);
      }
    }

    if (!target_reachable) return false;

    // check if all the unvisited cells are reachable
    for (let i = 0; i < this._cells.length; i++) {
      if (!this._cells[i] && !visited[i]) {
        return false;
      }
    }

    return true;
  }

  solve() {
    while (!this._ended) this.step();
  }

  step() {
    if (this._ended) {
      return;
    }

    this._steps_count++;

    if (this._steps_count > this._max_tries) {
      console.log("Too many tries, restarting with a new seed");
      this._seed++;
      this._init();
    }

    // check if the target is still reachable if we move to the neighbour
    const current_i = this._path[this._path.length - 1];

    // check if we can end the path
    if (
      this._is_neighbour(current_i, this._path[0]) &&
      this._path.length === this._slots * this._slots
    ) {
      this._ended = true;
      console.log(
        "Solved grid with seed",
        this._seed,
        "steps:",
        this._steps_count,
      );
      return;
    }

    if (!this._bfs(current_i)) {
      this._backtrack();
      return;
    }

    const current_neighbours = this._queue[this._queue.length - 1];
    if (current_neighbours.length === 0) {
      this._backtrack();
      return;
    }

    // move to the neighbour
    const next_i = current_neighbours.pop();
    this._cells[next_i] = true;
    this._path.push(next_i);
    this._queue.push(this._get_neighbours(next_i));
  }

  show(ctx) {
    const cell_size = ctx.canvas.width / this._slots;

    ctx.save();
    ctx.fillStyle = "black";
    for (const p of this._path) {
      const point = Utils.i_to_point(p, this._slots);
      ctx.fillRect(
        point.x * cell_size,
        point.y * cell_size,
        cell_size,
        cell_size,
      );
    }
    ctx.restore();
  }

  get ended() {
    return this._ended;
  }

  get path() {
    return this._path;
  }

  get path_points() {
    return this._path.map((p) => {
      const point = Utils.i_to_point(p, this._slots);
      return new Point(point.x, point.y);
    });
  }

  rotate_path() {
    const first = this._path.shift();
    this._path.push(first);
  }
}

export { Grid };
