import { CirclePoint } from "./circle-point.js";

class Circle {
  constructor(x, y, radius) {
    this._x = x;
    this._y = y;
    this._radius = radius;

    this._points = [];
  }

  initDependencies(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;
  }

  setColor(color) {
    this._color = color;
  }

  setAttributes(points_num, circle_scl, inner_r, noise_scl, time_scl) {
    this._points_num = points_num;
    this._circle_scl = circle_scl;
    this._circle_inner_r = inner_r;
    this._noise_scl = noise_scl;
    this._time_scl = time_scl;
  }

  init() {
    this._points = new Array(this._points_num).fill(0).map(() => {
      const r = this._xor128.random();
      const rho =
        this._expEaseOut(r, 10) * this._radius * (1 - this._circle_inner_r) +
        this._circle_inner_r * this._radius;
      const theta = this._xor128.random(Math.PI * 2);

      return CirclePoint.fromPolar(rho, theta);
    });
    this._seed = this._xor128.random(1e9);
  }

  update(t) {
    const theta = Math.PI * 2 * t;
    const tx = (1 + Math.cos(theta)) * this._time_scl;
    const ty = (1 + Math.sin(theta)) * this._time_scl;

    this._displacements = this._points.map((p) => {
      const n1 = this._noise.noise(
        p.x * this._noise_scl,
        p.y * this._noise_scl,
        tx + this._seed,
        ty + this._seed
      );
      const n2 = this._noise.noise(
        p.x * this._noise_scl,
        p.y * this._noise_scl,
        tx + this._seed + 1000,
        ty + this._seed + 1000
      );

      const nx = this._clampR(
        p.x + n1 * this._radius * (1 - this._circle_inner_r)
      );
      const ny = this._clampR(
        p.y + n2 * this._radius * (1 - this._circle_inner_r)
      );

      const theta = Math.atan2(ny, nx);
      const rho = Math.min(Math.sqrt(nx ** 2 + ny ** 2), this._radius);
      return CirclePoint.fromPolar(rho, theta);
    });
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.scale(this._circle_scl, this._circle_scl);

    ctx.fillStyle = this._color.rgba;
    this._points.forEach((_, i) => {
      const pos = this._displacements[i];
      // set the alpha to be inversely proportional to the distance
      const dist =
        (pos.rho - this._radius * this._circle_inner_r) /
        (this._radius * (1 - this._circle_inner_r));
      const alpha = this._expEaseOut(dist, 4) * 0.75;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(pos.x, pos.y);
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  _expEaseOut(x, n = 5) {
    return 1 - Math.exp(-n * x);
  }

  _clampR(r) {
    return Math.max(-this._radius, Math.min(r, this._radius));
  }
}

export { Circle };
