import { Engine, XOR128, PaletteFactory, Color } from "./lib.js";

class Sketch extends Engine {
  preload() {
    this._texture_scl = 2;

    this._hex_palettes = [
      ["#ffbe0b", "#fb5607", "#ff006e", "#3a86ff", "#3a86ff"],
      ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
      ["#f72585", "#7209b7", "#3a0ca3", "#4361ee", "#4cc9f0"],
      ["#ffbc42", "#d81159", "#8f2d56", "#218380", "#73d2de"],
      ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
      ["#001427", "#708d81", "#f4d58d", "#bf0603", "#8d0801"],
      ["#27187e", "#758bfd", "#aeb8fe", "#f1f2f6", "#ff8600"],
      ["#355070", "#6d597a", "#b56576", "#e56b6f", "#eaac8b"],
      ["#2e86ab", "#a23b72", "#f18f01", "#c73e1d", "#3b1f2b"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._slots = this._xor128.random_int(15, 25);
    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, true);

    this._col_scl = this.width / this._slots;
    [this._bg, ...this._colors] = this._palette.colors;

    document.body.style.backgroundColor = this._bg.rgb;
  }

  draw() {
    this.noLoop();

    const phi = (this._xor128.random_int(1, 4) * Math.PI) / 2 + Math.PI / 4;

    this.ctx.save();
    this.background(this._bg);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.rotate(phi);
    this.ctx.scale(Math.SQRT2, Math.SQRT2);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    for (let r = 0; r < 1; r++) {
      const y_breaks = this._xor128.shuffle(
        new Array(this._slots).fill(0).map((_, i) => i),
      );
      const x_starts = this._xor128.shuffle(
        new Array(this._slots).fill(0).map((_, i) => i),
      );
      //
      for (let i = 0; i < this._slots; i++) {
        const x_start = x_starts[i] * this._col_scl;
        const y_break = y_breaks[i] * this._col_scl;
        const fill = this._xor128.pick(this._colors);

        const border = fill.copy();
        border.l *= 0.8;

        this.ctx.save();
        this.ctx.fillStyle = fill.rgb;
        this.ctx.strokeStyle = border.rgb;

        this.ctx.beginPath();
        this.ctx.moveTo(x_start, 0);
        this.ctx.lineTo(x_start, y_break);
        this.ctx.lineTo(this.width, y_break);
        this.ctx.lineTo(this.width, y_break - this._col_scl);
        this.ctx.lineTo(x_start + this._col_scl, y_break - this._col_scl);
        this.ctx.lineTo(x_start + this._col_scl, 0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();

        this.ctx.save();
        this.ctx.fillStyle = border.rgb;

        this.ctx.beginPath();
        this.ctx.arc(
          x_start + this._col_scl / 2,
          y_break - this._col_scl / 2,
          (this._col_scl / 2) * 0.8,
          0,
          Math.PI * 2,
          true,
        );
        this.ctx.fill();

        this.ctx.restore();
      }
    }

    this._addTexture();
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.loop();
  }

  _addTexture() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const ch = this._xor128.random(127);
        const c = Color.fromMonochrome(ch, 0.05);

        this.ctx.fillStyle = c.rgba;
        this.ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    this.ctx.restore();
  }
}

export { Sketch };
