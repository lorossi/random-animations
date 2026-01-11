import { Engine, XOR128, PaletteFactory } from "./lib.js";
import { Grid } from "./grid.js";
import { Texture } from "./texture.js";

class Sketch extends Engine {
  preload() {
    this._palettes_hex = [
      ["#335C67", "#FFF3B0", "#E09F3E", "#9E2A2B", "#540B0E"],
      ["#01161E", "#124559", "#598392", "#AEC3B0", "#EFF6E0"],
      ["#F4F1DE", "#E07A5F", "#3D405B", "#81B29A", "#F2CC8F"],
      ["#012E40", "#025159", "#038C8C", "#03A696", "#F28705"],
      ["#F288A4", "#4968A6", "#3FBFBF", "#F2C36B", "#F2E9D8"],
      ["#5C4B51", "#8CBEB2", "#F2EBBF", "#F3B562", "#F06060"],
      ["#153B40", "#F2B279", "#BFA18F", "#F26A4B", "#BF3326"],
      ["#474143", "#FFC636", "#00ADA9", "#FFFFFF", "#FF6444"],
      ["#0F0F0F", "#F0F0F0"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._grid_cols = this._xor128.random_int(2, 5);
    this._grid_size = this.width / this._grid_cols;

    const palette_factory = PaletteFactory.fromHEXArray(this._palettes_hex);
    const palette = palette_factory.getRandomPalette(this._xor128, false);
    if (this._xor128.random_bool()) palette.reverse();

    const rows = this._xor128.random_int(16, 33);
    this._grids = new Array(this._grid_cols ** 2).fill(0).map(() => {
      const gates_num = this._xor128.random_int(rows - 1, rows + 1);
      const seed = this._xor128.random_int(2 ** 31);
      return new Grid(rows, rows, gates_num, this._grid_size, seed, palette);
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
