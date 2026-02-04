import { XOR128, Point, Color } from "./lib.js";

class Grid {
  constructor(slots, size, seed, start, goal, algorithm_cls, maze) {
    this._slots = slots;
    this._size = size;
    this._seed = seed;
    this._start = start.copy();
    this._goal = goal.copy();
    this._maze = maze;

    this._xor128 = new XOR128(this._seed);
    this._cost = [...this._maze.grid];

    this._algorithm = new algorithm_cls(
      this._slots,
      this._start,
      this._goal,
      this._cost,
    );

    this._start_color = Color.fromCSS("green");
    this._goal_color = Color.fromCSS("red");
    this._wall_color = Color.fromCSS("black");
    this._visited_color = Color.fromCSS("lightblue");
    this._path_color = Color.fromCSS("orange");
  }

  set_colors(wall, visited, path, goal) {
    this._wall_color = wall;
    this._visited_color = visited;
    this._path_color = path;
    this._goal_color = goal;
  }

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

      neighbors.push(this._point_to_i(neighbor));
    }
    return neighbors;
  }

  _check_path_exists() {
    const start_i = this._point_to_i(this._start);
    const goal_i = this._point_to_i(this._goal);

    // Check if start or goal are on walls
    if (this._cost[start_i] === Infinity) {
      console.error("Start is on a wall!");
      return false;
    }
    if (this._cost[goal_i] === Infinity) {
      console.error("Goal is on a wall!");
      return false;
    }

    let stack = [start_i];
    const visited = new Set();
    const added_to_stack = new Set([start_i]); // Track what's been added to stack

    while (stack.length > 0) {
      const current_i = stack.pop();

      if (visited.has(current_i)) continue;
      visited.add(current_i);

      if (current_i === goal_i) {
        console.log("Path found!");
        return true;
      }

      const neighbors = this._get_neighbors(current_i);
      for (const neighbor_i of neighbors) {
        if (this._cost[neighbor_i] === Infinity) continue;
        if (added_to_stack.has(neighbor_i)) continue; // Don't add same node twice
        stack.push(neighbor_i);
        added_to_stack.add(neighbor_i);
      }
    }

    // Find a visited node near the goal to debug
    const visited_near_goal = [];
    for (const v_i of visited) {
      const p = this._i_to_point(v_i);
      if (p.x > 45 && p.y > 45) {
        visited_near_goal.push(p);
      }
    }

    return false;
  }

  step() {
    this._algorithm.step();
  }

  draw(ctx) {
    const slot_size = this._size / this._slots;
    const path = this._algorithm.path;

    ctx.save();

    // draw grid
    ctx.fillStyle = this._wall_color.rgba;

    for (let i = 0; i < this._cost.length; i++) {
      if (this._cost[i] < Infinity) continue;
      const point = this._i_to_point(i);
      const x = point.x * slot_size;
      const y = point.y * slot_size;
      ctx.fillRect(x, y, slot_size, slot_size);
    }

    // draw explored nodes
    ctx.fillStyle = this._visited_color.rgba;
    for (const i of this._algorithm.visited) {
      const point = this._i_to_point(i);
      const x = point.x * slot_size;
      const y = point.y * slot_size;
      ctx.fillRect(x, y, slot_size, slot_size);
    }

    // draw path
    ctx.fillStyle = this._path_color.rgba;
    for (const point of path) {
      const x = point.x * slot_size;
      const y = point.y * slot_size;
      ctx.fillRect(x, y, slot_size, slot_size);
    }

    // draw goal
    ctx.fillStyle = this._goal_color.rgba;
    const goal_x = this._goal.x * slot_size;
    const goal_y = this._goal.y * slot_size;
    ctx.fillRect(goal_x, goal_y, slot_size, slot_size);

    ctx.restore();
  }
  get ended() {
    return this._algorithm.ended;
  }
}

export { Grid };
