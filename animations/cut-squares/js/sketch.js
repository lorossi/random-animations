import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Square } from "./square.js";
import { PaletteFactory } from "./palette.js";

class Sketch extends Engine {
  preload() {
    this._cols = 12;
    this._scl = 0.9;
    this._square_scl = 0.8;
    this._noise_scl = 0.15;
    this._texture_scl = 3;

    this._duration = 300;
    this._recording = false;
    this._current_palette = 0;

    console.log("Available palettes:", PaletteFactory.getPaletteCount());
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128);
    this._noise.setDetail(2, 0.25);

    this._createTexture();
    this._palette = PaletteFactory.getPalette(this._current_palette);

    document.body.style.backgroundColor = this._palette.background.rgb;

    const square_size = this.width / this._cols;
    this._squares = new Array(this._cols * this._cols)
      .fill(null)
      .map((_, i) => {
        const x = i % this._cols;
        const y = Math.floor(i / this._cols);
        return new Square(
          x * square_size,
          y * square_size,
          square_size,
          this._square_scl,
          this._palette.foreground
        );
      });

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this.background(this._palette.background.rgb);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._squares.forEach((square, i) => {
      const x = (i % this._cols) - this._cols / 2 + 0.5;
      const y = Math.floor(i / this._cols) - this._cols / 2 + 0.5;
      const dist = Math.atan2(y, x) / (2 * Math.PI) + 0.5;
      const phi = dist;
      square.update(t + phi);
      square.draw(this.ctx);
    });

    this.ctx.restore();

    this._drawTexture(this.ctx);

    if (t >= 1 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _createTexture() {
    this._texture = document.createElement("canvas");
    this._texture.width = this.width;
    this._texture.height = this.height;

    const ctx = this._texture.getContext("2d");
    ctx.save();
    for (let x = 0; x < this._texture.width; x += this._texture_scl) {
      for (let y = 0; y < this._texture.height; y += this._texture_scl) {
        const n = this._xor128.random(127);
        const c = Color.fromMonochrome(n, 0.05);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }
    ctx.restore();
  }

  _drawTexture() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(this._texture, 0, 0);
    this.ctx.restore();
  }

  click() {
    this._current_palette =
      (this._current_palette + 1) % PaletteFactory.getPaletteCount();
    this.setup();
    this.draw();
  }
}

export { Sketch };
