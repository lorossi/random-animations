import { Engine, PaletteFactory, XOR128, Color } from "./lib.js";
import { Cell } from "./cell.js";

class Sketch extends Engine {
  preload() {
    this._level_scl = 0.8;
    this._scl = 0.9;
    this._bg = Color.fromMonochrome(245);
    this._border = Color.fromMonochrome(15);
    this._texture_scl = 4;

    this._hex_palettes = [
      ["#dcdcdd", "#c5c3c6", "#46494c", "#4c5c68", "#1985a1"],
      ["#f79256", "#fbd1a2", "#7dcfb6", "#00b2ca", "#1d4e89"],
      ["#ed6a5a", "#f4f1bb", "#9bc1bc", "#5ca4a9", "#e6ebe0"],
      ["#247ba0", "#70c1b3", "#b2dbbf", "#f3ffbd", "#ff1654"],
      ["#227c9d", "#17c3b2", "#ffcb77", "#fef9ef", "#fe6d73"],
      ["#cfdbd5", "#e8eddf", "#f5cb5c", "#242423", "#333533"],
      ["#f1faee", "#a8dadc", "#457b9d", "#1d3557"],
      ["#bee9e8", "#62b6cb", "#1b4965", "#cae9ff", "#5fa8d3"],
      ["#0081a7", "#00afb9", "#fdfcdc", "#fed9b7", "#f07167"],
      ["#22577a", "#38a3a5", "#57cc99", "#80ed99", "#c7f9cc"],
      ["#05668d", "#427aa1", "#ebf2fa", "#679436", "#a5be00"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);
    this._cols = this._xor128.random_int(2, 5);

    const size = this.width / this._cols;
    this._cells = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const levels = this._xor128.random_int(2, 5);

      const x = (i % this._cols) * size;
      const y = Math.floor(i / this._cols) * size;

      const c = new Cell(x, y, size, levels, this._level_scl);
      c.setPalette(this._palette);
      c.setXOR128(this._xor128);
      return c;
    });

    document.body.style.background = this._bg.rgb;
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
