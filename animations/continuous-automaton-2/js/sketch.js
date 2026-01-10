import {
  Engine,
  SimplexNoise,
  Point,
  Color,
  XOR128,
  Palette,
  PaletteFactory,
} from "./lib.js";
import { HexagonGrid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._palettes_hex = [
      ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
      ["#FF6700", "#EBEBEB", "#C0C0C0", "#3A6EA5", "#004E98"],
      ["#283D3B", "#197278", "#EDDDD4", "#C44536", "#772E25"],
      ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
    ];
    this._bg = Color.fromMonochrome(240);
    this._hexagon_scl = 0.8;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const slots = this._xor128.random_int(50, 100);

    const palette_factory = PaletteFactory.fromHEXArray(this._palettes_hex);
    const palette = palette_factory.getRandomPalette(this._xor128, false);
    if (this._xor128.random_bool()) palette.reverse();

    this._grid = new HexagonGrid(
      slots,
      this.width,
      this._hexagon_scl,
      this._xor128.random_int(1e6),
      palette
    );

    document.body.style.background = this._bg.hex;
  }

  draw(dt) {
    this.ctx.save();
    this.background(this._bg);
    this._grid.update();
    this._grid.show(this.ctx);
    this.ctx.restore();
  }

  click(x, y) {
    this._grid.click(x, y);
  }
}

export { Sketch };
