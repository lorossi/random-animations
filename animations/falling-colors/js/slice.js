import { Drop } from "./drop.js";
import { Vector } from "./vectors.js";

class Slice {
  constructor(x, y, width, height, palette, drops_count, xor128) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._drop_count = drops_count;
    this._xor128 = xor128;

    this._drops = new Array(this._drop_count)
      .fill()
      .map(() => {
        const x = this._xor128.random(this._width);
        const y = this._xor128.random(this._height);
        const pos = new Vector(x, y);
        const r = this._xor128.random(2, 10);
        const color =
          palette.colors[Math.floor(this._xor128.random(palette.length))];

        return new Drop(pos, r, color);
      })
      .sort((a, b) => a.pos.x - b.pos.x);
  }

  update(force_vector, dt) {
    this._drops.forEach((drop) => drop.update(force_vector, dt));
    this._drops = this._drops.filter((drop) => !drop.dead);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    this._drops.forEach((drop) => drop.draw(ctx));
    ctx.restore();
  }

  get ended() {
    return this._drops.length === 0;
  }
}

export { Slice };
