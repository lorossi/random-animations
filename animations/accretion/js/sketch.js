import { Engine, Color, XOR128, PaletteFactory } from "./lib.js";
import { Accretion } from "./walker.js";

class Sketch extends Engine {
  preload() {
    this._cell_size = 2;

    this._bg = Color.fromMonochrome(15);

    this._hex_palettes = [
      ["#55C0F6", "#ED2AAC"],
      ["#e63946", "#1d3557"],
      ["#0f4c5c", "#5f0f40"],
      ["#0081a7", "#f07167"],
      ["#ff0f7b", "#f89b29"],
      ["#006e90", "#f18f01"],
      ["#e7ecef", "#274c77"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);

    this._cols = this._xor128.random_int(1, 4); // 1x1 up to 3x3 grid
    const cell_w = this.width / this._cols;
    const cell_h = this.height / this._cols;

    // stop each accretion once growth reaches near its cell edge
    const max_points = Math.round(20000 / this._cols ** 2);

    this._cells = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const col = i % this._cols;
      const row = Math.floor(i / this._cols);

      const walkers_per_step = this._xor128.random_int(8, 32);
      const stick_probability =
        this._xor128.random(0, 1) < 0.5 ? 1 : this._xor128.random(0.75, 1);

      const accretion = new Accretion(
        cell_w,
        cell_h,
        this._cell_size,
        this._xor128,
      );

      const palette = this._palette_factory.getRandomPalette(
        this._xor128,
        true,
      );

      return {
        x: col * cell_w,
        y: row * cell_h,
        accretion,
        palette,
        walkers_per_step,
        stick_probability,
        done: false,
      };
    });

    document.body.style.backgroundColor = this._bg.hex;

    this._max_points = max_points;
  }

  draw() {
    this.ctx.save();
    this.background(this._bg);

    this._cells.forEach((cell) => {
      if (!cell.done) {
        cell.accretion.step(cell.walkers_per_step, cell.stick_probability);
        if (cell.accretion.stuckPoints.length >= this._max_points)
          cell.done = true;
      }

      this.ctx.save();
      this.ctx.translate(cell.x, cell.y);
      cell.accretion.draw(this.ctx, cell.palette);
      this.ctx.restore();
    });

    this.ctx.restore();
  }

  click() {
    this.setup();
  }
}

export { Sketch };
