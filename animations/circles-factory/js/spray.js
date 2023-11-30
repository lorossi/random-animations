import { Color } from "./engine.js";
import { trigEaseInOut } from "./utils.js";

const SPRAY_DIRECTION = {
  RIGHT: 2,
  BOTTOM: 3,
  LEFT: 0,
  TOP: 1,
};
Object.freeze(SPRAY_DIRECTION);

class Spray {
  constructor(
    x,
    y,
    grid_size,
    circle_size,
    color,
    direction = SPRAY_DIRECTION.RIGHT
  ) {
    this._x = x;
    this._y = y;
    this._grid_size = grid_size;
    this._circle_size = circle_size;
    this._spray_color = color;
    this._direction = direction;

    this._dx = 0;
    this._scl = 0.8;

    this._body_color = color;
    this._bg_color = Color.fromMonochrome(100, 0.8);
  }

  update(t) {
    const a = trigEaseInOut(t);
    this._dx = (a * this._grid_size) / 2;

    if (t > 0.96) {
      this._dx = 0;
    }
  }

  show(ctx) {
    ctx.save();
    ctx.translate(
      (this._x + 0.5) * this._grid_size,
      (this._y + 0.5) * this._grid_size
    );

    ctx.save();
    ctx.fillStyle = this._bg_color.rgba;

    ctx.beginPath();
    ctx.rect(
      (-this._grid_size / 2) * this._scl,
      (-this._grid_size / 2) * this._scl,
      this._grid_size * this._scl,
      this._grid_size * this._scl
    );
    ctx.fill();
    ctx.restore();

    ctx.save();

    const w = (this._grid_size * this._scl - this._circle_size) / 2;
    ctx.rotate((Math.PI / 2) * this._direction);
    ctx.translate(
      -(this._grid_size / 2) * this._scl - w,
      -(this._grid_size / 2) * this._scl
    );

    ctx.fillStyle = this._body_color.rgba;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.rect(this._dx, 0, w, this._grid_size * this._scl);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  get color() {
    return this._spray_color;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get direction() {
    return this._direction;
  }

  get circle_spray_side() {
    return Object.values(SPRAY_DIRECTION)[this._direction];
  }
}

export { Spray, SPRAY_DIRECTION };
