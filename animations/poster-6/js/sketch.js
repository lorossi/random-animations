import { Engine, PaletteFactory, XOR128, Color } from "./lib.js";
import { Cell } from "./cell.js";

class Sketch extends Engine {
  preload() {
    this._texture_scl = 4;
    this._circle_scl = 0.9;
    this._scl = 0.9;
    this._bg = Color.fromMonochrome(245);
    this._border = Color.fromMonochrome(15);

    this._hex_palettes = [
      ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b"],
      ["#177e89", "#084c61", "#db3a34", "#ffc857", "#323031"],
      ["#fffcf2", "#ccc5b9", "#403d39", "#252422", "#eb5e28"],
      ["#011627", "#fdfffc", "#2ec4b6", "#e71d36", "#ff9f1c"],
      ["#335c67", "#fff3b0", "#e09f3e", "#9e2a2b", "#540b0e"],
      ["#8cb369", "#f4e285", "#f4a259", "#5b8e7d", "#bc4b51"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);
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
    this.background(this._bg.rgba);
    this.scaleFromCenter(this._scl);

    this._cells.forEach((c) => c.draw(this.ctx));

    this.ctx.strokeStyle = this._border.rgb;
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(0, 0, this.width, this.height);
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
