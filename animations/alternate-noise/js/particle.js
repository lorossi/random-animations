import { Vector } from "./vectors.min.js";

class Particle {
  constructor(w, h) {
    this._w = w;
    this._h = h;
  }

  initDependencies(random, noise, color, noise_scl) {
    this._random = random;
    this._noise = noise;
    this._color = color;
    this._noise_scl = noise_scl;

    const x = this._w / 2;
    const y = this._random.random(0, this._h);

    this._acc = new Vector(0, 0);
    this._vel = new Vector(0, 0);
    this._pos = new Vector(x, y);

    this._old_pos = null;
    this._max_speed = 2;

    this._start_life = this._w * 4;
    this._life = this._start_life;
  }

  move() {
    if (this._dead) return;

    const n1 = this._noise.noise(
      this._pos.x * this._noise_scl,
      this._pos.y * this._noise_scl,
      0
    );

    const n2 = this._noise.noise(
      this._pos.x * this._noise_scl,
      this._pos.y * this._noise_scl,
      1e9
    );

    const rho = n1 / 2 + 0.5;
    const theta = n2 * Math.PI * 2;

    this._old_pos = this._pos.copy();

    this._acc = Vector.fromAngle2D(theta).setMag(rho);
    this._vel.add(this._acc);
    this._vel.limit(this._max_speed);
    this._pos.add(this._vel);

    this._life--;
  }

  show(ctx) {
    if (this._old_pos == null) return;

    const x = Math.floor(this._pos.x);
    const y = Math.floor(this._pos.y);

    const a = this._currentAlpha();
    const ch = Math.floor(this._color.r);

    ctx.save();
    ctx.strokeStyle = `rgba(${ch}, ${ch}, ${ch}, ${a})`;
    ctx.beginPath();
    ctx.moveTo(this._old_pos.x, this._old_pos.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
  }

  _rescale(x, min_in, max_in, min_out, max_out) {
    return ((x - min_in) * (max_out - min_out)) / (max_in - min_in) + min_out;
  }

  _polyEaseOut(t, n = 3) {
    return 1 - (1 - t) ** n;
  }

  _currentAlpha() {
    const t = this._life / this._start_life;
    const tp = this._polyEaseOut(t, 3);
    return this._rescale(tp, 0, 1, 0, 0.1);
  }

  get alive() {
    return this._life > 0;
  }
}

export { Particle };
