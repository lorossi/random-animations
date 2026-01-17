import { Engine, XOR128, PaletteFactory, Color } from "./lib.js";
import { CircleGrid, Grid } from "./grid.js";

// TODO: add more palettes

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._min_cell_size = 50;

    this._hex_palettes = [
      // https://coolors.co/palette/0d1b2a-1b263b-415a77-778da9-e0e1dd
      ["#0D1B2A", "#1B263B", "#415A77", "#778DA9", "#E0E1DD"],
      // https://coolors.co/palette/0d3b66-faf0ca-f4d35e-ee964b-f95738
      ["#0D3B66", "#FAF0CA", "#F4D35E", "#EE964B", "#F95738"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    const palettes = this._xor128.shuffle_array([
      this._palette_factory.getPalette(0),
      this._palette_factory.getPalette(1),
    ]);

    this._grid = new Grid(this.width, this._min_cell_size, this._seed);
    this._circle = new CircleGrid(this.width, this._min_cell_size, this._seed);
    this._grid.setPalette(palettes[0]);
    this._circle.setPalette(palettes[1]);

    this._bg = palettes[0].getRandomColor(this._xor128);

    document.body.style.backgroundColor = this._bg.rgba;
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg);
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
