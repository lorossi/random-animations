import { XOR128, SimplexNoise } from "./lib.js";
import { Palette } from "./palette-factory.js";

class Pairing {
  constructor(x, y, size, seed, noise_scl, palette) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._seed = seed;
    this._noise_scl = noise_scl;

    this._drawing_functions = [
      this._drawCircle.bind(this),
      this._drawLine.bind(this),
      this._concentricCircles.bind(this),
      this._drawEmpty.bind(this),
    ];
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    const colors = palette.colors
      .map((c, i) => ({
        c: c,
        order: this._noise.noise(
          this._x * this._noise_scl,
          this._y * this._noise_scl,
          1000 + i
        ),
      }))
      .sort((a, b) => a.order - b.order)
      .map((o) => o.c);
    this._palette = new Palette(colors);

    const n1 = this._noise.noise(
      x * this._noise_scl,
      y * this._noise_scl,
      2000
    );
    this._inner_rotation = (Math.floor((n1 + 1) * 2) * Math.PI) / 4;

    const n2 = this._noise.noise(
      x * this._noise_scl,
      y * this._noise_scl,
      3000
    );
    const drawing_n = Math.floor(
      ((n2 + 1) / 2) * this._drawing_functions.length
    );
    this._inner_draw = this._drawing_functions[drawing_n];
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(0.95, 0.95);

    // Background
    // upper half
    ctx.fillStyle = this._palette.getColor(0).rgba;
    ctx.fillRect(-this._size / 2, -this._size / 2, this._size, this._size / 2);
    // lower half
    ctx.fillStyle = this._palette.getColor(1).rgba;
    ctx.fillRect(-this._size / 2, 0, this._size, this._size / 2);

    ctx.save();
    ctx.rotate(this._inner_rotation);
    this._inner_draw(ctx);
    ctx.restore();

    ctx.restore();
  }

  _drawCircle(ctx) {
    const radius = this._size / 2;

    // Circle
    // lower
    ctx.fillStyle = this._palette.getColor(2).rgba;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    // upper
    ctx.fillStyle = this._palette.getColor(3).rgba;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
  }

  _drawLine(ctx) {
    // horizontal
    ctx.fillStyle = this._palette.getColor(2).rgba;
    ctx.fillRect(-this._size / 2, -this._size / 4, this._size, this._size / 2);
  }

  _concentricCircles(ctx) {
    // outer circle
    ctx.fillStyle = this._palette.getColor(2).rgba;
    ctx.beginPath();
    ctx.arc(0, 0, this._size / 2, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();

    // inner circle
    ctx.fillStyle = this._palette.getColor(3).rgba;
    ctx.beginPath();
    ctx.arc(0, 0, this._size / 4, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
  }
  _drawEmpty() {}
}

export { Pairing };
