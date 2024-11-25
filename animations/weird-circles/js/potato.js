import { SimplexNoise } from "./engine.js";

class Potato {
  constructor(x, y, radius, noise_seed) {
    this._x = x;
    this._y = y;
    this._radius = radius;
    this._noise_seed = noise_seed;

    this._noise = new SimplexNoise(this._noise_seed);
  }

  _getPoints(max_dr) {
    return new Array(128).fill(0).map((_, i) => {
      const angle = (i / 128) * Math.PI * 2;
      const nx = 0.5 * (1 + Math.cos(angle));
      const ny = 0.5 * (1 + Math.sin(angle));

      const noise = this._noise.noise(nx, ny);
      const dr = this._radius * max_dr * noise;

      const x = (this._radius + dr) * Math.cos(angle);
      const y = (this._radius + dr) * Math.sin(angle);
      return [x, y];
    });
  }

  show(ctx, dr = 1 / 16) {
    ctx.beginPath();
    this._getPoints(dr).forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(this._x + x, this._y + y);
      else ctx.lineTo(this._x + x, this._y + y);
    });
    ctx.closePath();
    ctx.clip();
    ctx.fill();
  }
}

export { Potato };
