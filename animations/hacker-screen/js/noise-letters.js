import { XOR128, SimplexNoise } from "./lib.js";
import { Layer } from "./layer.js";

class NoiseLetters extends Layer {
  constructor(x, y, size, fg_color, seed, cols, omega, scl) {
    super();
    this._x = x;
    this._y = y;
    this._size = size;
    this._fg_color = fg_color;
    this._cols = cols;
    this._omega = omega;
    this._scl = scl;

    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e16));
    this._noise_scl = 5;
    this._noise_radius = 0.25;

    this.theta = 0;

    this.phi = this._xor128.random(Math.PI * 2);

    this._letter_size = this._size / this._cols;
  }

  show(ctx) {
    const nx = (1 + Math.sin(this.theta)) * this._noise_radius;
    const ny = (1 + Math.cos(this.theta)) * this._noise_radius;

    ctx.save();
    this.setupCtx(ctx, this._letter_size);
    for (let x = 0; x < this._cols; x++) {
      for (let y = 0; y < this._cols; y++) {
        const n = this._noise.noise(
          x * this._noise_scl,
          y * this._noise_scl,
          nx,
          ny,
        );
        const character_i = Math.floor(
          ((n + 1) * this.characters_map.length) / 2,
        );
        const c = this.characters_map[character_i];
        ctx.fillText(c, x * this._letter_size, y * this._letter_size);
      }
    }
    ctx.restore();
  }
}

export { NoiseLetters };
