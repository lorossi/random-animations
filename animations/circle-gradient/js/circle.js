const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

class Circle {
  constructor(x, y, size, min_r, max_r, noise_scl, noise, palette) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._min_r = min_r;
    this._max_r = max_r;
    this._noise_scl = noise_scl;
    this._noise = noise;
    this._palette = palette;

    this._dx = 0;
    this._dy = 0;
    this._r = this._min_r;
    this._c = 0.5;
  }

  update(tx, ty) {
    const n1 = this._noise.noise(
      this._x * this._noise_scl + tx,
      this._y * this._noise_scl + ty,
      1000,
    );
    const n2 = this._noise.noise(
      this._x * this._noise_scl + tx,
      this._y * this._noise_scl + ty,
      2000,
    );
    const rho = (n1 + 1) * 0.5 * (this._max_r - this._min_r) + this._min_r;
    const theta = (n2 + 1) * 0.5 * Math.PI * 2;

    this._dx = rho * Math.cos(theta);
    this._dy = rho * Math.sin(theta);

    const n3 = this._noise.noise(
      this._x * this._noise_scl + tx,
      this._y * this._noise_scl + ty,
      3000,
    );

    this._r = (n3 + 1) * 0.5 * (this._max_r - this._min_r) * 2 + this._min_r;

    const n4 = this._noise.noise(
      this._x * this._noise_scl + tx,
      this._y * this._noise_scl + ty,
      4000,
    );

    const total_dist = this._y / this._size;
    const c = total_dist + n4 * 0.1;
    this._c = clamp(c, 0, 1);
  }

  show(ctx) {
    const c = this._palette.getSmoothColor(this._c).copy();
    c.a = 0.7;

    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.fillStyle = c.rgba;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this._dx, this._dy, this._r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export { Circle };
