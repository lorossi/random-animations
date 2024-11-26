import { XOR128 } from "./xor128.js";
import { Color, Point, SimplexNoise } from "./engine.js";
import { Palette } from "./palette-factory.js";

const Direction = {
  Right: { x: 1, y: 0 },
  Up: { x: 0, y: -1 },
  Left: { x: -1, y: 0 },
  Down: { x: 0, y: 1 },
};
Object.freeze(Direction);

class Walker {
  constructor(x, y, cols, rows, lines) {
    this._x = x;
    this._y = y;
    this._cols = cols;
    this._rows = rows;
    this._lines = lines;

    this._positions_history = [new Point(x, y)];
    this._grid = new Array(cols)
      .fill(null)
      .map(() => new Array(rows).fill(false));

    this._directions_history = [null];
    this._split_position = null;
    this._has_ended = false;
    this._can_split = true;
    this._noise_scl = 0.1;
    this._children = [];

    this._palette = new Palette(Color.fromMonochrome(15));
    this._fg_color = this._palette.getRandomColor();

    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e8));
  }

  update() {
    if (this._has_ended) return;

    let directions = Object.values(Direction).filter((d) => {
      // check if the direction does not lead to a poisition that has already been visited
      const new_position = new Point(
        this._positions_history[this._positions_history.length - 1].x + d.x,
        this._positions_history[this._positions_history.length - 1].y + d.y
      );
      return (
        this._positions_history.every(
          (h) => h.x != new_position.x || h.y != new_position.y
        ) &&
        new_position.x >= 0 &&
        new_position.x < this._cols &&
        new_position.y >= 0 &&
        new_position.y < this._rows &&
        !this._grid[new_position.x][new_position.y]
      );
    });

    if (directions.length == 0) {
      // check if every child is ended too
      this._has_ended = true;
      return;
    }

    // const new_direction =
    //   directions[this._xor128.random_int(directions.length)];
    const last_position =
      this._positions_history[this._positions_history.length - 1];
    const n = this._noise.noise(
      last_position.x * this._noise_scl,
      last_position.y * this._noise_scl
    );
    const new_direction_index = Math.floor(((n + 1) / 2) * directions.length);
    const new_direction = directions[new_direction_index];

    const new_position = new Point(
      last_position.x + new_direction.x,
      last_position.y + new_direction.y
    );

    this._grid[new_position.x][new_position.y] = true;

    this._positions_history.push(new_position);
    this._directions_history.push(new_direction);

    if (this._directions_history.length == 2)
      this._directions_history[0] = new_direction;
  }

  show(ctx, scl) {
    ctx.save();

    this._positions_history.forEach((_, i) => {
      ctx.save();
      ctx.fillStyle = this._fg_color.rgba;

      if (
        i == this._positions_history.length - 1 || // last position
        this._directions_history[i] == this._directions_history[i + 1] // same direction as next
      ) {
        this._drawRibbon(i, scl, ctx);
      } else {
        this._drawAngle(i, scl, ctx);
      }

      ctx.restore();
    });

    ctx.restore();
  }

  setSeed(seed) {
    this._seed = seed;
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e8));
  }

  setPalette(palette) {
    this._palette = palette;
    this._fg_color = this._palette.getRandomColor(this._xor128);
  }

  setGrid(grid) {
    this._grid = grid;
  }

  setNoiseScl(scl) {
    this._noise_scl = scl;
  }

  _drawRibbon(i, scl, ctx) {
    const rotation = this._calculateRotation(i);
    const p = this._positions_history[i];

    ctx.translate(p.x * scl + scl / 2, p.y * scl + scl / 2);
    ctx.rotate(rotation);
    ctx.translate(-scl / 2, -scl / 2);

    const line_scl = scl / (this._lines + 0.5);
    ctx.save();
    for (let j = 0; j < this._lines; j++) {
      ctx.fillRect((j + 0.5) * line_scl, 0, line_scl / 2, scl);
    }
    ctx.restore();
  }

  _drawAngle(i, scl, ctx) {
    // load the current position
    const p = this._positions_history[i];
    // load the previous and current direction
    const [prev_direction, curr_direction] = this._calculateDirection(i);
    // check if it's necessary to flip the drawing
    const flip_x = Math.sign(prev_direction.x - curr_direction.x);
    const flip_y = Math.sign(prev_direction.y - curr_direction.y);
    // calculate the size of the lines
    const line_scl = scl / (this._lines + 0.5);

    // perform translation and and scaling
    ctx.save();
    ctx.translate(p.x * scl + scl / 2, p.y * scl + scl / 2);
    ctx.scale(flip_x, flip_y);
    ctx.translate(-scl / 2, -scl / 2);

    // draw the lines
    for (let j = 0; j < this._lines; j++) {
      const inner_r = (j + 0.5) * line_scl;
      const outer_r = (j + 1) * line_scl;
      ctx.beginPath();
      ctx.arc(0, 0, outer_r, 0, Math.PI / 2);
      ctx.arc(0, 0, inner_r, Math.PI / 2, 0, true);
      ctx.fill();
    }

    ctx.restore();
  }

  _calculateRotation(i) {
    if (this._directions_history.length < 2) return 0;

    const direction = this._directions_history[i];
    if (direction == undefined) {
      console.log("undefined direction", i, this._directions_history.length);
      return 0;
    }
    return Math.atan2(direction.y, direction.x) - Math.PI / 2;
  }

  _calculateDirection(i) {
    const directions = [
      this._directions_history[i],
      this._directions_history[i + 1],
    ];

    return directions;
  }

  isEnded() {
    return this._has_ended;
  }

  canSplit() {
    // if the walker is still alive, it cannot split
    if (!this._has_ended) return false;
    if (this._children.some((c) => !c.isEnded())) return false;

    // check the first free position via backtracking the history
    for (let i = this._positions_history.length - 1; i >= 0; i--) {
      const p = this._positions_history[i];
      const directions = Object.values(Direction).filter((d) => {
        const new_position = new Point(p.x + d.x, p.y + d.y);
        return (
          new_position.x >= 0 &&
          new_position.x < this._cols &&
          new_position.y >= 0 &&
          new_position.y < this._rows &&
          !this._grid[new_position.x][new_position.y]
        );
      });

      if (directions.length > 0) {
        const start_position = p;
        const n = this._noise.noise(
          start_position.x * this._noise_scl,
          start_position.y * this._noise_scl
        );
        const start_direction_index = Math.floor(
          ((n + 1) / 2) * directions.length
        );
        const start_direction = directions[start_direction_index];
        this._split_position = new Point(
          start_position.x + start_direction.x,
          start_position.y + start_direction.y
        );
        return true;
      }
    }
  }

  split() {
    if (this._split_position == null) return;

    const walker = new Walker(
      this._split_position.x,
      this._split_position.y,
      this._cols,
      this._rows,
      this._lines
    );

    walker.setSeed(this._xor128.random_int(1e16));
    walker.setGrid(this._grid);
    walker.setPalette(this._palette);

    this._grid[this._split_position.x][this._split_position.y] = true;
    this._children.push(walker);

    return walker;
  }
}

export { Walker };
