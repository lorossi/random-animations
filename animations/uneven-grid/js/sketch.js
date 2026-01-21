import { Engine, XOR128, PaletteFactory, Color } from "./lib.js";
import { Grid } from "./grid.js";
import { Texture } from "./texture.js";

class Sketch extends Engine {
  preload() {
    this._max_depth = 4;
    this._split_chance = 0.75;
    this._texture_scl = 4;

    this._hex_palettes = [
      ["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557"],
      ["#3d348b", "#7678ed", "#f7b801", "#f18701", "#f35b04"],
      ["#22577a", "#38a3a5", "#57cc99", "#80ed99", "#c7f9cc"],
      ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b"],
      ["#BF349A", "#8C2771", "#E7DCF2", "#2ABFBF", "#29A6A6"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, true);
    this._bg = this._palette.colors.sort((a, b) => {
      return a.luminance - b.luminance;
    })[0];

    const grid_seed = this._xor128.random_int(1e6);
    const texture_seed = this._xor128.random_int(1e6);

    this._grid = new Grid(
      this.width,
      grid_seed,
      this._max_depth,
      this._split_chance,
      this._palette,
    );
    this._texture = new Texture(this.width, this._texture_scl, texture_seed);

    this.background(this._bg);
    document.body.style.background = this._bg.hex;
    this._font_loaded = false;
    document.fonts.load("10pt 'RobotoBold'").then(() => {
      this._font_loaded = true;
      this.draw();
    });
  }

  draw() {
    if (!this._font_loaded) return;
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

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
