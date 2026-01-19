import { XOR128, SimplexNoise } from "./lib.js";

class Rect {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  list() {
    return [this.x, this.y, this.w, this.h];
  }
}

class Barcode {
  constructor(rect, random_seed, noise_seed, color) {
    this._rect = rect;
    this._seed = random_seed;
    this._noise_seed = noise_seed;
    this._color = color;

    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._noise_seed);

    let a = 4;
    let b = Math.max(a + 1, this._rect.w / 10);
    this._step_size = this._xor128.random_int(a, b);
    this._empty = this._xor128.random() < 0.4;
    this._dh = this._xor128.random_int(-10, 10);
    this._dw = this._xor128.random_int(-10, 10);
    this._rotation = this._xor128.random_interval(0, Math.PI / 180);

    this._noise_scl = 0.001;
  }

  draw(ctx) {
    if (this._empty) return;

    ctx.save();
    ctx.translate(this._rect.x, this._rect.y);
    ctx.rotate(this._rotation);

    const y = this._rect.y;

    for (
      let x = 0 + this._dw;
      x < this._rect.w + this._dw;
      x += this._step_size
    ) {
      const n1 = this._noise.noise(
        x * this._noise_scl,
        y * this._noise_scl,
        1000,
      );
      const w = Math.floor(((n1 + 1) / 2) * this._step_size);

      ctx.fillRect(x, 0, w, this._rect.h + this._dh);
    }

    ctx.restore();
  }
}

export { Rect, Barcode };
