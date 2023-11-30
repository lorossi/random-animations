import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Square } from "./square.js";
import { PaletteFactory } from "./palette-factory.js";

class Sketch extends Engine {
  preload() {
    this._cols = 10;
    this._bg = Color.fromMonochrome(245);
    this._scl = 0.95;
    this._texture_scl = 2;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._palette = PaletteFactory.getRandomPalette(this._xor128);

    const scl = this.width / this._cols;

    this._squares = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = (i % this._cols) * scl;
      const y = Math.floor(i / this._cols) * scl;
      const s = new Square(x, y, scl);
      s.setRandom(this._xor128);
      s.setPalette(this._palette);
      return s;
    });
  }

  draw() {
    this.noLoop();

    this.background(this._bg.rgb);

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._squares.forEach((s) => s.show(this.ctx));
    this._drawTexture();

    this.ctx.restore();
  }

  _drawTexture() {
    this.ctx.save();
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const ch = this._xor128.random(255);
        const c = Color.fromMonochrome(ch, 0.04);
        this.ctx.fillStyle = c.rgba;
        this.ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
