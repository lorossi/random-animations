import { XOR128 } from "./xor128.js";
import { SimplexNoise } from "./engine.js";
import { Point } from "./engine.js";

class Blind {
  constructor(x, y, size, seed, fill_c) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._seed = seed;
    this._fill_c = fill_c;

    this._noise_scl = 1;
    this._scl = 0.9;

    this._xor128 = new XOR128(this._seed);
    const noise_seed = this._xor128.random_int(1e9);
    this._simplex_noise = new SimplexNoise(noise_seed);

    this._point = new Point(this._size, this._size);
  }

  update(t) {
    const theta = t * Math.PI * 2;
    const nx = (1 + Math.cos(theta)) * this._noise_scl;
    const ny = (1 + Math.sin(theta)) * this._noise_scl;
    const n1 = this._simplex_noise.noise(nx, ny, 100);
    const n2 = this._simplex_noise.noise(ny, nx, 200);

    this._point.x = (this._size * (n1 + 1)) / 2;
    this._point.y = (this._size * (n2 + 1)) / 2;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl, this._scl);
    ctx.translate(-this._size / 2, -this._size / 2);

    ctx.fillStyle = this._fill_c.rgba;

    ctx.fillRect(0, 0, this._point.x, this._size);
    ctx.fillRect(0, 0, this._size, this._point.y);

    ctx.restore();
  }
}

export { Blind };
