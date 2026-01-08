import { Engine, SimplexNoise, Point, Color, XOR128 } from "./lib.js";
import { Pairing } from "./pairing.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Texture } from "./texture.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._noise_scl = 0.0015;
    this._bg = Color.fromMonochrome(240);
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    // Extract background qs the first color of a random palette
    this._cols = this._xor128.random_int(19, 22);
    this._palette = PaletteFactory.getRandomPalette(this._xor128, true);

    const seed = this._xor128.random_int(1e9);
    const pairing_size = this.width / this._cols;
    this._pairings = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      return new Pairing(
        x * pairing_size,
        y * pairing_size,
        pairing_size,
        seed,
        this._noise_scl,
        this._palette.copy()
      );
    });

    this._texture = new Texture(this.width, 4, this._seed);
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg);

    this.ctx.save();
    this.scaleFromCenter(this._scl);
    this._pairings.forEach((p) => p.draw(this.ctx));
    this.ctx.restore();

    this._texture.draw(this.ctx);

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
