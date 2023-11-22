import { Color } from "./engine.js";

class PeriodicPoint {
  constructor(x, y, r, n, duration, xor128) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._n = n;
    this._duration = duration;
    this._xor128 = xor128;
    this._colors = [
      Color.fromHEX("#FFFF00"),
      Color.fromHEX("#00FFFF"),
      Color.fromHEX("#FF00FF"),
      Color.fromHEX("#FFFFFF"),
    ];

    const harmonics = new Array(n)
      .fill(0)
      .map(() => [
        this._xor128.random_int(1, 4),
        this._xor128.random(Math.PI * 2),
        this._xor128.random(0.1, 1),
      ]);

    this._rt = new Array(this._duration).fill(0).map((_, i) => {
      const t = (i / this._duration) * Math.PI * 2;
      const s = harmonics.reduce(
        (acc, h) => acc * h[2] * Math.sin(h[0] * t + h[1]),
        1
      );

      return this._easeOut(Math.abs(s));
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
    ctx.translate(this._x, this._y);
    this._colors.forEach((c, i) => {
      const theta = (i / (this._colors.length + 1)) * Math.PI * 2;
      ctx.rotate(theta);
      ctx.translate(r * 0.1, 0);
      ctx.fillStyle = c.rgba;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    });
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
