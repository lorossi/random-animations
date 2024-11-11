import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Bookshelf } from "./bookshelf.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.9;
    this._bg_color = Color.fromMonochrome(245);
  }

  setup() {
    const seed = new Date().getTime();
    const xor128 = new XOR128(seed);
    const palette = PaletteFactory.getRandomPalette(xor128);

    this._bookshelf = new Bookshelf(this.width, xor128, palette);
  }

  draw() {
    this.ctx.save();
    this.background(this._bg_color);
    this.scaleFromCenter(this._scl);

    this._bookshelf.draw(this.ctx);

    this.ctx.restore();
    this.noLoop();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
