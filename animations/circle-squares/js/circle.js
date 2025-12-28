import { XOR128 } from "./xor128.js";

class Circle {
  constructor(x, y, size, seed, scl, palette) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._seed = seed;
    this._scl = scl;
    this._palette = palette.copy();

    this._xor128 = new XOR128(this._seed);

    this._circles_num = this._xor128.random_int(5, 16);

    this._palette.shuffle(this._xor128);
    this._dr = this._xor128.random(0, this._size * 0.25);
    this._dtheta = this._xor128.random(0, Math.PI * 2);

    this._colors = [this._palette.getColor(0), this._palette.getColor(1)];
  }

  draw(ctx) {
    const max_size = this._size;

    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl, this._scl);

    ctx.beginPath();
    ctx.roundRect(
      -this._size / 2,
      -this._size / 2,
      this._size,
      this._size,
      this._size * 0.1
    );
    ctx.clip();

    ctx.rotate(this._dtheta);
    ctx.translate(this._dr, 0);

    ctx.beginPath();
    ctx.fillStyle = this._colors[1].rgba;
    ctx.arc(0, 0, max_size, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < this._circles_num; i++) {
      let outer_radius = max_size * ((i + 1) / this._circles_num);
      let inner_radius = max_size * (i / this._circles_num);

      if (inner_radius > max_size) {
        outer_radius -= max_size;
        inner_radius -= max_size;
      }

      const color = this._colors[i % 2];

      ctx.fillStyle = color.rgba;
      ctx.beginPath();
      ctx.arc(0, 0, outer_radius, 0, Math.PI * 2);
      ctx.arc(0, 0, inner_radius, 0, Math.PI * 2, true);
      ctx.fill();
    }

    ctx.restore();
  }

  _wrap(x, min, max) {
    while (x < min) x += max;
    while (x > max) x -= max;
    return x;
  }
}

export { Circle };
