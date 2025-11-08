import { SimplexNoise } from "./engine.js";

class NoiseDetails {
  constructor(seed, delta_seed_x, delta_seed_y, scale) {
    this.seed = seed;
    this.delta_seed_x = delta_seed_x;
    this.delta_seed_y = delta_seed_y;
    this.scale = scale;
  }
}

class Circle {
  constructor(theta, radius, max_dist, speed, palette) {
    this._theta = theta;
    this._radius = radius;
    this._max_dist = max_dist;
    this._speed = speed;
    this._palette = palette;

    this._r = 0;
    this._dr = 0;
    this._outside = false;
    this._noise = new SimplexNoise();
  }

  setNoiseDetails(noise_details) {
    this._noise_details = noise_details;
    this._noise = new SimplexNoise(this._noise_details.seed);
  }

  _generateNoise(x, y, layer) {
    return this._noise.noise(
      x * this._noise_details.scale + this._noise_details.delta_seed_x,
      y * this._noise_details.scale + this._noise_details.delta_seed_y,
      layer
    );
  }

  update() {
    this._r += this._speed;
  }

  draw(ctx) {
    if (this._outside) return;

    const x = this._r * Math.cos(this._theta);
    const y = this._r * Math.sin(this._theta);

    const n1 = this._generateNoise(x, y, 1000);
    const dtheta = n1 * 4 * Math.PI;

    const n2 = this._generateNoise(x, y, 2000);
    const dr = n2 * 3 * this._radius;

    const dx = dr * Math.cos(dtheta);
    const dy = dr * Math.sin(dtheta);

    const t = (this._r + this._radius) / this._max_dist;
    const n3 = this._generateNoise(x, y, 3000);

    const dt = n3 * 0.2;
    const fill_c = this._palette.getSmoothColor(this._clamp(t + dt));

    ctx.save();
    ctx.rotate(this._theta);
    ctx.translate(this._r, 0);
    ctx.translate(dx, dy);

    ctx.fillStyle = fill_c.rgba;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(0, 0, this._radius, 0, 2 * Math.PI, false);

    ctx.fill();

    ctx.restore();

    this._outside = Math.hypot(x + dx, y + dy) - this._radius > this._max_dist;
  }

  get ended() {
    return this._outside;
  }

  _clamp(x) {
    return Math.min(1, Math.max(0, x));
  }
}

export { Circle, NoiseDetails };
