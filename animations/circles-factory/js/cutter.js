import { Color } from "./engine.js";
import { trigEaseInOut } from "./utils.js";

const CUT_SIDE = {
  LEFT: 0,
  TOP: 1,
  RIGHT: 2,
  BOTTOM: 3,
};

Object.freeze(CUT_SIDE);

class Cutter {
  constructor(x, y, grid_size, circle_size, side = CUT_SIDE.RIGHT) {
    this._x = x;
    this._y = y;
    this._grid_size = grid_size;
    this._circle_size = circle_size;
    this._side = side;

    this._color = Color.fromMonochrome(64);
    this._bg = Color.fromMonochrome(100, 0.8);
    this._scl = 0.8;

    this._length = 0;
  }

  update(t) {
    const tt = trigEaseInOut(t, 15);
    this._length = this._grid_size * this._scl * tt;
  }

  show(ctx) {
    ctx.save();
    ctx.translate(
      (this._x + 0.5) * this._grid_size,
      (this._y + 0.5) * this._grid_size
    );

    ctx.fillStyle = this._bg.rgba;
    ctx.beginPath();
    ctx.rect(
      (-this._grid_size / 2) * this._scl,
      (-this._grid_size / 2) * this._scl,
      this._grid_size * this._scl,
      this._grid_size * this._scl
    );
    ctx.fill();

    const square_side = (this._circle_size / 2) * Math.SQRT1_2 * this._scl;
    const w = (square_side - this._circle_size) / 2;

    ctx.rotate(this._side * (Math.PI / 2));
    ctx.translate(
      -(this._grid_size / 2) * this._scl - w,
      -(this._grid_size / 2) * this._scl
    );
    ctx.fillStyle = this._color.rgba;
    ctx.beginPath();
    ctx.rect(0, 0, w, this._length);
    ctx.fill();

    ctx.restore();
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get side() {
    return this._side;
  }

  get circle_cut_side() {
    return Object.values(CUT_SIDE)[(this._side + 2) % 4];
  }
}

export { Cutter, CUT_SIDE };
