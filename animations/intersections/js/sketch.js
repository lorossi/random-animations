import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._texture_scl = 2;
  }

  setup() {
    const seed = new Date().getTime();

    this._xor128 = new XOR128(seed);
    const palette = PaletteFactory.getRandomPalette(this._xor128);

    let sorted_colors = palette.colors.sort((a, b) => b.l - a.l);
    this._bg_color = sorted_colors.shift();

    const remaining_palette = new Palette(sorted_colors);

    const grid_scl = this._xor128.random(0.4, 0.6);
    const rect_count = this._xor128.random_int(3, 5);
    this._grid = new Grid(this.width, 10, grid_scl, rect_count);
    this._grid.setRandom(this._xor128.random_int(1e16));
    this._grid.setPalette(remaining_palette);

    this._texture = this._createTexture();

    document.body.style.backgroundColor = this._bg_color.rgba;
  }

  draw() {
    this.noLoop();
    this.ctx.save();
    this.background(this._bg_color);

    this._grid.show(this.ctx);

    this._applyTexture(this._texture);

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
        const color = Color.fromMonochrome(ch, 0.075);
        ctx.fillStyle = color.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }
    ctx.restore();

    return canvas;
  }

  _applyTexture(texture) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(texture, 0, 0);
    this.ctx.restore();
  }
}

export { Sketch };
