import { XOR128, SimplexNoise } from "./lib.js";

class Box {
  constructor(x, y, size, angle_radius, scale) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._angle_radius = angle_radius;
    this._scale = scale;

    this._palette = ["black"];
    this._bg_color = "white";

    this._random_seed = 1;
    this._noise_seed = 1;
    this._noise_scl = 0.1;
    this._xor128 = new XOR128(this._random_seed);
    this._noise = new SimplexNoise(this._noise_seed);
  }

  setBgColor(bg_color) {
    this._bg_color = bg_color;
  }

  setRandomSeed(seed) {
    this._random_seed = seed;
    this._xor128 = new XOR128(this._random_seed);
  }

  setNoiseSeed(seed) {
    this._noise_seed = seed;
    this._noise = new SimplexNoise(this._noise_seed);
  }

  setNoiseScl(noise_scl) {
    this._noise_scl = noise_scl;
  }

  setPalette(palette) {
    this._palette = palette;
  }

  draw(ctx) {
    ctx.save();
    const palette_n = this._noise_range(this._palette.length, 1000);

    const fill_color = this._palette.getColor(palette_n);

    const clip_region = new Path2D();
    clip_region.roundRect(
      -this._size / 2,
      -this._size / 2,
      this._size,
      this._size,
      this._angle_radius,
    );

    ctx.save();
    ctx.fillStyle = fill_color.rgba;
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scale, this._scale);

    ctx.beginPath();
    ctx.clip(clip_region);

    // bounding box
    ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
    ctx.fill();

    // hole
    for (let i = 0; i < this._xor128.random_int(1, 4); i++)
      this._carveHole(ctx, fill_color);

    ctx.restore();
    ctx.restore();
  }

  _carveHole(ctx) {
    const x = this._xor128.random_interval(0, this._size / 2);
    const y = this._xor128.random_interval(0, this._size / 2);
    const r = this._xor128.random(this._size / 16, this._size / 2);

    ctx.fillStyle = this._bg_color.rgba;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  _noise_range(max, seed = 0) {
    const n = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      seed,
    );
    return Math.floor(((n + 1) / 2) * max);
  }

  _clamp(x, min = 0, max = 1) {
    return Math.min(Math.max(x, min), max);
  }
}

export { Box };
