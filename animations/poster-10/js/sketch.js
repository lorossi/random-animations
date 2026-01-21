import { Engine, PaletteFactory, XOR128 } from "./lib.js";
import { Tile } from "./tile.js";

class Sketch extends Engine {
  preload() {
    this._scale = 0.95;
    this._hex_palettes = [
      ["#DCDCDC", "#0F0F0F"],
      ["#EEE7D7", "#27221F"],
      ["#F1FAEE", "#1D3557"],
      ["#EDF2F4", "#2B2D42"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._cols = this._xor128.pick([8, 10, 20, 25]);
    this._tile_size = Math.floor(this.width / this._cols);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, true);

    this._tiles = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);
      return new Tile(
        x * this._tile_size,
        y * this._tile_size,
        this._tile_size,
        this._palette,
        this._xor128,
      );
    });

    this._bg = this._palette.getRandomColor(this._xor128);
    document.body.style.background = this._bg.rgb;
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scale);

    this._tiles.forEach((t) => t.draw(this.ctx));

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
