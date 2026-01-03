import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Grid } from "./grid.js";
import { PaletteFactory } from "./palette-factory.js";
import { Texture } from "./texture.js";

class Sketch extends Engine {
  preload() {}

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._grid_cols = this._xor128.random_int(2, 5);
    this._grid_size = this.width / this._grid_cols;

    const palette = PaletteFactory.getRandomPalette(this._xor128, false);
    const rows = this._xor128.random_int(16, 33);
    this._grids = new Array(this._grid_cols ** 2).fill(0).map((_, x) => {
      const gates_num = this._xor128.random_int(rows - 1, rows + 1);
      return new Grid(
        rows,
        rows,
        gates_num,
        this._grid_size,
        this._xor128,
        palette
      );
    });

    this._texture = new Texture(this.width, 4, this._xor128);

    this._bg = this._xor128.pick(palette.colors);
    document.body.style.background = this._bg.hex;
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg);

    this._grids.forEach((grid, i) => {
      const x = (i % this._grid_cols) * this._grid_size;
      const y = Math.floor(i / this._grid_cols) * this._grid_size;
      this.ctx.save();
      this.ctx.translate(x, y);
      grid.draw(this.ctx);
      this.ctx.restore();
    });

    this._texture.update();

    this._texture.draw(this.ctx);
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
