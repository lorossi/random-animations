class Particle {
  constructor(x, y, max_d, noise) {
    this._x = x;
    this._y = y;

    this._noise = noise;

    this._dx = 0;
    this._dy = 0;
    this._max_d = max_d;
    this._r = 1;
    this._noise_scl = 0.0025;
    this._time_scl = 2;
  }

  update(nx, ny) {
    const nnx = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      nx * this._time_scl,
      ny * this._time_scl
    );

    const nny = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      nx * this._time_scl + 1000,
      ny * this._time_scl + 1000
    );

    this._dx = nnx * this._max_d;
    this._dy = nny * this._max_d;

    const na = Math.sqrt(this._dx ** 2 + this._dy ** 2) / this._max_d;
    this._alpha = Math.cos((na * Math.PI) / 2) * 0.75 + 0.25;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = `rgba(240, 240, 240, ${this._alpha})`;
    ctx.beginPath();
    ctx.arc(this._x + this._dx, this._y + this._dy, this._r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export { Particle };
