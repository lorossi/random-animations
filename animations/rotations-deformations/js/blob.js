import { SimplexNoise, XOR128 } from "./lib.js";

class Blob {
  constructor(x, y, size, speed, seed, canvas_width, color) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._speed = speed;
    this._seed = seed;
    this._canvas_width = canvas_width;
    this._color = color;

    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e6));

    this._noise_scl = 0.01;
    this._time_scl = 0.002;
    this._width = this._size;
    this._height = this._size;
  }

  setNoiseScale(noise_scl) {
    this._noise_scl = noise_scl;
  }

  update(frame) {
    // update x coordinate
    const n1 = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      1000,
    );
    this._x += ((n1 + 1) / 2) * this._speed;

    // update width
    const n2 = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      2000,
    );
    this._width = this._size * ((n2 + 1) / 2);

    // update height
    const n3 = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      3000,
    );
    this._height = this._size * ((n3 + 1) / 2);
  }

  draw(ctx) {
    if (this.offBounds()) return;

    ctx.save();
    ctx.translate(this._x - this._width / 2, this._y);

    ctx.strokeStyle = this._color.rgba;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.ellipse(0, 0, this._width / 2, this._height / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  offBounds() {
    return this._x + this._width / 2 > this._canvas_width;
  }
}

export { Blob };
