import { XOR128, SimplexNoise } from "./lib.js";
import { Layer } from "./layer.js";

class Bars extends Layer {
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
    const noise_seed = this._xor128.random_int(1e16);
    this._noises = new Array(this._cols)
      .fill()
      .map((_, i) => new SimplexNoise(noise_seed + i * 10));
  }

  show(ctx) {
    const scl = this._size / this._cols;

    ctx.save();
    this.setupCtx(ctx);

    const nx = 1 + Math.sin(this.theta);
    const ny = 1 + Math.cos(this.theta);

    for (let x = 0; x < this._cols; x++) {
      const n = this._noises[x].noise(nx, ny);
      const y = this.remap(n, -1, 1, 0, this._cols);
      const fx = (x + 0.5) * scl;

      for (let yy = this._cols; yy > y; yy--) {
        const fy = (yy - 0.5) * scl;
        const character = this._xor128.pick(this.characters_map);

        ctx.fillText(character, fx, fy);
      }
    }

    ctx.restore();
  }
}

export { Bars };
