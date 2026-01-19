class Line {
  constructor(r, w, color, direction) {
    this._r = r;
    this._w = w;
    this._color = color;
    this._direction = direction;

    this._length = 0;
    this._rotation = 0;
  }

  setAttributes(time_scl, points_num) {
    this._time_scl = time_scl;
    this._points_num = points_num;
  }

  initDependencies(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;

    this._angle = this._xor128.random(Math.PI * 2);
    this._seed = this._xor128.random(1e9);
  }

  update(t) {
    const a = Math.PI * 2 * t;
    const tx = (1 + Math.cos(a)) * this._time_scl;
    const ty = (1 + Math.sin(a)) * this._time_scl;

    const n = this._noise.noise(tx, ty, this._seed);
    this._length = this._rescale(n, -1, 1, 0.1, 0.9) * Math.PI + Math.PI / 18;
    this._rotation = t * Math.PI * 2;
  }

  show(ctx) {
    ctx.save();
    if (this._direction == -1) ctx.scale(-1, 1);

    ctx.rotate(this._angle + this._rotation);

    for (let i = 0; i < this._points_num; i++) {
      ctx.save();
      const a = this._xor128.random();
      const eased_a = this._polyEaseIn(1 - a);
      const an = eased_a * this._length;
      const dr = this._xor128.random_interval(0, 0.025) * this._r * eased_a;

      ctx.rotate(an * -1);

      ctx.translate(0, this._r + dr);

      ctx.beginPath();
      ctx.arc(0, 0, this._w / 2, 0, Math.PI * 2);
      ctx.fillStyle = this._color.rgba;
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  _rescale(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }

  _polyEaseIn(x, n = 4) {
    return x ** n;
  }

  _expEaseIn(x, n = 4) {
    return Math.exp(n * x - n);
  }
}

export { Line };
