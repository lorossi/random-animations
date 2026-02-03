import { XOR128, SimplexNoise } from "./lib.js";

class Grid {
  constructor(size, slots, seed, noise_scl, max_tries, color) {
    this._size = size;
    this._slots = slots;
    this._seed = seed;
    this._noise_scl = noise_scl;
    this._max_tries = max_tries;
    this._fg = color.copy();

    this._cell_size = this._size / this._slots;

    this._start_x = 0;
    this._start_y = 0;

    this._init();
  }

  _xy_to_i(x, y) {
    return y * this._slots + x;
  }

  _i_to_xy(i, round = false) {
    const y = Math.floor(i / this._slots);
    const x = i % this._slots;
    if (round) {
      return [Math.round(x), Math.round(y)];
    }
    return [x, y];
  }

  _get_neighbours(i) {
    const [x, y] = this._i_to_xy(i);

    const neighbors = [];
    for (const [dx, dy] of this._dxy) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= this._slots || nx < 0 || ny >= this._slots || ny < 0) continue;
      if (this._cells[this._xy_to_i(nx, ny)] === 1) continue;

      neighbors.push(this._xy_to_i(nx, ny));
    }

    return neighbors
      .map((n) => ({
        n,
        cost: this._costs[n],
      }))
      .sort((a, b) => a.cost - b.cost)
      .map((o) => o.n);
  }

  _is_neighbor(a, b) {
    const [ax, ay] = this._i_to_xy(a);
    const [bx, by] = this._i_to_xy(b);
    const dx = Math.abs(ax - bx);
    const dy = Math.abs(ay - by);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  _init() {
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._cells = new Array(this._slots ** 2).fill(0);
    this._costs = new Array(this._slots ** 2).fill(0).map((_, i) => {
      const [x, y] = this._i_to_xy(i);
      const nx = (x / this._slots) * this._noise_scl;
      const ny = (y / this._slots) * this._noise_scl;
      const n = this._noise.noise(nx, ny, 1000);
      return (n + 1) / 2;
    });

    this._t = 0;
    this._dxy = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];

    this._queue = [];
    this._neighbors = [];
    this._path = [];

    const start_i = this._xy_to_i(this._start_x, this._start_y);
    this._path = [start_i];
    this._cells[start_i] = 1;
    this._queue = [this._get_neighbours(start_i)];
    this._steps_count = 0;
  }

  _backtrack() {
    this._queue.pop();
    const last_i = this._path.pop();
    this._cells[last_i] = 0;
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

      const [x, y] = this._i_to_xy(current, true);
      for (const [dx, dy] of this._dxy) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= this._slots || nx < 0) continue;
        if (ny >= this._slots || ny < 0) continue;
        const ni = this._xy_to_i(nx, ny);

        if (visited[ni] || (this._cells[ni] === 1 && ni !== target)) continue;

        visited[ni] = true;
        queue.push(ni);
      }
    }

    if (!target_reachable) return false;

    // check if all unvisited cells are reachable
    for (let i = 0; i < this._cells.length; i++) {
      if (this._cells[i] === 0 && !visited[i]) {
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

    const current_i = this._path[this._path.length - 1];
    const current_neighbors = this._queue[this._queue.length - 1];

    if (!this._bfs(current_i)) {
      this._backtrack();
      return;
    }

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
    this._cells[next_i] = 1;
    this._path.push(next_i);
    this._queue.push(this._get_neighbours(next_i));
  }

  _i_to_canvas(i) {
    const [x, y] = this._i_to_xy(i);
    return [
      Math.ceil(x * this._cell_size + this._cell_size / 2),
      Math.ceil(y * this._cell_size + this._cell_size / 2),
    ];
  }

  _calculate_next_pos(i, direction) {
    const [x, y] = this._i_to_xy(i);
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
    return this._xy_to_i(nx, ny);
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
      const [x0, y0] = this._i_to_xy(
        final_path[(i % final_path.length) - 1],
        true,
      );
      const [x1, y1] = this._i_to_xy(final_path[i % final_path.length], true);
      const dx = x1 - x0;
      const dy = y1 - y0;
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
