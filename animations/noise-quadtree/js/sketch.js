import {
  Engine,
  SimplexNoise,
  Point,
  Color,
  PaletteFactory,
  XOR128,
} from "./lib.js";
import { QuadTree } from "./quadtree.js";

class Sketch extends Engine {
  preload() {
    this._points_num = 500;

    this._scl = 0.95;

    this._noise_enabled = false;
    this._hex_palettes = [
      ["#E2DDCA", "#403D39"],
      ["#f4f1de", "#e07a5f"],
      ["#eff1f3", "#223843"],
      ["#fdfffc", "#235789"],
      ["#161032", "#2274a5"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);
    [this._bg, this._fg] = this._palette.colors;

    this._points = [];
    while (this._points.length < this._points_num) {
      const x = this._xor128.random(this.width);
      const y = this._xor128.random(this.height);
      const noise_value = this._noise.noise(
        x * this._noise_scl,
        y * this._noise_scl,
      );
      if (noise_value < 0) continue;
      this._points.push(new Point(x, y));
    }

    this._quadtree = new QuadTree(
      this.width,
      this._points,
      this._fg,
      this._xor128,
      4,
    );
    this._quadtree.split();

    document.body.style.background = this._bg.hex;
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._quadtree.draw(this.ctx);

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
