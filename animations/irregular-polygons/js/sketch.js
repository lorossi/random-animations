import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(240);
    this._scl = 0.9;
    this._cell_scl = 0.85;
    this._texture_scl = 2;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._cols = this._xor128.random_int(5, 11);
    this._palette = PaletteFactory.getRandomPalette(this._xor128);
    this._grid = new Grid(
      this.width,
      this._palette,
      this._cols,
      this._cell_scl,
      seed
    );

    document.body.style.background = this._bg.darken(0.025).hex;
    this._createTexture();
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._grid.update();
    this._grid.show(this.ctx);

    this.ctx.restore();
    this._applyTexture();
  }

  click() {
    this.setup();
    this.draw();
  }

  _createTexture() {
    this._texture_canvas = document.createElement("canvas");
    this._texture_canvas.width = this.width;
    this._texture_canvas.height = this.height;

    const ctx = this._texture_canvas.getContext("2d");
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const ch = this._xor128.random_int(0, 127);
        const c = Color.fromMonochrome(ch, 0.05);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }
  }

  _applyTexture() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(this._texture_canvas, 0, 0);
    this.ctx.restore();
  }
}

export { Sketch };
