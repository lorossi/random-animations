import { XOR128, SimplexNoise } from "./lib.js";

class Tower {
  constructor(x, y, size, seed, noise_scl, scl, palette) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._seed = seed;
    this._noise_scl = noise_scl;
    this._scl = scl;
    this._palette = palette;

    this._baseline_set = false;

    this._circles_offsets = new Array(this._palette.length).fill(0);
    this._circles_baseline = new Array(this._palette.length).fill(0);

    this._noise = new SimplexNoise(this._seed);
    this._xor128 = new XOR128(this._seed);
  }

  update(tx, ty) {
    const offsets = this._circles_offsets.map((_, i) => {
      const n = this._noise.noise(
        tx,
        ty,
        this._x * this._noise_scl + i * 10,
        this._y * this._noise_scl + i * 10,
      );
      return n * Math.PI * 2;
    });

    this._circles_offsets = offsets.slice();
    if (!this._baseline_set) {
      this._baseline_set = true;
      this._starting_angle = this._xor128.random_int(8) * (Math.PI / 4);
      this._circles_baseline = offsets.slice();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl, this._scl);
    ctx.rotate(this._starting_angle);

    const max_radius = this._size / 2;
    const halving_factor = 1.45;
    this._circles_offsets.forEach((offset, i) => {
      const radius = max_radius / halving_factor ** i;
      const color = this._palette.getColor(i);
      const correct_offset =
        this._circles_offsets[i] - this._circles_baseline[i];

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = color.rgba;
      ctx.fill();

      ctx.rotate(correct_offset);
      ctx.translate(radius - (radius * halving_factor) / 2, 0);
    });

    ctx.restore();
  }
}

export { Tower };
