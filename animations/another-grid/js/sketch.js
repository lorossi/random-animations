import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Cell } from "./cell.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._texture_size = 2;
    this._max_circles = 2;

    this._bg_palette = [Color.fromHEX("#fff6ec"), Color.fromHEX("#f3edda")];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const palette = PaletteFactory.getRandomPalette(this._xor128);

    this._bg_color = this._xor128.pick(this._bg_palette);
    this._cols = this._xor128.random_int(12, 18);
    const grid_size = this.width / this._cols;

    this._grid = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      const dist =
        (Math.abs(x - this._cols / 2) + Math.abs(y - this._cols / 2)) /
        this._cols;
      const dist_n = this._easeOutPoly(dist, 3);
      const has_background = this._xor128.random() > dist_n;

      let circles_num = 0;
      for (let i = 0; i < this._max_circles; i++) {
        if (this._xor128.random() > dist_n) circles_num++;
        else break;
      }

      const c = new Cell(x * grid_size, y * grid_size, grid_size);
      c.setHasBackground(has_background);
      c.setCirclesNum(circles_num);

      if (has_background || circles_num > 0) {
        const p = palette.copy().shuffle(this._xor128);
        c.setPalette(p);
      }

      return c;
    });

    this._texture = this._createTexture();
  }

  draw() {
    document.body.style.backgroundColor = this._bg_color.hex;

    this.ctx.save();
    this.background(this._bg_color);
    this.scaleFromCenter(this._scl);
    this._grid.forEach((c) => c.show(this.ctx));
    this.ctx.restore();

    this._applyTexture(this._texture);

    this.noLoop();
  }

  click() {
    this.setup();
    this.draw();
  }

  _easeOutPoly(x, n) {
    return 1 - (1 - x) ** n;
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < this.width; x += this._texture_size) {
      for (let y = 0; y < this.height; y += this._texture_size) {
        const n = this._xor128.random(127);
        const c = Color.fromMonochrome(n, 0.1);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_size, this._texture_size);
      }
    }

    return canvas;
  }

  _applyTexture(texture) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "overlay";
    this.ctx.drawImage(texture, 0, 0);
    this.ctx.restore();
  }
}

export { Sketch };
