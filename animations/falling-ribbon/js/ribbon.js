import { XOR128, SimplexNoise } from "./lib.js";

class Ribbon {
  constructor(max_width, height, color, seed, dy, noise_scl) {
    this._max_width = max_width;
    this._height = height;
    this._color = color;
    this._seed = seed;
    this._dy = dy;
    this._noise_scl = noise_scl;

    this._y = 0;
    this._xor128 = new XOR128(this._seed);
    this._simplex = new SimplexNoise(this._seed);
    this._widths = [];
  }

  update() {
    if (this.ended) {
      return;
    }

    const n1 = this._simplex.noise(this._y * this._noise_scl, 1000);
    const dx1 = ((n1 + 1) / 2) * this._max_width;
    this._widths.unshift(dx1);
    this._y += this._dy;
  }

  show(ctx, x = 0) {
    if (this.ended || this._widths.length == 0) return;

    ctx.save();
    ctx.translate(x, this._y);
    ctx.strokeStyle = this._color.rgba;
    ctx.lineWidth = this._dy + 1;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this._widths[0], 0);
    ctx.stroke();

    ctx.restore();
  }

  get ended() {
    return this._y > this._height;
  }

  get width() {
    return this._widths[0];
  }

  get left() {
    // wtf
    const n = this._simplex.noise(this._y * this._noise_scl, 2000);
    return n * this._max_width;
  }
}

export { Ribbon };
