import { Engine, XOR128, PaletteFactory } from "./lib.js";

import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._slots = 200;
    this._hex_palettes = [
      ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
      ["#F8FFE5", "#06D6A0", "#1B9AAA", "#EF476F", "#FFC43D"],
      ["#080708", "#3772FF", "#DF2935", "#FDCA40", "#E6E8E6"],
      ["#3D348B", "#7678ED", "#F7B801", "#F18701", "#F35B04"],
      ["#FFFFFF", "#00A7E1", "#00171F", "#003459", "#007EA7"],
      ["#064789", "#427AA1", "#EBF2FA", "#679436", "#A5BE00"],
      ["#283D3B", "#197278", "#EDDDD4", "#C44536", "#772E25"],
      ["#000000", "#14213D", "#FCA311", "#E5E5E5", "#FFFFFF"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._grid_size = this.width / this._grid_cols;

    const palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    const palette = palette_factory.getRandomPalette(this._xor128, false);
    if (this._xor128.random_bool()) palette.reverse();

    this._bg = palette.getRandomColor(this._xor128);

    const cell_size = Math.ceil(this.width / this._slots);

    this._grid = new Grid(
      this._slots,
      cell_size,
      palette,
      this._xor128.random_int(1e6),
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
