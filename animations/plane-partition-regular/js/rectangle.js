import { Color } from "./engine.js";

class Rectangle {
  constructor(x, y, size, split_probability, xor128, noise, level = 0) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._split_probability = split_probability;
    this._xor128 = xor128;
    this._noise = noise;
    this._level = level;

    this._min_size = 50;
    this._noise_scl = 0.005;
    this._color = Color.fromMonochrome(245);
    this._can_split =
      level <= 1 ? true : this._xor128.random() < this._split_probability;
    this._circle_r = Math.min(this._size / 10, 5);
  }

  show(ctx) {
    ctx.save();
    ctx.strokeStyle = this._color.rgba;
    ctx.fillStyle = this._color.rgba;

    ctx.translate(this._x, this._y);

    ctx.beginPath();
    ctx.rect(0, 0, this._size, this._size);
    ctx.stroke();

    if (!this._can_split) {
      ctx.beginPath();
      ctx.arc(this._size / 2, this._size / 2, this._circle_r, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore();
  }

  split() {
    if (!this._can_split) return [this];

    this._can_split = false;

    if (this._size < this._min_size || this._h < this._min_size) return [this];

    const cols = this._xor128.random_int(2, 4);
    const size = this._size / cols;

    return new Array(cols ** 2).fill(0).map((_, i) => {
      const x = (i % cols) * size;
      const y = Math.floor(i / cols) * size;

      return new Rectangle(
        this._x + x,
        this._y + y,
        size,
        this._split_probability,
        this._xor128,
        this._noise,
        this._level + 1
      );
    });
  }

  get ended() {
    return !this._can_split;
  }
}

export { Rectangle };
