import {
  Engine,
  SimplexNoise,
  Point,
  Color,
  XOR128,
  Palette,
  PaletteFactory,
} from "./lib.js";

import { Grid } from "./grid.js";
import { PALETTES_HEX } from "./palettes.js";

class Sketch extends Engine {
  preload() {
    this._slots = 200;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._grid_size = this.width / this._grid_cols;

    const palette_factory = PaletteFactory.fromHEXArray(PALETTES_HEX);
    const palette = palette_factory.getRandomPalette(this._xor128, false);
    if (this._xor128.random_bool()) palette.reverse();

    const lightest = palette.colors.reduce(
      (a, b) => (a.luminance > b.luminance ? a : b),
      palette.colors[0]
    );
    this._bg = lightest;

    const cell_size = Math.ceil(this.width / this._slots);

    this._grid = new Grid(
      this._slots,
      cell_size,
      palette,
      this._xor128.random_int(1e6)
    );

    document.body.style.background = this._bg.hex;
  }

  draw(dt) {
    this.ctx.save();
    this.background(this._bg);
    this._grid.draw(this.ctx);
    this.ctx.restore();

    this.noLoop();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
