class Particle {
  constructor(x, y, max_d, fg, noise, noise_scl) {
    this._x = x;
    this._y = y;
    this._max_d = max_d;
    this._fg = fg;
    this._noise = noise;
    this._noise_scl = noise_scl;

    this._dx = 0;
    this._dy = 0;
    this._r = 1;
    this._time_scl = 2;
  }

  update(nx, ny) {
    const nnx = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      nx * this._time_scl,
      ny * this._time_scl,
    );

    const nny = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      nx * this._time_scl + 1000,
      ny * this._time_scl + 1000,
    );

    this._dx = nnx * this._max_d;
    this._dy = nny * this._max_d;

    const na = Math.hypot(this._dx, this._dy) / this._max_d;
    this._alpha = Math.cos((na * Math.PI) / 2) * 0.75 + 0.25;
  }

  draw(ctx) {
    const c = this._fg.copy();
    c.a = this._alpha;

    ctx.save();
    ctx.fillStyle = c.rgba;
    ctx.translate(this._x + this._dx, this._y + this._dy);
    ctx.beginPath();
    ctx.arc(0, 0, this._r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export { Particle };
