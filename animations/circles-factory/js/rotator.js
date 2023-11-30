import { Color } from "./engine.js";
import { polyEaseInOut } from "./utils.js";

const ROTATOR_DIRECTION = {
  CLOCKWISE: 1,
  COUNTER_CLOCKWISE: -1,
};
Object.freeze(ROTATOR_DIRECTION);

class Rotator {
  constructor(
    x,
    y,
    grid_size,
    circle_size,
    direction = ROTATOR_DIRECTION.CLOCKWISE
  ) {
    this._x = x;
    this._y = y;
    this._grid_size = grid_size;
    this._circle_size = circle_size;
    this._direction = direction;

    this._fill = Color.fromMonochrome(100, 0.8);
    this._stroke = Color.fromMonochrome(64);
    this._scl = 0.8;
    this._angle = (Math.PI / 2) * direction;
    this._current_angle = 0;
  }

  update(t) {
    const tt = polyEaseInOut(t);
    this._current_angle = this._angle * tt;

    if (tt > 0.96) {
      this._current_angle = 0;
    }
  }

  show(ctx) {
    ctx.save();
    ctx.translate(
      (this._x + 0.5) * this._grid_size,
      (this._y + 0.5) * this._grid_size
    );
    ctx.rotate(this._current_angle);

    ctx.fillStyle = this._fill.rgba;
    ctx.beginPath();
    ctx.arc(0, 0, (this._grid_size / 2) * this._scl, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);
      ctx.strokeStyle = this._stroke.rgba;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, (-this._grid_size / 2) * this._scl);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get angle() {
    return this._angle;
  }

  get direction() {
    return this._direction;
  }
}

export { Rotator, ROTATOR_DIRECTION };
