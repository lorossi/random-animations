import { Engine, XOR128, Color } from "./lib.js";
import { Blind } from "./blind.js";

class Sketch extends Engine {
  preload() {
    this._cols = 9;
    this._duration = 900;
    this._recording = false;
    this._texture_oversize = 1.05;
    this._texture_scl = 2;
    this._scl = 0.9;
    this._bg = Color.fromMonochrome(245);
    this._fg = Color.fromMonochrome(15);
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const col_scl = this.width / this._cols;
    this._blinds = new Array(this._cols ** 2).fill().map((_, i) => {
      const x = (i % this._cols) * col_scl;
      const y = Math.floor(i / this._cols) * col_scl;
      const size = col_scl;
      const seed = this._xor128.random_int(1e9);
      return new Blind(x, y, size, seed, this._fg);
    });

    this._texture = this._createTexture();
    document.body.style.background = this._bg.rgba;

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
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._blinds.forEach((blind) => {
      blind.update(t);
      blind.draw(this.ctx);
    });

    this.ctx.restore();

    this._applyTexture(this.ctx);

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width * this._texture_oversize;
    canvas.height = this.height * this._texture_oversize;

    const ctx = canvas.getContext("2d");
    for (let x = 0; x < canvas.width; x += this._texture_scl) {
      for (let y = 0; y < canvas.height; y += this._texture_scl) {
        const c = this._xor128.random_int(127);
        const color = Color.fromMonochrome(c, 0.075);
        ctx.fillStyle = color.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return canvas;
  }

  _applyTexture(ctx) {
    const dx = this._xor128.random_int(
      this.width * (this._texture_oversize - 1),
    );
    const dy = this._xor128.random_int(
      this.height * (this._texture_oversize - 1),
    );

    ctx.save();
    ctx.globalCompositeOperation = "dodge";
    ctx.drawImage(this._texture, -dx, -dy);
    ctx.restore();
  }

  click() {
    this.setup();
  }
}

export { Sketch };
