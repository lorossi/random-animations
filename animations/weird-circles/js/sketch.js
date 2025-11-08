import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._cols = 4;
    this._scl = 0.95;
    this._circle_scl = 0.8;
    this._circle_noise_radius = 0.5;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const palette = PaletteFactory.getRandomPalette(this._xor128);
    [this._bg, ...this._fg] = palette.colors;
    this._palette = new Palette(this._fg);

    const circle_r = this.width / this._cols / 2;
    this._circles = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = (i % this._cols) * 2 * circle_r + circle_r;
      const y = Math.floor(i / this._cols) * 2 * circle_r + circle_r;
      const random_seed = this._xor128.random_int(1e16);
      const noise_seed = this._xor128.random_int(1e16);

      const c = new Circle(x, y, circle_r, this._circle_scl);
      c.setNoise(noise_seed, this._circle_noise_radius);
      c.setRandom(random_seed);
      c.setPalette(this._palette);
      return c;
    });
  }

  draw() {
    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._circles.forEach((circle) => circle.draw(this.ctx));

    this.ctx.restore();

    this.noLoop();
  }

  click() {
    this.draw();
    this.setup();
  }
}

export { Sketch };
