import { XOR128 } from "./xor128.js";

class Crown {
  constructor(max_size, thickness, color) {
    this._max_size = max_size;
    this._thickness = thickness;
    this._color = color;

    this._size = 0;
  }

  update(t) {
    this._size = this._max_size * t;
  }

  draw(ctx) {
    const outer = Math.max(0, this._size);
    const inner = Math.max(0, this._size - this._thickness);

    ctx.save();
    ctx.fillStyle = this._color.rgba;

    ctx.beginPath();
    ctx.arc(0, 0, outer, 0, Math.PI * 2);
    ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.restore();
  }

  get size() {
    return this._size - this._thickness;
  }
}
class Circle {
  constructor(x, y, size, seed, scl, palette) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._seed = seed;
    this._scl = scl;
    this._palette = palette.copy();

    this._xor128 = new XOR128(this._seed);

    this._crowns_num = this._xor128.random_int(5, 16);
    if (this._crowns_num % 2 == 1) this._crowns_num += 1;

    this._palette.shuffle(this._xor128);
    this._dr = this._xor128.random(0, this._size * 0.15);
    this._dtheta = this._xor128.random(0, Math.PI * 2);

    this._colors = [this._palette.getColor(0), this._palette.getColor(1)];

    this._crowns = new Array(this._crowns_num).fill(null).map((_, i) => {
      const thickness = this._size / this._crowns_num;
      return new Crown(this._size, thickness, this._colors[i % 2]);
    });
  }

  update(t) {
    this._crowns.forEach((crown, i) => {
      const crown_t = t + i / this._crowns_num;
      crown.update(this._wrap(crown_t, 0, 1));
    });
  }

  draw(ctx) {
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

    this._crowns.forEach((crown) => crown.draw(ctx));

    ctx.restore();
  }

  _wrap(x, min, max) {
    while (x < min) x += max;
    while (x > max) x -= max;
    return x;
  }
}

export { Circle };
