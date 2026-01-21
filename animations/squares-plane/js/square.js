import { XOR128 } from "./lib.js";

class Square {
  constructor(x, y, size, steps, palette, seed) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._steps = steps;
    this._palette = palette;
    this._xor128 = new XOR128(seed);

    this._angles = this._xor128.shuffle(
      new Array(4).fill(0).map((_, i) => (i * Math.PI) / 2),
    );
    this._offset = this._xor128.random(0, this._size / 2);
    this._direction = this._xor128.pick([-1, 1]);
    this._dt = this._xor128.random();

    this._angle = 0;
  }

  update(t) {
    const tt = (t + this._dt) % 1;
    const phase = Math.floor(tt * this._steps);
    const local_t = (tt * this._steps) % 1;
    const eased_t = this._easeInOutPoly(local_t, 10);

    this._angle =
      ((eased_t + phase) * this._direction * (Math.PI * 2)) / this._steps;
  }

  draw(ctx) {
    ctx.save();

    // clip to square area
    ctx.beginPath();
    ctx.rect(this._x, this._y, this._size, this._size);
    ctx.clip();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.rotate(Math.PI / 4 + this._angle);

    for (let i = 0; i < 4; i++) {
      const color = this._palette.getColor(i);

      ctx.save();
      ctx.rotate(this._angles[i]);
      ctx.translate(0, -this._offset);

      ctx.fillStyle = color.rgba;
      ctx.fillRect(0, 0, (this._size / 2) * 2, (this._size / 2) * 2);

      ctx.restore();
    }

    ctx.restore();
  }

  _easeInOutPoly(x, n = 10) {
    if (x < 0.5) return 0.5 * Math.pow(2 * x, n);
    return 1 - 0.5 * Math.pow(2 * (1 - x), n);
  }
}

export { Square };
