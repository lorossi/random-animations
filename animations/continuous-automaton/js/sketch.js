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
    this._cols = 200;
    this._bg = Color.fromMonochrome(25);
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._grid_size = this.width / this._grid_cols;

    const palette_factory = PaletteFactory.fromHEXArray(PALETTES_HEX);
    const palette = palette_factory.getRandomPalette(this._xor128, false);

    const cell_size = Math.ceil(this.width / this._cols);

    this._grid = new Grid(
      this._cols,
      this._cols,
      cell_size,
      palette,
      this._xor128.random_int(1e6)
    );
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
