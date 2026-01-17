import { Line } from "./line.js";
import { Point, XOR128 } from "./lib.js";

const DIRECTION_TO_POINT = [
  new Point(1, 0), // right 0
  new Point(0, 1), // down 1
  new Point(-1, 0), // left 2
  new Point(0, -1), // up 3
];

class Grid {
  constructor(size, slots, stripes, palette, seed) {
    this._size = size;
    this._slots = slots;
    this._stripes = stripes;
    this._palette = palette;
    this._seed = seed;

    this._xor128 = new XOR128(this._seed);
    this._slot_size = this._size / this._slots;

    this._visited = new Array(this._slots * this._slots).fill(false);
    this._ended = false;

    const start_pos = new Point(
      this._xor128.random_int(2, this._slots - 2),
      this._xor128.random_int(2, this._slots - 2),
    );
    this._visited[this._posToIndex(start_pos)] = true;

    this._line = new Line(
      start_pos,
      this._slot_size,
      this._stripes,
      this._palette,
      this._xor128,
    );
    this._ended_lines = [];
  }

  _posToIndex(pos) {
    return pos.x + pos.y * this._slots;
  }

  _findDirections(current_position, last_direction) {
    const directions = [];
    for (let dir = 0; dir < 4; dir++) {
      if (last_direction != null && (dir + 2) % 4 == last_direction) continue;

      if (current_position.x == 0 && dir == 2) continue;
      if (current_position.x == this._slots - 1 && dir == 0) continue;
      if (current_position.y == 0 && dir == 3) continue;
      if (current_position.y == this._slots - 1 && dir == 1) continue;

      const next_pos = current_position.copy().add(DIRECTION_TO_POINT[dir]);
      if (next_pos.x < 0 || next_pos.x >= this._slots) continue;
      if (next_pos.y < 0 || next_pos.y >= this._slots) continue;
      if (this._visited[this._posToIndex(next_pos)]) continue;

      directions.push(dir);
    }

    return directions;
  }

  update() {
    if (this._ended) return;

    this._ended_lines = this._ended_lines.filter(
      (line) => line._directions.length > 2,
    );

    const current_position = this._line.current_position;
    const last_direction = this._line.last_direction;

    this._visited[this._posToIndex(current_position)] = true;
    if (this._visited.every((v) => v)) {
      this._ended = true;
    }

    const available_directions = this._findDirections(
      current_position,
      last_direction,
    );
    const next_position = this._line.update(available_directions);

    if (next_position) {
      // continue line
    } else {
      // line ended -- do nothing for now

      this._ended_lines.push(this._line);

      // keep backtracking until:
      let new_line = this._line.copy();
      while (true) {
        const backtracked_position = new_line.backtrack();

        if (!backtracked_position && new_line._directions.length == 0) {
          // cannot backtrack anymore -- grid ended
          this._ended = true;
          console.log("Grid ended");
          break;
        }

        const available_directions = this._findDirections(
          new_line.current_position,
          new_line.last_direction,
        );
        if (available_directions.length == 0) {
          continue;
        }

        const next_position = new_line.update(available_directions);

        if (next_position) {
          this._line = new_line;
          this._visited[this._posToIndex(new_line.current_position)] = true;
          break;
        }
      }

      this._line = new_line;
    }
  }

  show(ctx) {
    ctx.save();

    // draw lines
    this._ended_lines.forEach((line) => line.show(ctx));
    this._line.show(ctx);
    ctx.restore();
  }

  get ended() {
    return this._ended;
  }
}

export { DIRECTION_TO_POINT, Grid };
