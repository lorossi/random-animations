import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._min_cell_size = 50;
    this._bg_color = Color.fromMonochrome(245);
    this._scl = 0.9;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._grid = new Grid(this.width, this._min_cell_size, this._xor128);
    this._grid.populate();
  }

  draw() {
    this.noLoop();

    this.background(this._bg_color);

    this.ctx.save();
    this.scaleFromCenter(this._scl);
    this._grid.show(this.ctx);
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
