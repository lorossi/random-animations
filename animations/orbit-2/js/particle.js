class Pos {
  constructor(rho, theta) {
    this._rho = rho;
    this._theta = theta;
  }

  get rho() {
    return this._rho;
  }

  get theta() {
    return this._theta;
  }

  get x() {
    return this._rho * Math.cos(this._theta);
  }

  get y() {
    return this._rho * Math.sin(this._theta);
  }
}

class Particle {
  constructor(noise, noise_seed, noise_scl, max_rho) {
    this._noise = noise;
    this._seed = noise_seed;
    this._noise_scl = noise_scl;
    this._max_rho = max_rho;

    this._rho = 0;
    this._theta = 0;
    this._offset = noise_seed % 1;

    this._pos = null;
    this._prev_pos = null;
  }

  move(t) {
    const tt = (t + this._offset) % 1;
    const tx = (1 + Math.cos(tt * Math.PI * 2)) * this._noise_scl;
    const ty = (1 + Math.sin(tt * Math.PI * 2)) * this._noise_scl;

    if (this._pos != null) this._prev_pos = this._pos;

    const n = this._noise.noise(tx, ty, this._seed);
    this._rho = ((n + 1) / 2) * this._max_rho;
    this._theta = tt * Math.PI * 2;

    this._pos = new Pos(this._rho, this._theta);
  }

  show(ctx) {
    if (this._prev_pos == null) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this._prev_pos.x, this._prev_pos.y);
    ctx.lineTo(this._pos.x, this._pos.y);
    ctx.stroke();
    ctx.restore();
  }
}

export { Particle };
