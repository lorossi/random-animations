import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Grid } from "./grid.js";
import { Texture } from "./texture.js";

class Sketch extends Engine {
  preload() {
    this._max_depth = 4;
    this._split_chance = 0.75;
    this._texture_scl = 4;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette = PaletteFactory.getRandomPalette(this._xor128, true);
    this._bg = this._palette.colors.sort((a, b) => {
      return this._colorLightness(a) - this._colorLightness(b);
    })[0];

    const grid_seed = this._xor128.random_int(1e6);
    const texture_seed = this._xor128.random_int(1e6);

    this._grid = new Grid(
      this.width,
      grid_seed,
      this._max_depth,
      this._split_chance,
      this._palette
    );
    this._texture = new Texture(this.width, this._texture_scl, texture_seed);

    document.body.style.background = this._bg.hex;
  }

  draw() {
    this.noLoop();
    this._grid.split();

    this.ctx.save();
    this.background(this._bg);

    this._grid.draw(this.ctx);
    this._texture.draw(this.ctx);

    const biggest = this._grid.getBiggestCell();
    biggest.drawQuestionMark(this.ctx);

    this.ctx.restore();
  }

  _colorLightness(color) {
    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
