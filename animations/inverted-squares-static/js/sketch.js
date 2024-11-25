import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Square } from "./square.js";
import { Inverter } from "./inverter.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._noise_scl = 0.25;
    this._inverters_num = 5;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const c = this._xor128.random_int(8, 16);
    this._colors = [Color.fromMonochrome(c), Color.fromMonochrome(255 - c)];
    this._bg_color = Color.fromMonochrome(230);

    this._cols = this._xor128.random_int(2, 6);
    this._stripes_num = this._xor128.random_int(4, 9);

    const scl = this.width / this._cols;
    this._squares = new Array(this._cols ** 2).fill(null).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      const palette = new Palette(this._colors).shuffle();

      return new Square(x * scl, y * scl, scl, this._stripes_num, palette);
    });
    this._inverters = new Array(this._inverters_num).fill(null).map(() => {
      const r = this._xor128.random(1 / 3, 1) * this.width;
      const x = this._xor128.random_interval(this.width / 2, 0.4 * this.width);
      const y = this._xor128.random_interval(
        this.height / 2,
        0.4 * this.height
      );
      const seed = this._xor128.random_int(0, 1e6);
      return new Inverter(x, y, r, seed, this._noise_scl);
    });
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg_color);
    this.scaleFromCenter(this._scl);

    this._squares.forEach((square) => square.show(this.ctx));
    this._inverters.forEach((inverter) => inverter.draw(this.ctx));
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
