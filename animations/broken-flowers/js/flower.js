import { Color } from "./engine.js";

class Flower {
  constructor(x, y, size, scl) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._scl = scl;

    this._fg_color = Color.fromMonochrome(245);

    this._noise = null;
    this._noise_scl = 0.1;
    this._phi = 0;
    this._petal_width = 1; // between 0 and 1
    this._petal_height = 1; // between 0 and 1
  }

  setFgColor(color) {
    this._fg_color = color;
  }

  setNoise(noise, noise_scl, time_scl) {
    this._noise = noise;
    this._noise_scl = noise_scl;
    this._time_scl = time_scl;

    const n1 = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      1000
    );
    this._phi = n1;
  }

  update(t) {
    const tt = this._wrap(t + this._phi, 0, 1);
    const eased = this._easeInOutPoly(tt, 1.5);
    const theta = eased * Math.PI * 2;

    const nx = (1 + Math.cos(theta)) * this._time_scl;
    const ny = (1 + Math.sin(theta)) * this._time_scl;

    const n1 = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      nx + 3000,
      ny + 3000
    );

    const n2 = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      nx + 5000,
      ny + 5000
    );

    this._petal_width = this._remap(n1, -1, 1, 0, 1);
    this._petal_height = this._remap(n2, -1, 1, 0, 1);
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl, this._scl);

    ctx.fillStyle = this._fg_color.rgb;

    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);

      // translate to the center of the petal
      ctx.translate(0, (this._size / 2) * this._petal_height);

      // draw the petal
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        (this._size / 2) * this._petal_width,
        (this._size / 4) * this._petal_height,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  _remap(x, old_min, old_max, new_min, new_max) {
    return (
      new_min + ((x - old_min) * (new_max - new_min)) / (old_max - old_min)
    );
  }

  _wrap(x, min, max) {
    const range = max - min;
    while (x < min) x += range;
    while (x >= max) x -= range;
    return x;
  }

  _easeInOutPoly(x, n) {
    return x < 0.5
      ? 0.5 * Math.pow(2 * x, n)
      : 1 - 0.5 * Math.pow(2 * (1 - x), n);
  }
}

export { Flower };
