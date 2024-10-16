import { Point } from "./engine.js";

class Shape {
  constructor(size, time_scl, fill, point_fill, noise, rng) {
    this._size = size;
    this._time_scl = time_scl;
    this._fill = fill;
    this._point_fill = point_fill;
    this._noise = noise;
    this._rng = rng;

    this._seed = this._rng.random_int(1e5);

    this._points = new Array(3).fill(null).map((_, i) => {
      if (i == 2) {
        // top
        return new Point(0, -0.5);
      }
      // left or right
      const x = (i === 0 ? -0.5 : 0.5) * this._rng.random_interval(1, 0.05);
      const y = 0.5;
      return new Point(x, y);
    });
  }

  update(t) {
    const theta = t * Math.PI * 2;
    const nx = (this._time_scl * (1 + Math.cos(theta))) / 2;
    const ny = (this._time_scl * (1 + Math.sin(theta))) / 2;

    const n = this._noise.noise(nx, ny, this._seed);
    const phi = this._remap(n, -1, 1, 0, -Math.PI);
    const x = 0.5 * Math.cos(phi);
    const y = Math.sin(phi) + 0.5;
    this._points[2] = new Point(x, y);
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this._fill.rgba;

    ctx.beginPath();
    for (let i = 0; i < this._points.length; i++) {
      const p = this._points[i];
      if (i === 0) ctx.moveTo(p.x * this._size, p.y * this._size);
      else ctx.lineTo(p.x * this._size, p.y * this._size);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this._point_fill.rgba;
    ctx.beginPath();
    ctx.arc(
      this._points[2].x * this._size,
      this._points[2].y * this._size,
      2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }

  _remap(x, old_min, old_max, new_min, new_max) {
    return (
      ((x - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min
    );
  }
}

export { Shape };
