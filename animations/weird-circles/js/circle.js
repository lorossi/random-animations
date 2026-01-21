import { Color, SimplexNoise, XOR128, Palette } from "./lib.js";
import { Grid } from "./grid.js";
import { Potato } from "./potato.js";
import { Rectangle } from "./rectangle.js";

class Circle {
  constructor(x, y, radius, scl) {
    this._x = x;
    this._y = y;
    this._radius = radius;
    this._scl = scl;

    this._palette = new Palette([
      Color.fromMonochrome(245),
      Color.fromMonochrome(15),
    ]);
  }

  setNoise(noise_seed, noise_radius) {
    this._noise_radius = noise_radius;
    this._noise_seed = noise_seed;
    this._noise = new SimplexNoise(this._noise_seed);
  }

  setRandom(random_seed) {
    this._random_seed = random_seed;
    this._xor128 = new XOR128(this._random_seed);
  }

  setPalette(palette) {
    this._palette = palette.copy();
  }

  _generatePotato() {
    return new Potato(0, 0, this._radius, this._noise_seed);
  }

  _generateGrid() {
    const gx = this._xor128.random_interval(0, 1) * this._radius;
    const gy = this._xor128.random_interval(0, 1) * this._radius;

    const hole_r = this._xor128.random(1 / 32, 1 / 8) * this._radius;
    const cols = this._xor128.random_int(3, 8);
    const rows = this._xor128.random_int(3, 8);

    const random_seed = this._xor128.random_int(1e16);
    const g = new Grid(gx, gy, cols, rows, hole_r);
    g.setFillColor(this._palette.getRandomColor(this._xor128));
    g.setRandom(random_seed);
    return g;
  }

  _generateRectangle() {
    const rx = this._xor128.random_interval(0, 1) * this._radius;
    const ry = this._xor128.random_interval(0, 1) * this._radius;

    const rw = this._xor128.random(1 / 4, 1) * this._radius;
    const rh = this._xor128.random(1 / 4, 1) * this._radius;

    const r = new Rectangle(rx, ry, rw, rh);
    r.setFillColor(this._palette.getRandomColor(this._xor128));
    r.setRandom(this._xor128.random_int(1e16));
    return r;
  }

  draw(ctx) {
    const potato = this._generatePotato();
    const grid = this._generateGrid();
    const rectangles = new Array(this._xor128.random_int(1, 2))
      .fill(0)
      .map(() => this._generateRectangle());

    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.scale(this._scl, this._scl);

    ctx.fillStyle = this._palette.getColor(1).rgba;

    potato.show(ctx);
    rectangles.forEach((rectangle) => rectangle.show(ctx));
    grid.show(ctx);

    ctx.restore();
  }
}

export { Circle };
