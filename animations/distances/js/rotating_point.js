import { Color, Point } from "./lib.js";

class RotatingPoint {
  constructor(x, y, r, dir, dt, strength = 1) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._dir = dir;
    this._dt = dt;
    this._strength = strength;

    this._t = 0;
  }

  update(t) {
    this._t = t;
  }

  get_xy() {
    const theta = (this._t * this._dir + this._dt) * 2 * Math.PI;
    const x = this._x + this._r * Math.cos(theta);
    const y = this._y + this._r * Math.sin(theta);

    return new Point(x, y);
  }

  show(ctx, scl) {
    const pp = this.get_xy();
    const ppx = Math.floor(pp.x / scl) * scl;
    const ppy = Math.floor(pp.y / scl) * scl;

    ctx.save();
    const c = Color.fromCSS("red");
    ctx.fillStyle = c.rgba;
    ctx.fillRect(ppx, ppy, scl, scl);
    ctx.restore();
  }
  get strength() {
    return this._strength;
  }
}

export { RotatingPoint };
