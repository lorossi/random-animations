import { XOR128 } from "./lib.js";

class Maze {
  constructor(slots, min_room_size, seed, start, goal) {
    this._slots = slots;
    this._seed = seed;
    this._min_room_size = min_room_size;
    this._start = start.copy();
    this._goal = goal.copy();

    if (this._start.x % 2 === 0 || this._start.y % 2 === 0) {
      throw new Error("Start position must be on an odd coordinate");
    }
    if (this._goal.x % 2 === 0 || this._goal.y % 2 === 0) {
      throw new Error("Goal position must be on an odd coordinate");
    }

    this._xor128 = new XOR128(this._seed);
    this._generateMaze();
  }

  _generateMaze() {
    this._grid = new Array(this._slots ** 2).fill(0);

    // fill outer walls
    for (let i = 0; i < this._slots; i++) {
      this._grid[i] = Infinity; // Top row
      this._grid[(this._slots - 1) * this._slots + i] = Infinity; // Bottom row
      this._grid[i * this._slots] = Infinity; // Left column
      this._grid[i * this._slots + this._slots - 1] = Infinity; // Right column
    }

    if (this._xor128.random_bool()) {
      this._split_horizontal(0, 0, this._slots - 1, this._slots - 1);
    } else {
      this._split_vertical(0, 0, this._slots - 1, this._slots - 1);
    }

    if (!this._is_solvable()) {
      console.log("Generated maze is not solvable!");
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
      this._grid[this._xy_to_i(x, y)] = Infinity;
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
      this._grid[this._xy_to_i(x, y)] = Infinity;
    }

    this._split_vertical(x1, y1, x2, y - 1);
    this._split_vertical(x1, y + 1, x2, y2);
  }

  _is_solvable() {
    const start_i = this._point_to_i(this._start);
    const goal_i = this._point_to_i(this._goal);

    // Check if there's a path from start to goal using flood fill
    const visited = new Set();
    const queue = [start_i];

    while (queue.length > 0) {
      const current_i = queue.shift();
      if (current_i === goal_i) return true;
      if (visited.has(current_i)) continue;

      visited.add(current_i);
      const neighbors = this._get_neighbors(current_i);
      for (const neighbor_i of neighbors) {
        if (this._grid[neighbor_i] !== Infinity && !visited.has(neighbor_i)) {
          queue.push(neighbor_i);
        }
      }
    }
    return false;
  }

  _xy_to_i(x, y) {
    return y * this._slots + x;
  }

  _point_to_i(point) {
    return this._xy_to_i(point.x, point.y);
  }

  _get_neighbors(i) {
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
        neighbors.push(this._xy_to_i(nx, ny));
      }
    }
    return neighbors;
  }

  _i_to_xy(i) {
    const x = i % this._slots;
    const y = Math.floor(i / this._slots);
    return { x, y };
  }

  get grid() {
    return this._grid;
  }
}

export { Maze };
