import { Point } from "./lib.js";

class Algorithm {
  constructor(slots, start, goal, cost) {
    this._slots = slots;
    this._start = start;
    this._goal = goal;
    this._cost = cost;

    this._visited = new Set();
    this._ended = false;

    this._init();
  }

  step() {}

  _init() {}

  _point_to_i(point) {
    return point.y * this._slots + point.x;
  }

  _i_to_point(i) {
    const x = i % this._slots;
    const y = Math.floor(i / this._slots);
    return new Point(x, y);
  }

  _get_neighbors(i) {
    const point = this._i_to_point(i);
    const neighbors = [];
    const directions = [
      new Point(1, 0),
      new Point(-1, 0),
      new Point(0, 1),
      new Point(0, -1),
    ];
    for (const dir of directions) {
      const neighbor = point.add(dir);
      if (neighbor.x < 0 || neighbor.x >= this._slots) continue;
      if (neighbor.y < 0 || neighbor.y >= this._slots) continue;

      // Don't add walls to neighbors
      const neighbor_i = this._point_to_i(neighbor);
      if (this._cost[neighbor_i] === Infinity) continue;

      neighbors.push(neighbor_i);
    }
    return neighbors;
  }

  _reconstruct_path(came_from) {
    const path = [];
    let current_i = this._current_i;
    while (current_i !== null) {
      path.push(this._i_to_point(current_i));
      current_i = came_from[current_i];
    }
    path.reverse();
    return path;
  }

  get path() {
    return [];
  }

  get visited() {
    return this._visited;
  }

  get ended() {
    return this._ended;
  }
}

class BFS extends Algorithm {
  _init() {
    this._queue = []; // poor man's priority queue
    const start_i = this._point_to_i(this._start);
    this._queue.push([start_i, 0]);
    this._visited.add(start_i);
    this._prev = new Array(this._slots ** 2).fill(null);

    this._current_i = start_i;
  }

  step() {
    if (this._ended) return;
    if (this._queue.length === 0) {
      this._ended = true;
      return;
    }

    const [current_i, current_dist] = this._queue.shift();
    const current_point = this._i_to_point(current_i);
    this._current_i = current_i;

    if (current_point.equals(this._goal)) {
      this._ended = true;
      return;
    }

    const neighbors = this._get_neighbors(current_i);
    for (const neighbor_i of neighbors) {
      if (this._visited.has(neighbor_i)) continue;
      this._visited.add(neighbor_i);
      this._prev[neighbor_i] = current_i;
      this._queue.push([neighbor_i, current_dist + 1]);
    }

    this._queue = this._queue.sort((a, b) => a[1] - b[1]); // hey, at least we have priority
  }

  _heuristic(a_i, b_i) {
    const a = this._i_to_point(a_i);
    const b = this._i_to_point(b_i);
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  _reconstruct_path(start_i) {
    const path = [];
    let current_i = start_i;
    while (current_i !== null) {
      path.push(this._i_to_point(current_i));
      current_i = this._prev[current_i];
    }
    path.reverse();
    return path;
  }

  get path() {
    return this._reconstruct_path(this._current_i);
  }
}

class DFS extends Algorithm {
  _init() {
    this._stack = [];
    const start_i = this._point_to_i(this._start);
    this._stack.push(start_i);
    this._visited.add(start_i);
    this._prev = new Array(this._slots ** 2).fill(null);

    this._current_i = start_i;
  }

  step() {
    if (this._ended) return;
    if (this._stack.length === 0) {
      this._ended = true;
      return;
    }

    const current_i = this._stack.pop();
    const current_point = this._i_to_point(current_i);
    this._current_i = current_i;

    if (current_point.equals(this._goal)) {
      this._ended = true;
      return;
    }

    const neighbors = this._get_neighbors(current_i);
    for (const neighbor_i of neighbors) {
      if (this._visited.has(neighbor_i)) continue;
      this._visited.add(neighbor_i);
      this._prev[neighbor_i] = current_i;
      this._stack.push(neighbor_i);
    }
  }

  get path() {
    return this._reconstruct_path(this._prev);
  }
}

class Dijkstra extends Algorithm {
  _init() {
    this._dist = new Array(this._slots ** 2).fill(Infinity);

    const start_i = this._point_to_i(this._start);
    this._dist[start_i] = 0;

    this._prev = new Array(this._slots ** 2).fill(null);
    this._Q = new Set();
    for (let i = 0; i < this._slots ** 2; i++) {
      if (this._cost[i] !== Infinity) {
        this._Q.add(i);
      }
    }
    this._current_i = start_i;
    this._visited.add(start_i);
  }

  step() {
    if (this._ended) return;
    if (this._Q.size === 0) {
      this._ended = true;
      return;
    }

    // node in Q with lowest dist
    const current_i = Array.from(this._Q).reduce((a, b) =>
      this._dist[a] < this._dist[b] ? a : b,
    );
    this._current_i = current_i;

    const current_point = this._i_to_point(current_i);
    if (current_point.equals(this._goal)) {
      this._ended = true;
      return;
    }

    this._Q.delete(current_i);
    const neighbors = this._get_neighbors(current_i);
    for (const neighbor_i of neighbors) {
      const alt = this._dist[current_i] + this._cost[neighbor_i];
      if (alt < this._dist[neighbor_i]) {
        this._dist[neighbor_i] = alt;
        this._prev[neighbor_i] = current_i;
        this._current_i = neighbor_i;
        this._visited.add(neighbor_i);
      }
    }
  }

  get path() {
    return this._reconstruct_path(this._prev);
  }
}

class AStar extends Dijkstra {
  _init() {
    this._g_score = new Array(this._slots ** 2).fill(Infinity);
    this._f_score = new Array(this._slots ** 2).fill(Infinity);
    this._came_from = new Array(this._slots ** 2).fill(null);

    const start_i = this._point_to_i(this._start);
    const goal_i = this._point_to_i(this._goal);

    this._g_score[start_i] = 0;
    this._f_score[start_i] = this._heuristic(start_i, goal_i);
    this._open_set = new Set();
    this._open_set.add(start_i);

    this._current_i = start_i;
    this._visited.add(start_i);
  }

  step() {
    if (this._ended) return;
    if (this._open_set.size === 0) {
      this._ended = true;
      return;
    }

    // node in open_set with lowest f_score
    const current_i = Array.from(this._open_set).reduce((a, b) =>
      this._f_score[a] < this._f_score[b] ? a : b,
    );

    const current_point = this._i_to_point(current_i);
    if (current_point.equals(this._goal)) {
      this._ended = true;
      return;
    }

    this._open_set.delete(current_i);
    const neighbors = this._get_neighbors(current_i);
    for (const neighbor_i of neighbors) {
      if (this._cost[neighbor_i] === Infinity) continue;

      const tentative_g_score =
        this._g_score[current_i] + this._cost[neighbor_i];
      if (tentative_g_score < this._g_score[neighbor_i]) {
        this._current_i = neighbor_i;
        this._came_from[neighbor_i] = current_i;
        this._g_score[neighbor_i] = tentative_g_score;
        this._f_score[neighbor_i] =
          tentative_g_score +
          this._heuristic(neighbor_i, this._point_to_i(this._goal));
        this._open_set.add(neighbor_i);
        this._visited.add(neighbor_i);
      }
    }
  }

  _heuristic(a_i, b_i) {
    const a = this._i_to_point(a_i);
    const b = this._i_to_point(b_i);
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  get path() {
    return this._reconstruct_path(this._came_from);
  }
}

export { Algorithm, BFS, DFS, AStar, Dijkstra };
