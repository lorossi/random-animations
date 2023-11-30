import { Vector } from "./vectors.js";

class Drop {
  constructor(x, y, r) {
    this._pos = new Vector(x, y);
    this._r = r;
    this._g = new Vector(0, 0.1);
    this._vel = new Vector(0, 0);
    this._acc = new Vector(0, 0);

    this._maxSpeed = 10;
    this._maxAcceleration = 2;
  }

  setColor(color, alpha = 1) {
    this._color = color;
    this._alpha = alpha;
  }

  update(dt) {
    const scaled_dt = dt / (1000 / 60); // relative to 60 fps
    const scaled_g = this._g.copy().mult(scaled_dt);

    this._acc.add(scaled_g);
    this._acc.limit(this._maxAcceleration);
    this._vel.add(this._acc);
    this._vel.limit(this._maxSpeed);
    this._pos.add(this._vel);
    this._acc.mult(0);
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._pos.x, this._pos.y);
    ctx.rotate(this._vel.heading2D() + Math.PI / 2);

    ctx.globalAlpha = this._alpha;
    ctx.fillStyle = this._color.rgba;

    const p = new Path2D();
    p.arc(0, 0, this._r, Math.PI, 0);
    p.moveTo(0, this._r * 2);
    p.lineTo(-this._r, 0);
    p.lineTo(this._r, 0);
    p.closePath();

    ctx.fill(p, "evenodd");

    ctx.restore();
  }

  setPos(pos) {
    this._pos = pos.copy();
  }

  setVel(vel) {
    this._vel = vel.copy();
  }

  applyForce(force) {
    this._acc.add(force);
  }

  get x() {
    return this._pos.x;
  }

  get y() {
    return this._pos.y;
  }

  get h() {
    return this._h;
  }

  get pos() {
    return this._pos.copy();
  }

  get vel() {
    return this._vel.copy();
  }
}

export { Drop };
