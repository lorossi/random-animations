import { XOR128, SimplexNoise, Utils, Point } from "./lib.js";

class Grid {
  constructor(size, slots, seed, noise_scl, max_tries, color) {
    this._size = size;
    this._slots = slots;
    this._seed = seed;
    this._noise_scl = noise_scl;
    this._max_tries = max_tries;
    this._fg = color.copy();

    this._cell_size = this._size / this._slots;
    this._start = new Point(0, 0);

    this._init();
  }

  _get_neighbours(i) {
    const p = Utils.i_to_point(i, this._slots);

    const neighbors = [];
    for (const n of this._dxy) {
      const pn = p.add(n);
      if (pn.x >= this._slots || pn.x < 0) continue;
      if (pn.y >= this._slots || pn.y < 0) continue;

      const ni = Utils.point_to_i(pn, this._slots);
      if (this._cells[ni]) continue;

      neighbors.push({ n: ni, cost: this._costs[ni] });
    }

    return neighbors.sort((a, b) => a.cost - b.cost).map((o) => o.n);
  }

  _is_neighbor(a, b) {
    const [ax, ay] = Utils.i_to_xy(a, this._slots);
    const [bx, by] = Utils.i_to_xy(b, this._slots);
    const dx = Math.abs(ax - bx);
    const dy = Math.abs(ay - by);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  _init() {
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._cells = new Array(this._slots ** 2).fill(false);
    this._costs = new Array(this._slots ** 2).fill(0).map((_, i) => {
      const [x, y] = Utils.i_to_xy(i, this._slots);
      const nx = (x / this._slots) * this._noise_scl;
      const ny = (y / this._slots) * this._noise_scl;
      const n = this._noise.noise(nx, ny, 1000);
      return (n + 1) / 2;
    });

    this._t = 0;
    this._dxy = [
      new Point(0, -1),
      new Point(1, 0),
      new Point(0, 1),
      new Point(-1, 0),
    ];

    this._queue = [];
    this._neighbors = [];
    this._path = [];

    const start_i = Utils.point_to_i(this._start, this._slots);
    this._path = [start_i];
    this._cells[start_i] = false;
    this._queue = [this._get_neighbours(start_i)];
    this._steps_count = 0;
  }

  _backtrack() {
    this._queue.pop();
    const last_i = this._path.pop();
    this._cells[last_i] = false;
  }

  _bfs(start) {
    const target = this._path[0];

    const visited = new Array(this._slots ** 2).fill(false);
    const queue = [start];
    visited[start] = true;

    let target_reachable = false;

    while (queue.length > 0) {
      const current = queue.shift();
      if (this._is_neighbor(current, target)) {
        target_reachable = true;
      }

      const p = Utils.i_to_point(current, this._slots);
      for (const n of this._dxy) {
        const pn = p.add(n);
        if (pn.x >= this._slots || pn.x < 0) continue;
        if (pn.y >= this._slots || pn.y < 0) continue;
        const ni = Utils.point_to_i(pn, this._slots);

        if (visited[ni] || (this._cells[ni] && ni !== target)) continue;

        visited[ni] = true;
        queue.push(ni);
      }
    }

    if (!target_reachable) return false;

    // check if all unvisited cells are reachable
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
    this._steps_count++;

    if (this._ended) {
      return;
    }

    if (this._steps_count > this._max_tries) {
      // stupid heuristic to prevent infinite loops in unsolvable configurations
      console.log("Restarting grid with seed", this._seed + 1);
      this._seed++;
      this._init();
    }

    // check if the current path is still valid
    const current_i = this._path[this._path.length - 1];
    if (!this._bfs(current_i)) {
      this._backtrack();
      return;
    }

    // check if we can end the path
    const current_neighbors = this._queue[this._queue.length - 1];
    if (
      this._is_neighbor(current_i, this._path[0]) &&
      this._path.length === this._slots * this._slots
    ) {
      console.log(
        "Solved grid with seed",
        this._seed,
        "steps:",
        this._steps_count,
      );
      this._ended = true;
      // rotate the path randomly
      const rotate_by = this._xor128.random_int(this._path.length);
      this._path = [
        ...this._path.slice(rotate_by),
        ...this._path.slice(0, rotate_by),
      ];
      return;
    }

    if (current_neighbors.length === 0) {
      this._backtrack();
      return;
    }

    const next_i = current_neighbors.pop();
    this._cells[next_i] = true;
    this._path.push(next_i);
    this._queue.push(this._get_neighbours(next_i));
  }

  _i_to_canvas(i) {
    const [x, y] = Utils.i_to_xy(i, this._slots);
    return [
      Math.ceil(x * this._cell_size + this._cell_size / 2),
      Math.ceil(y * this._cell_size + this._cell_size / 2),
    ];
  }

  _calculate_next_pos(i, direction) {
    const [x, y] = Utils.i_to_xy(i, this._slots);
    let nx = x;
    let ny = y;
    if (direction === 0) {
      nx += 1;
    } else if (direction === 1) {
      ny += 1;
    } else if (direction === 2) {
      nx -= 1;
    } else if (direction === 3) {
      ny -= 1;
    }
    return Utils.xy_to_i(nx, ny, this._slots);
  }

  _draw_line(direction, pos, ctx) {
    const len = Math.ceil(this._cell_size);
    ctx.save();
    ctx.translate(...this._i_to_canvas(pos));
    ctx.rotate((Math.PI / 2) * direction);

    // draw line segment
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.lineTo(len / 2, 0);
    ctx.stroke();

    ctx.restore();
  }

  _draw_turn(direction_in, direction_out, pos, ctx) {
    let rotation;
    if (
      (direction_in == 0 && direction_out == 1) ||
      (direction_in == 3 && direction_out == 2)
    ) {
      rotation = 0;
    } else if (
      (direction_in == 1 && direction_out == 2) ||
      (direction_in == 0 && direction_out == 3)
    ) {
      rotation = Math.PI / 2;
    } else if (
      (direction_in == 2 && direction_out == 3) ||
      (direction_in == 1 && direction_out == 0)
    ) {
      rotation = Math.PI;
    } else if (
      (direction_in == 3 && direction_out == 0) ||
      (direction_in == 2 && direction_out == 1)
    ) {
      rotation = (3 * Math.PI) / 2;
    }

    const r = Math.ceil(this._cell_size / 2);

    ctx.save();
    ctx.translate(...this._i_to_canvas(pos));
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.arc(-r, r, r, (Math.PI * 3) / 2, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  update(t) {
    this._t = t;
  }

  show(ctx) {
    let final_path = [...this._path, this._path[0], this._path[1]];
    const directions = [];
    for (let i = 1; i < final_path.length; i++) {
      const p0 = Utils.i_to_point(
        final_path[(i % final_path.length) - 1],
        this._slots,
      );
      const p1 = Utils.i_to_point(
        final_path[i % final_path.length],
        this._slots,
      );
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      if (dx === 1 && dy === 0) {
        directions.push(0); // right
      } else if (dx === 0 && dy === 1) {
        directions.push(1); // down
      } else if (dx === -1 && dy === 0) {
        directions.push(2); // left
      } else if (dx === 0 && dy === -1) {
        directions.push(3); // up
      }
    }

    ctx.save();
    ctx.strokeStyle = this._fg.rgba;
    ctx.lineWidth = this._cell_size / 2;
    ctx.lineCap = "round";

    let current_pos = final_path[0];
    for (let i = 0; i < Math.floor(directions.length * this._t); i++) {
      const direction = directions[i];
      if (i > 0) {
        if (
          directions[i % directions.length] ==
          directions[(i - 1) % directions.length]
        ) {
          this._draw_line(directions[i], current_pos, ctx);
        } else {
          this._draw_turn(directions[i - 1], directions[i], current_pos, ctx);
        }
      }

      const next_pos = this._calculate_next_pos(current_pos, direction);
      current_pos = next_pos;
    }

    ctx.restore();
  }

  get ended() {
    return this._ended;
  }
}

export { Grid };
