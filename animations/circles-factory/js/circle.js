import { Color } from "./engine.js";
import { CUT_SIDE } from "./cutter.js";
import { polyEaseInOut } from "./utils.js";

const MOVE_DIRECTIONS = {
  RIGHT: 0,
  LEFT: 1,
  UP: 2,
  DOWN: 3,
};
Object.freeze(MOVE_DIRECTIONS);

const QUARTER_POSITION = {
  LEFT: 0,
  TOP: 1,
  RIGHT: 2,
  BOTTOM: 3,
};

const copy_color = (color) => new Color(color.r, color.g, color.b, color.a);

class QuarterCircle {
  constructor(size, direction, color) {
    this._size = size;
    this._direction = direction;
    this._color = copy_color(color);

    this._start_color = color;
    this._current_color = copy_color(color);

    this._color_changed = false;
    this._cut = false;
  }

  setColor(color) {
    this._color = copy_color(color);
    this._color_changed = true;
  }

  updateColor(t) {
    if (!this._color_changed) return;

    const tt = polyEaseInOut(t, 3);
    this._current_color = this._start_color.mix(this._color, tt);

    if (tt >= 0.96) {
      this._color_changed = false;
      this._start_color = copy_color(this._color);
    }
  }

  show(ctx) {
    const x = this._size * Math.SQRT1_2;
    const y = (this._size / 2) * Math.SQRT2;
    const angle = (this._direction * Math.PI) / 2;

    ctx.save();
    ctx.rotate(angle);

    ctx.fillStyle = this._current_color.rgba;
    ctx.strokeStyle = this._current_color.rgba;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, 0);

    if (!this._cut) {
      ctx.arc(0, 0, this._size, -Math.PI / 4, Math.PI / 4);
    } else {
      ctx.lineTo(x, -y);
      ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  cut() {
    this._cut = true;
  }

  assemble() {
    this._cut = false;
  }

  get is_cut() {
    return this._cut;
  }

  get direction() {
    return this._direction;
  }

  set direction(direction) {
    this._direction = direction;
    while (this._direction < 0) this._direction += 4;
    while (this._direction >= 4) this._direction -= 4;
  }
}

class Circle {
  constructor(x, y, size, grid_size, color) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._grid_size = grid_size;
    this._color = copy_color(color);

    this._start_x = x;
    this._start_y = y;
    this._current_x = x * grid_size;
    this._current_y = y * grid_size;

    this._angle = 0;
    this._start_angle = 0;
    this._current_angle = 0;
    this._angle_changed = false;

    this._quarter_circles = new Array(4)
      .fill(null)
      .map(
        (_, i) =>
          new QuarterCircle(size / 2, Object.values(QUARTER_POSITION)[i], color)
      );
  }

  _mixColor(color1, color2, t) {
    const r = color1.r + (color2.r - color1.r) * t;
    const g = color1.g + (color2.g - color1.g) * t;
    const b = color1.b + (color2.b - color1.b) * t;
    const a = color1.a + (color2.a - color1.a) * t;
    return new Color(r, g, b, a);
  }

  updatePosition(t) {
    const tt = polyEaseInOut(t);

    const x =
      (this._start_x + (this._x - this._start_x) * tt + 0.5) * this._grid_size;
    const y =
      (this._start_y + (this._y - this._start_y) * tt + 0.5) * this._grid_size;

    this._current_x = x;
    this._current_y = y;
  }

  updateColor(t) {
    this._quarter_circles.forEach((q) => q.updateColor(t));
  }

  updateRotation(t) {
    if (!this._angle_changed) return;

    const tt = polyEaseInOut(t);
    this._current_angle =
      this._start_angle + (this._angle - this._start_angle) * tt;

    if (tt >= 0.96) {
      this._quarter_circles.forEach((q) =>
        this._angle > 0 ? q.direction++ : q.direction--
      );

      this._angle_changed = false;
      this._angle = 0;
      this._start_angle = 0;
      this._current_angle = 0;
    }
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._current_x, this._current_y);
    ctx.rotate(this._current_angle);

    this._quarter_circles.forEach((q) => q.show(ctx));

    ctx.restore();
  }

  setColor(color, direction) {
    const q = this._quarter_circles.find((q) => q.direction === direction);
    if (q === undefined) return;
    q.setColor(color);
  }

  setRotation(angle) {
    this._start_angle = this._angle;
    this._angle = angle;
    this._angle_changed = true;
  }

  cut(direction) {
    const q = this._quarter_circles.find((q) => q.direction === direction);
    if (q === undefined) return;
    q.cut();
  }

  move(direction) {
    this._start_x = this._x;
    this._start_y = this._y;

    switch (direction) {
      case MOVE_DIRECTIONS.RIGHT:
        this._x++;
        break;

      case MOVE_DIRECTIONS.LEFT:
        this._x--;
        break;

      case MOVE_DIRECTIONS.UP:
        this._y--;
        break;

      case MOVE_DIRECTIONS.DOWN:
        this._y++;
        break;
    }
  }

  moveRight() {
    this.move(MOVE_DIRECTIONS.RIGHT);
  }

  moveLeft() {
    this.move(MOVE_DIRECTIONS.LEFT);
  }

  moveUp() {
    this.move(MOVE_DIRECTIONS.UP);
  }

  moveDown() {
    this.move(MOVE_DIRECTIONS.DOWN);
  }

  getCut(direction) {
    const q = this._quarter_circles.find((q) => q.direction === direction);
    if (q === undefined) return false;
    return q.is_cut;
  }

  assemble(direction) {
    const q = this._quarter_circles.find((q) => q.direction === direction);
    if (q === undefined) return false;

    q.assemble();
    return true;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get is_cut() {
    return this._quarter_circles.some((q) => q.is_cut);
  }
}
export { Circle, MOVE_DIRECTIONS };
