import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Square } from "./square.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._bg = Color.fromMonochrome(240);
    this._scl = 0.95;

    this._texture_scl = 4;
    this._texture_oversize = 1.25;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette = PaletteFactory.getRandomPalette(this._xor128);
    this._cols = this._xor128.random_int(8, 15);

    const square_size = Math.min(this.width, this.height) / this._cols;
    const square_seed = this._xor128.random_int(1e9);
    this._squares = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const steps = this._xor128.random_int(4, 10);
      const x = (i % this._cols) * square_size;
      const y = Math.floor(i / this._cols) * square_size;
      return new Square(
        x,
        y,
        square_size,
        steps,
        this._palette,
        square_seed + i
      );
    });

    this._texture = this._generateTexture();

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._squares.forEach((square) => square.update(t));
    this._squares.forEach((square) => square.draw(this.ctx));
    this.ctx.restore();

    this._applyTexture(this._texture);
    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    this.setup();
    this.draw();
  }

  _generateTexture() {
    const size = Math.floor(
      Math.max(this.width, this.height) * this._texture_oversize
    );
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < size; x += this._texture_scl) {
      for (let y = 0; y < size; y += this._texture_scl) {
        const ch = this._xor128.random_int(255);
        const c = Color.fromMonochrome(ch);

        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return canvas;
  }

  _applyTexture(texture) {
    const oversize =
      (this._texture_oversize - 1) * Math.min(this.width, this.height);
    const dx = -this._xor128.random_int(oversize);
    const dy = -this._xor128.random_int(oversize);

    this.ctx.save();
    this.ctx.globalAlpha = 0.04;
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(texture, dx, dy);
    this.ctx.restore();
  }
}

export { Sketch };
