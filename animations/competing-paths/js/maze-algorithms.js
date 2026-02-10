import { XOR128, Point, SimplexNoise } from "./lib.js";

const BACKTRACKING_CELL_STATE = {
  UNVISITED: 0,
  VISITED: 1,
  WALL: 2,
};

class MazeAlgorithm {
  constructor(slots, seed, start, goal) {
    this._slots = slots;
    this._seed = seed;
    this._start = start.copy();
    this._goal = goal.copy();

    if (this._start.x % 2 === 0 || this._start.y % 2 === 0) {
      throw new Error("Start position must be on an odd coordinate");
    }
    if (this._goal.x % 2 === 0 || this._goal.y % 2 === 0) {
      throw new Error("Goal position must be on an odd coordinate");
    }

    this._xor128 = new XOR128(this._seed);
    this._grid = new Array(this._slots ** 2).fill(Infinity);

    this.generate();
  }

  xy_to_i(x, y) {
    return y * this._slots + x;
  }

  point_to_i(point) {
    return this.xy_to_i(point.x, point.y);
  }

  i_to_xy(i) {
    const x = i % this._slots;
    const y = Math.floor(i / this._slots);
    return { x, y };
  }

  get_neighbors(i) {
    const x = i % this._slots;
    const y = Math.floor(i / this._slots);
    const neighbors = [];
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < this._slots && ny >= 0 && ny < this._slots) {
        neighbors.push(this.xy_to_i(nx, ny));
      }
    }
    return neighbors;
  }

  get grid() {
    return this._grid;
  }

  generate() {}
}

class SplitMazeAlgorithm extends MazeAlgorithm {
  generate() {
    this._min_room_size = 7; // Minimum size of a room (must be odd)
    this._grid = new Array(this._slots ** 2).fill().map((_, i) => {
      const x = i % this._slots;
      const y = Math.floor(i / this._slots);
      if (x == 0 || x == this._slots - 1 || y == 0 || y == this._slots - 1)
        return Infinity; // Border walls
      return 0; // Open space
    });

    if (this._xor128.random_bool()) {
      this._split_horizontal(0, 0, this._slots - 1, this._slots - 1);
    } else {
      this._split_vertical(0, 0, this._slots - 1, this._slots - 1);
    }
  }

  _split_vertical(x1, y1, x2, y2) {
    if (x2 - x1 < this._min_room_size) return;
    if (Math.abs(x1 - x2) < 3) return;
    if (Math.abs(y1 - y2) < 3) return;

    let x = this._xor128.random_int(x1 + 1, x2 - 1);
    if (x % 2 === 1) x++; // Ensure x is even

    let gap_y = this._xor128.random_int(y1 + 1, y2 - 1);
    if (gap_y % 2 === 0) gap_y++; // Ensure gap_y is odd

    for (let y = y1; y <= y2; y++) {
      if (y === gap_y) continue;
      this._grid[this.xy_to_i(x, y)] = Infinity;
    }

    this._split_horizontal(x1, y1, x - 1, y2);
    this._split_horizontal(x + 1, y1, x2, y2);
  }

  _split_horizontal(x1, y1, x2, y2) {
    if (y2 - y1 < this._min_room_size) return;
    if (Math.abs(x1 - x2) < 3) return;
    if (Math.abs(y1 - y2) < 3) return;

    let y = this._xor128.random_int(y1 + 1, y2 - 1);
    if (y % 2 === 1) y++; // Ensure y is even

    let gap_x = this._xor128.random_int(x1 + 1, x2 - 1);
    if (gap_x % 2 === 0) gap_x++; // Ensure gap_x is odd

    for (let x = x1; x <= x2; x++) {
      if (x === gap_x) continue;
      this._grid[this.xy_to_i(x, y)] = Infinity;
    }

    this._split_vertical(x1, y1, x2, y - 1);
    this._split_vertical(x1, y + 1, x2, y2);
  }
}

class BacktrackingMazeAlgorithm extends MazeAlgorithm {
  generate() {
    this._inner_grid = new Array(this._slots ** 2).fill().map((_, i) => {
      const x = i % this._slots;
      const y = Math.floor(i / this._slots);
      if (x % 2 === 0 || y % 2 === 0) return BACKTRACKING_CELL_STATE.WALL; // Walls
      return BACKTRACKING_CELL_STATE.UNVISITED; // Open space
    });

    const stack = [this._start.copy()];

    while (stack.length > 0) {
      const current = stack.pop();
      const current_i = this.point_to_i(current);

      this._inner_grid[current_i] = BACKTRACKING_CELL_STATE.VISITED;

      const neighbors = this.get_neighbors(current);
      if (neighbors.length === 0) continue;

      // pick a random neighbor
      const next = neighbors[0];

      // remove wall between current and next
      const wall_x = (current.x + next.x) / 2;
      const wall_y = (current.y + next.y) / 2;
      this._inner_grid[this.xy_to_i(wall_x, wall_y)] =
        BACKTRACKING_CELL_STATE.VISITED;

      stack.push(current);
      stack.push(next);
    }
  }

  get_neighbors(point, shuffle = true) {
    const directions = [
      new Point(2, 0),
      new Point(-2, 0),
      new Point(0, 2),
      new Point(0, -2),
    ];
    let neighbors = [];

    for (const dir of directions) {
      const neighbor = new Point(point.x + dir.x, point.y + dir.y);
      if (neighbor.x < 0 || neighbor.x >= this._slots) continue;
      if (neighbor.y < 0 || neighbor.y >= this._slots) continue;

      const neighbor_i = this.point_to_i(neighbor);
      if (this._inner_grid[neighbor_i] !== BACKTRACKING_CELL_STATE.UNVISITED)
        continue;

      neighbors.push(neighbor);
    }

    if (shuffle && neighbors.length > 0)
      neighbors = this._xor128.shuffle(neighbors);

    return neighbors;
  }

  get grid() {
    return this._inner_grid.map((cell) =>
      cell === BACKTRACKING_CELL_STATE.WALL ? Infinity : 0,
    );
  }
}

class RandomPrimAlgorithm extends BacktrackingMazeAlgorithm {
  generate() {
    this._inner_grid = new Array(this._slots ** 2).fill().map((_, i) => {
      const x = i % this._slots;
      const y = Math.floor(i / this._slots);
      if (x % 2 === 0 || y % 2 === 0) return BACKTRACKING_CELL_STATE.WALL; // Walls
      return BACKTRACKING_CELL_STATE.UNVISITED; // Open space
    });

    const cells_num = this._inner_grid.filter(
      (cell) => cell === BACKTRACKING_CELL_STATE.UNVISITED,
    ).length;

    const tree = [this._start.copy()];
    this._inner_grid[this.point_to_i(this._start)] =
      BACKTRACKING_CELL_STATE.VISITED;

    while (tree.length < cells_num) {
      const candidates = tree.filter((cell) => this._is_edge(cell));
      const current = this._xor128.pick(candidates);
      const next = this.get_neighbors(current, true)[0];

      const wall_x = (current.x + next.x) / 2;
      const wall_y = (current.y + next.y) / 2;
      const wall_i = this.xy_to_i(wall_x, wall_y);
      this._inner_grid[wall_i] = BACKTRACKING_CELL_STATE.VISITED;
      const current_i = this.point_to_i(current);
      this._inner_grid[current_i] = BACKTRACKING_CELL_STATE.VISITED;
      const next_i = this.point_to_i(next);
      this._inner_grid[next_i] = BACKTRACKING_CELL_STATE.VISITED;

      tree.push(next);
    }
  }

  _is_edge(cell) {
    const dir = [
      [2, 0],
      [-2, 0],
      [0, 2],
      [0, -2],
    ];
    for (const [dx, dy] of dir) {
      const nx = cell.x + dx;
      if (nx < 0 || nx >= this._slots) continue;
      const ny = cell.y + dy;
      if (ny < 0 || ny >= this._slots) continue;

      const neighbor_i = this.xy_to_i(nx, ny);
      if (this._inner_grid[neighbor_i] === BACKTRACKING_CELL_STATE.UNVISITED)
        return true;
    }
    return false;
  }
}

class NoisePrimAlgorithm extends BacktrackingMazeAlgorithm {
  generate() {
    this._noise_scale = 2.5;
    const noise_seed = this._xor128.random_int(1e9);
    this._noise = new SimplexNoise(noise_seed);
    this._noise.setDetail(2, 0.25);

    this._inner_grid = new Array(this._slots ** 2).fill().map((_, i) => {
      const x = i % this._slots;
      const y = Math.floor(i / this._slots);
      if (x % 2 === 0 || y % 2 === 0) return BACKTRACKING_CELL_STATE.WALL; // Walls
      return BACKTRACKING_CELL_STATE.UNVISITED; // Open space
    });

    const cells_num = this._inner_grid.filter(
      (cell) => cell === BACKTRACKING_CELL_STATE.UNVISITED,
    ).length;

    const costs = new Array(this._slots ** 2).fill().map((_, i) => {
      const x = i % this._slots;
      const y = Math.floor(i / this._slots);
      const n = this._noise.noise(
        (x / this._slots) * this._noise_scale,
        (y / this._slots) * this._noise_scale,
        1000,
      );
      return (n + 1) / 2;
    });

    const tree = [this._start.copy()];
    this._inner_grid[this.point_to_i(this._start)] =
      BACKTRACKING_CELL_STATE.VISITED;

    while (tree.length < cells_num) {
      // find the cell in the tree with the lowest cost
      let current = null;
      let next = null;
      let best_cost = Infinity;

      for (const cell of tree) {
        const neighbors = this.get_neighbors(cell, false);
        for (const neighbor of neighbors) {
          const neighbor_i = this.point_to_i(neighbor);
          const cost = costs[neighbor_i];
          if (cost < best_cost) {
            best_cost = cost;
            current = cell;
            next = neighbor;
          }
        }
      }

      const wall_x = (current.x + next.x) / 2;
      const wall_y = (current.y + next.y) / 2;
      const wall_i = this.xy_to_i(wall_x, wall_y);
      this._inner_grid[wall_i] = BACKTRACKING_CELL_STATE.VISITED;
      const current_i = this.point_to_i(current);
      this._inner_grid[current_i] = BACKTRACKING_CELL_STATE.VISITED;
      const next_i = this.point_to_i(next);
      this._inner_grid[next_i] = BACKTRACKING_CELL_STATE.VISITED;

      tree.push(next);
    }
  }
}

const MAZE_ALGORITHMS = [
  SplitMazeAlgorithm,
  BacktrackingMazeAlgorithm,
  NoisePrimAlgorithm,
  RandomPrimAlgorithm,
];
Object.freeze(MAZE_ALGORITHMS);

export { MazeAlgorithm, MAZE_ALGORITHMS };
