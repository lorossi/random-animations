import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { CircleGrid, Grid } from "./grid.js";

// TODO: add more palettes

class Sketch extends Engine {
  preload() {
    this._bg_color = Color.fromMonochrome(240, 1);
    this._scl = 0.95;
    this._min_cell_size = 50;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const palettes = new Array(PaletteFactory.getPalettesCount())
      .fill(0)
      .map((_, i) => PaletteFactory.getPalette(i))
      .map((p) => ({ palette: p, order: this._xor128.random() }))
      .sort((a, b) => a.order - b.order)
      .map((p) => p.palette);

    this._grid = new Grid(this.width, this._min_cell_size, seed);
    this._circle = new CircleGrid(this.width, this._min_cell_size, seed);
    this._grid.setPalette(palettes[0]);
    this._circle.setPalette(palettes[1]);
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg_color);
    this.scaleFromCenter(this._scl);

    this._grid.show(this.ctx);
    this._circle.show(this.ctx);

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
