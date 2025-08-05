import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Tile } from "./tile.js";

class Sketch extends Engine {
  preload() {
    this._scale = 0.8;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._cols = this._xor128.random_int(8, 15);
    this._tile_size = Math.floor(this.width / this._cols);
    [this._fg, this._bg] = PaletteFactory.getRandomPalette(
      this._xor128,
      true
    ).colors;
    this._exp = this._xor128.random(1, 2);

    document.body.style.backgroundColor = this._bg.rgba;

    this._tiles = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = (i % this._cols) - 0.5;
      const y = Math.floor(i / this._cols) - 0.5;
      const distance =
        Math.hypot(x - this._cols / 2, y - this._cols / 2) /
        ((this._cols / 2) * Math.SQRT2);
      const probability = this._polyEasing(distance, this._exp);

      return new Tile(
        x * this._tile_size,
        y * this._tile_size,
        probability,
        this._tile_size * 2,
        this._fg,
        this._xor128
      );
    });
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

  _polyEasing(x, n) {
    return x ** n;
  }
}

export { Sketch };
