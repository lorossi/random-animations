import { Engine, XOR128, Color, PaletteFactory } from "./lib.js";
import { Square } from "./square.js";

class Sketch extends Engine {
  preload() {
    this._cols = 10;
    this._scl = 0.95;
    this._texture_scl = 2;

    this._hex_palettes = [
      ["#8ecae6", "#219ebc", "#023047", "#ffb703", "#fb8500"],
      ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
      ["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557"],
      ["#003049", "#d62828", "#f77f00", "#fcbf49", "#eae2b7"],
      ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
      ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
      ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b"],
      ["#066043", "#5e794c", "#c65b54", "#d0812c", "#daa603"],
      [
        "#001219",
        "#005f73",
        "#0a9396",
        "#94d2bd",
        "#e9d8a6",
        "#ee9b00",
        "#ca6702",
        "#bb3e03",
        "#ae2012",
        "#9b2226",
      ],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);

    const scl = this.width / this._cols;

    this._squares = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = (i % this._cols) * scl;
      const y = Math.floor(i / this._cols) * scl;
      const s = new Square(x, y, scl);
      s.setRandom(this._xor128);
      s.setPalette(this._palette);
      return s;
    });

    this._bg = this._palette.getRandomColor(this._xor128);
    document.body.style.backgroundColor = this._bg.rgb;
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
