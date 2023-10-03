class PeriodicPoint {
  constructor(x, y, r, n, duration, xor128) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._n = n;
    this._duration = duration;
    this._xor128 = xor128;

    const harmonics = new Array(n)
      .fill(0)
      .map(() => [
        this._xor128.random(10) * Math.PI,
        this._xor128.random(Math.PI * 2),
      ]);

    this._rt = new Array(this._duration).fill(0).map((_, i) => {
      const t = i / this._duration;
      const s = harmonics.reduce(
        (acc, h) => acc * Math.cos(h[0] * t + h[1]),
        1
      );

      return this._easeOut(s);
    });

    const rt_min = Math.min(...this._rt);
    const rt_max = Math.max(...this._rt);
    this._rt = this._rt.map((rt) =>
      this._rescale(rt, rt_min, rt_max, 0, this._r)
    );
  }

  show(ctx, t) {
    const r = this._rt[Math.floor(t * this._duration)];

    ctx.save();
    ctx.fillStyle = "rgb(245, 245, 245)";
    ctx.translate(this._x, this._y);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _easeOut(t, n = 2) {
    return 1 - Math.pow(1 - t, n);
  }

  _rescale(t, in_min, in_max, out_min = 0, out_max = 1) {
    return ((t - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min;
  }
}

export { PeriodicPoint };
