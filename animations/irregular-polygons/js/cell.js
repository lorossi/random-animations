import { XOR128 } from "./xor128.js";
import { SimplexNoise } from "./engine.js";

class Cell {
  constructor(size, palette, seed) {
    this._size = size;
    this._palette = palette;
    this._seed = seed;

    this._xor128 = new XOR128(this._seed);

    this._palette = this._palette.copy().shuffle(this._xor128);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));
    this._sides = this._xor128.random_int(4, this._palette.length);
    this._phi = this._xor128.random(0, Math.PI * 2);
    this._dr = this._xor128.random_interval(0, this._size / 8);
  }

  update() {
    this._angles = new Array(this._sides)
      .fill(0)
      .map(() => this._xor128.random(0.25, 0.75));

    const sum = this._angles.reduce((a, b) => a + b, 0);
    this._angles = this._angles.map((angle) => (angle / sum) * Math.PI * 2);
    this._angles = this._angles.map((acc, angle) => {
      acc += angle;
      return acc;
    });
    this._angles.unshift(0);
  }

  show(ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.roundRect(-this._size / 2, -this._size / 2, this._size, this._size, 4);
    ctx.clip();

    ctx.save();
    ctx.rotate(this._phi);
    ctx.translate(this._dr, 0);

    for (let i = 0; i < this._angles.length; i++) {
      ctx.fillStyle = this._palette.getColor(i);

      const a1 = Math.max(this._angles[i], 0);
      // const a2 = Math.min(
      //   this._angles[(i + 1) % this._angles.length],
      //   Math.PI * 2
      // );
      const a2 = this._angles[(i + 1) % this._angles.length];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, this._size, a1, a2, false);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
    ctx.restore();
  }

  _rescale(x, old_min, old_max, new_min, new_max) {
    return (
      ((x - old_min) * (new_max - new_min)) / (old_max - old_min) + new_min
    );
  }

  _rescaleInt(x, old_min, old_max, new_min, new_max) {
    return Math.floor(this._rescale(x, old_min, old_max, new_min, new_max));
  }
}

export { Cell };
