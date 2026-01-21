import { Point } from "./lib.js";

class Ribbon {
  constructor(x, y, points_num, container_size, initial_direction, max_width) {
    this._x = x;
    this._y = y;
    this._points_num = points_num;
    this._container_size = container_size;
    this._direction = initial_direction;
    this._max_width = max_width;

    this._points = [new Point(x, y)];
    this._ended = false;
    this._age = 0;

    this._updateHeading();

    this._period =
      (container_size * Math.SQRT2 * 2) / Math.hypot(...initial_direction);
  }

  _updateHeading() {
    this._heading = Math.atan2(this._direction[1], this._direction[0]);
  }

  setColors(line_color, bg_color) {
    this._line_color = line_color;
    this._bg_color = bg_color;
  }

  preload(steps) {
    for (let i = 0; i < steps; i++) this.update();

    this._ended = false;
    this._age = 0;
  }

  update() {
    const head = this._points[0];
    const next = head.copy();
    next.x += this._direction[0];
    next.y += this._direction[1];

    if (next.x < 0 || next.x > this._container_size) {
      this._direction[0] *= -1;
      this._updateHeading();
    }
    if (next.y < 0 || next.y > this._container_size) {
      this._direction[1] *= -1;
      this._updateHeading();
    }
    this._points.unshift(next);

    if (this._points.length > this._points_num) this._points.pop();
    this._age += 1;
    if (this._age >= this._period) this._ended = true;
  }

  draw(ctx) {
    const line_points = new Array(this._points.length - 1)
      .fill({})
      .map((_, i) => {
        const size = (1 - i / this._points.length) * this._max_width;
        return {
          from: this._points[i],
          to: this._points[i + 1],
          size: size,
        };
      });

    // draw background
    ctx.strokeStyle = this._bg_color.rgba;
    ctx.lineCap = "round";
    line_points.forEach(({ from, to, size }) => {
      ctx.lineWidth = size + this._max_width;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });

    // draw colored line
    ctx.strokeStyle = this._line_color.rgba;
    line_points.forEach(({ from, to, size }) => {
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });
  }

  get ended() {
    return this._ended;
  }

  get period() {
    return this._period;
  }

  _easeExp(t, p = 10) {
    return t == 0 ? 0 : Math.pow(2, p * (t - 1));
  }
}

export { Ribbon };
