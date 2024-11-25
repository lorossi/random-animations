import { XOR128 } from "./xor128.js";
import { Color, SimplexNoise } from "./engine.js";

class Rectangle {
  constructor(x, y, w, h) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;

    this._random_seed = 1;
    this._xor128 = new XOR128(this._random_seed);

    this._noise_seed = 1;
    this._noise = new SimplexNoise(this._noise_seed);

    this._fill_c = Color.fromMonochrome(245);
  }

  setRandom(random_seed) {
    this._random_seed = random_seed;
    this._xor128 = new XOR128(this._random_seed);

    this._noise_seed = this._xor128.random_int(1e16);
    this._noise = new SimplexNoise(this._noise_seed);
  }

  setFillColor(fill_c) {
    this._fill_c = fill_c;
  }

  show(ctx) {
    let n;

    ctx.fillStyle = this._fill_c.rgba;

    ctx.beginPath();

    // top left
    n = this._sideNoise(this._x, this._y);
    ctx.moveTo(this._x + n, this._y + n);

    // top right
    n = this._sideNoise(this._x + this._w, this._y);
    ctx.lineTo(this._x + this._w + n, this._y + n);

    // bottom right
    n = this._sideNoise(this._x + this._w, this._y + this._h);
    ctx.lineTo(this._x + this._w + n, this._y + this._h + n);

    // bottom left
    n = this._sideNoise(this._x, this._y + this._h);
    ctx.lineTo(this._x + n, this._y + this._h + n);

    ctx.closePath();

    ctx.fill();
  }

  _sideNoise(x, y, noise_scl = 0.00125, dr = 10) {
    return this._noise.noise(x * noise_scl, y * noise_scl) * dr;
  }
}

export { Rectangle };
