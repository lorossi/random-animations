import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Tile } from "./tile.js";

class Sketch extends Engine {
  preload() {
    this._scale = 1;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._cols = this._xor128.pick([8, 10, 20, 25]);
    this._tile_size = Math.floor(this.width / this._cols);
    this._palette = PaletteFactory.getRandomPalette(this._xor128, true);

    this._tiles = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);
      return new Tile(
        x * this._tile_size,
        y * this._tile_size,
        this._tile_size,
        this._palette,
        this._xor128
      );
    });
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background("#ffffff");
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
