import { Vector } from "./vectors.js";

class Drop {
  constructor(pos, r, color) {
    this._pos = pos;
    this._r = r;
    this._color = color;
    // compute the life as a function of the size
    this._life = this._r ** 2 * 4;
    this._start_life = this._life;
    this._size_factor = 1;

    // velocity and acceleration
    this._vel = new Vector(0, 0);
    this._acc = new Vector(0, 0);
  }

  update(update_vector, dt = 1) {
    // update the life and position
    this._acc = update_vector.copy();
    this._vel.add(this._acc).limit(2);
    this._pos.add(this._vel);

    this._life -= dt;
    this._size_factor = this._easeExp(this._life / this._start_life);
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this._color.rgb;
    ctx.beginPath();
    ctx.arc(
      this._pos.x,
      this._pos.y,
      this._r * this._size_factor,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  _easeExp(t, a = 2, b = 10) {
    return a ** -((1 - t) * b);
  }

  get dead() {
    return this._life <= 0;
  }

  get pos() {
    return this._pos;
  }
}

export { Drop };
