import { XOR128, SimplexNoise } from "./lib.js";
import { Palette } from "./palette-factory.js";

class Pairing {
  constructor(x, y, size, seed, noise_scl, colors) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._seed = seed;
    this._noise_scl = noise_scl;
    this._colors = colors;

    this._drawing_functions = [
      this._drawCircle.bind(this),
      this._drawLine.bind(this),
      this._concentricCircles.bind(this),
      this._drawEmpty.bind(this),
      this._drawTriangle.bind(this),
    ];
    this._functions_weight = [3, 3, 2, 1, 1];
    this._cumulative_weights = this._createCumulativeWeights(
      this._functions_weight
    );
    console.log(this._cumulative_weights);

    this._xor128 = new XOR128(this._seed);
    this._noises = new Array(3)
      .fill(0)
      .map(() => new SimplexNoise(this._xor128.random_int(1e9)));
  }

  _createCumulativeWeights(weights) {
    const weights_sum = weights.reduce((a, b) => a + b, 0);
    const cumulative_weights = weights.map(
      (_, i) => weights.slice(0, i + 1).reduce((a, b) => a + b, 0) / weights_sum
    );

    return cumulative_weights;
  }

  update(tx, ty) {
    const colors = this._colors
      .map((c, i) => ({
        c: c,
        order: this._noises[0].noise(
          this._x * this._noise_scl + i,
          this._y * this._noise_scl + i,
          tx,
          ty
        ),
      }))
      .sort((a, b) => a.order - b.order)
      .map((o) => o.c);
    this._palette = new Palette(colors);

    const n1 = this._noises[1].noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      tx + 2000,
      ty + 2000
    );
    this._inner_rotation = (Math.floor((n1 + 1) * 2) * Math.PI) / 4;

    const n2 = this._noises[2].noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      tx + 3000,
      ty + 3000
    );
    const drawing_i = Math.floor(
      ((n2 + 1) / 2) * this._cumulative_weights.length
    );
    this._inner_draw = this._drawing_functions[drawing_i];
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(0.95, 0.95);

    // Background
    ctx.beginPath();
    ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
    ctx.closePath();
    ctx.clip();

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

  _drawTriangle(ctx) {
    const height = (this._size * Math.sqrt(3)) / 2;

    // Triangle
    // lower
    ctx.fillStyle = this._palette.getColor(2).rgba;
    ctx.beginPath();
    ctx.moveTo(-this._size / 2, height / 2);
    ctx.lineTo(this._size / 2, height / 2);
    ctx.lineTo(0, -height / 2);
    ctx.closePath();
    ctx.fill();
    // upper
    ctx.fillStyle = this._palette.getColor(3).rgba;
    ctx.beginPath();
    ctx.moveTo(-this._size / 2, -height / 2);
    ctx.lineTo(this._size / 2, -height / 2);
    ctx.lineTo(0, height / 2);
    ctx.closePath();
    ctx.fill();
  }
}

export { Pairing };
