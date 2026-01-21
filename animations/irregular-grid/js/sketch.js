import { Engine, SimplexNoise, XOR128, PaletteFactory, Color } from "./lib.js";

// inspired by https://pinterest.com/pin/354447433192469891/ and https://pinterest.com/pin/378654281183132577/

class Sketch extends Engine {
  preload() {
    this._scl = 0.9;
    this._cols = 50;
    this._noise_scl = 0.05;
    this._texture_scl = 2;
    this._bg_color = Color.fromMonochrome(245);

    this._hex_palettes = [
      ["#d6d6d6", "#ffee32", "#ffd100", "#202020", "#333533"],
      ["#011627", "#fdfffc", "#2ec4b6", "#e71d36", "#ff9f1c"],
      ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
      ["#3d348b", "#7678ed", "#f7b801", "#f18701", "#f35b04"],
      ["#3d348b", "#7678ed", "#f7b801", "#f18701", "#f35b04"],
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
      ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"],
    ];
  }

  setup() {
    this._seed = Date.now();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e16));
    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);

    this._texture_canvas = this._generateTextureCanvas();
  }

  draw() {
    const scl = this.width / this._cols;

    this.noLoop();

    this.ctx.save();
    this.background(this._bg_color);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    for (let x = 0; x < this._cols; x++) {
      for (let y = 0; y < this._cols; y++) {
        const dist = Math.hypot(
          x - this._cols / 2 + 0.5,
          y - this._cols / 2 + 0.5,
        );

        const dist_n = dist / (this._cols / 2);
        const n = this._noise.noise(x * this._noise_scl, y * this._noise_scl);
        const nn = this._easeOutPoly((n + 1) / 2, 1.5);

        let color_i;

        if (dist_n > nn) color_i = x % this._palette.length;
        else color_i = Math.floor(nn * this._palette.length + x);

        const color = this._palette.getColor(color_i);

        this.ctx.save();
        this.ctx.translate((x + 0.5) * scl, (y + 0.5) * scl);
        this.ctx.fillStyle = color.rgba;
        this.ctx.fillRect(-scl / 2, -scl / 2, scl, scl);
        this.ctx.restore();
      }
    }

    this._applyTexture(this._texture_canvas);
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }

  _easeOutPoly(x, n = 2) {
    return 1 - Math.pow(1 - x, n);
  }

  _generateTextureCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext("2d");

    ctx.save();
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const ch = this._xor128.random_int(255);
        const color = Color.fromMonochrome(ch, 0.1);
        ctx.fillStyle = color.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    ctx.restore();

    return canvas;
  }

  _applyTexture(texture_canvas) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(texture_canvas, 0, 0);
    this.ctx.restore();
  }
}

export { Sketch };
