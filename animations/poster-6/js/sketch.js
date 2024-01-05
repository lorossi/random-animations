import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { PaletteFactory } from "./palette-factory.js";
import { Cell } from "./cell.js";

class Sketch extends Engine {
  preload() {
    this._texture_scl = 4;
    this._circle_scl = 0.9;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._palette = PaletteFactory.getRandomPalette(this._xor128);
    this._cols = this._xor128.random_int(3, 6);

    const circle_scl = this._xor128.random(0.65, 1.2);
    const size = this.width / this._cols;
    this._cells = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = (i % this._cols) * size;
      const y = Math.floor(i / this._cols) * size;

      const c = new Cell(x, y, size, circle_scl);
      c.setPalette(this._palette);
      c.setXOR128(this._xor128);
      return c;
    });
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);

    this._cells.forEach((c) => c.draw(this.ctx));
    this._drawTexture();

    this.ctx.restore();
  }

  _drawTexture() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const r = this._xor128.random();
        const c = Color.fromMonochrome(r * 127, 0.05);

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
