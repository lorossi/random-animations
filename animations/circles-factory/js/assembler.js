import { Color } from "./engine.js";
import { trigEaseInOut } from "./utils.js";

const ASSEMBLE_SIDE = {
  LEFT: 0,
  TOP: 1,
  RIGHT: 2,
  BOTTOM: 3,
};
Object.freeze(ASSEMBLE_SIDE);

class Assembler {
  constructor(
    x,
    y,
    grid_size,
    circle_size,
    circle_color,
    assemble_side = ASSEMBLE_SIDE.BOTTOM
  ) {
    this._x = x;
    this._y = y;
    this._grid_size = grid_size;
    this._circle_size = circle_size;
    this._assemble_side = assemble_side;
    this._circle_color = circle_color;

    this._fill = Color.fromMonochrome(100, 0.8);
    this._stroke = Color.fromMonochrome(32);
    this._scl = 0.8;
    this._dx = 0;
  }

  update(t) {
    const a = (this._grid_size * this._scl - this._circle_size) / 2;
    const tt = 1 - trigEaseInOut(t, 5);
    this._dx = a * tt;
  }

  show(ctx) {
    ctx.save();
    ctx.translate(
      (this._x + 0.5) * this._grid_size,
      (this._y + 0.5) * this._grid_size
    );

    ctx.save();
    ctx.fillStyle = this._fill.rgba;
    ctx.lineWidth = 2;

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
    ctx.fillStyle = this._circle_color.rgba;
    ctx.strokeStyle = this._circle_color.rgba;
    ctx.rotate((Math.PI / 2) * this._assemble_side + Math.PI);

    ctx.beginPath();
    ctx.arc(this._dx, 0, this._circle_size / 2, -Math.PI / 4, Math.PI / 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get direction() {
    return this._assemble_side;
  }

  get circle_assembled_side() {
    return Object.values(ASSEMBLE_SIDE)[(this._assemble_side + 2) % 4];
  }
}

export { Assembler, ASSEMBLE_SIDE };
