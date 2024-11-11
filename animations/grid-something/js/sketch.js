import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._bg_color = Color.fromHEX("#f4f0e8");
    this._grid_color = Color.fromMonochrome(127, 0.5);
    this._grid_cols = 10;
    this._scl = 0.9;
    this._texture_scl = 2;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const walkers_num = 2;
    const palette = PaletteFactory.getRandomPalette(this._xor128);

    this._grid = new Grid(
      this.width,
      this._grid_cols,
      walkers_num,
      this._grid_color,
      palette,
      this._xor128
    );

    this._texture = this._createTexture();
  }

  draw() {
    this.noLoop();

    this.background(this._bg_color);

    this.ctx.save();
    this.scaleFromCenter(this._scl);

    this._grid.update();
    this._grid.show(this.ctx);

    this.ctx.restore();

    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(this._texture, 0, 0);
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext("2d");

    ctx.save();
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const ch = this._xor128.random_int(0, 255);
        ctx.fillStyle = Color.fromMonochrome(ch, 0.03).rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }
    ctx.restore();

    return canvas;
  }
}

export { Sketch };
