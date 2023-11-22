class Segment {
  constructor(x, y, scl) {
    this._x = x;
    this._start_y = y;
    this._scl = scl;

    this._y = 0;
    this._created = false;
  }

  setAttributes(palette, seed, noise_scl, angle, max_x) {
    this._palette = palette;
    this._seed = seed;
    this._noise_scl = noise_scl;
    this._angle = angle;
    this._max_x = max_x;
  }

  initDependencies(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;
  }

  update() {
    if (!this._created) {
      this._max_life = this._xor128.random(10, this._max_x);
      this._life = this._max_life;
      this._dy = this._xor128.random_int(3, 10);
      this._created = true;
    } else {
      this._life -= this._dy;
      this._y += this._dy;
    }

    const n = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      this._seed
    );
    const i = Math.floor(((n + 1) / 2) * this._palette.length);
    this._color = this._palette[i];
  }

  split() {
    return this;
  }

  show(ctx) {
    if (this._life < 0) return;

    ctx.save();
    ctx.rotate(this._angle);
    ctx.translate(this._x, this._y);

    ctx.strokeStyle = this._color.rgba;
    ctx.globalAlpha = 0.75 * this._easeOutPoly(this._life / this._max_life);

    new Array(4)
      .fill(0)
      .map((_, i) => i)
      .forEach((sign) => {
        const dx = this._xor128.random_interval(0, 0.5) * this._scl;
        const dy = this._xor128.random_interval(0, 0.25) * this._scl;
        ctx.save();
        ctx.rotate(this._angle + Math.PI * sign);
        ctx.translate(dx, dy);
        this._drawLine(ctx);
        ctx.restore();
      });

    ctx.restore();
  }

  _drawLine(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this._scl, 0);
    ctx.stroke();
  }

  _easeOutPoly(x, n = 5) {
    return 1 - (1 - x) ** n;
  }

  get alive() {
    return this._life > 0;
  }
}

export { Segment };
