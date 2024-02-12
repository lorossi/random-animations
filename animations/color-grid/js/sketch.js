import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { PaletteFactory } from "./palette-factory.js";

class Sketch extends Engine {
  preload() {
    this._cols = 20;
    this._texture_scl = 4;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const col_scl = this.width / this._cols;
    const palette = PaletteFactory.getRandomPalette(this._xor128);
    const [bg, ...colors] = palette.colors;

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = bg.rgb;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const temp_canvas = document.createElement("canvas");
    temp_canvas.width = this.width;
    temp_canvas.height = this.height;
    const temp_ctx = temp_canvas.getContext("2d");

    for (let r = 0; r < 1; r++) {
      const y_breaks = this._fillShuffleArray(this._cols);
      const x_starts = this._fillShuffleArray(this._cols);
      for (let i = 0; i < this._cols; i++) {
        const x_start = x_starts[i] * col_scl;
        const y_break = y_breaks[i] * col_scl;
        const fill = this._xor128.pick(colors);

        const border = fill.copy();
        border.l *= 0.8;

        temp_ctx.save();
        temp_ctx.fillStyle = fill.rgb;
        temp_ctx.strokeStyle = border.rgb;

        temp_ctx.beginPath();
        temp_ctx.moveTo(x_start, 0);
        temp_ctx.lineTo(x_start, y_break);
        temp_ctx.lineTo(this.width, y_break);
        temp_ctx.lineTo(this.width, y_break - col_scl);
        temp_ctx.lineTo(x_start + col_scl, y_break - col_scl);
        temp_ctx.lineTo(x_start + col_scl, 0);
        temp_ctx.closePath();
        temp_ctx.fill();
        temp_ctx.stroke();

        temp_ctx.restore();

        temp_ctx.save();
        temp_ctx.fillStyle = border.rgb;

        temp_ctx.beginPath();
        temp_ctx.arc(
          x_start + col_scl / 2,
          y_break - col_scl / 2,
          (col_scl / 2) * 0.8,
          0,
          Math.PI * 2,
          true
        );
        temp_ctx.fill();

        temp_ctx.restore();
      }
    }

    // Draw the temp canvas to the main canvas
    const phi = (this._xor128.random_int(1, 4) * Math.PI) / 2;
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.rotate(-Math.PI / 4 + phi);
    this.ctx.scale(Math.SQRT2, Math.SQRT2);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    this.ctx.drawImage(temp_canvas, 0, 0);
    this.ctx.restore();
    this._addTexture();
    this.ctx.restore();

    this.noLoop();
  }

  draw() {}

  click() {
    this.setup();
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
  _fillShuffleArray(n) {
    return new Array(n)
      .fill(0)
      .map((_, i) => ({ i: i, order: this._xor128.random() }))
      .sort((a, b) => a.order - b.order)
      .map((v) => v.i);
  }
}

export { Sketch };
