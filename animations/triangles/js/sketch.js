import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Triangle } from "./triangle.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._cols = 50;
    this._noise_scl = 0.0125;
    this._time_scl = 0.1;
    this._scl = 1;
    this._texture_scl = 3;
    this._fg = Color.fromHEX("#130e0a");
    this._bg = Color.fromHEX("#dcd7c4");
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    const triangle_scl = this.width / this._cols;
    this._triangles = new Array(this._cols * this._cols)
      .fill(null)
      .map((_, i) => {
        const x = i % this._cols;
        const y = Math.floor(i / this._cols);
        const t = new Triangle(
          x * triangle_scl,
          y * triangle_scl,
          triangle_scl,
          y / this._cols,
        );
        t.setDependences(this._xor128, this._noise);
        t.setAttributes(this._fg, this._noise_scl, this._time_scl);
        return t;
      });
    this._frame_offset = this.frameCount;
    this._texture = this._createTexture();

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }

    document.body.style.backgroundColor = this._bg.rgb;
  }

  draw() {
    const t = ((this.frameCount - this._frame_offset) / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg.rgb);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._triangles.forEach((triangle) => {
      triangle.show(t, this.ctx);
    });

    this.ctx.restore();

    this._drawTexture(this.ctx);

    if (t == 0 && this.frameCount > 0 && this._recording) {
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

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext("2d");

    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const c = this._xor128.random_int(127);
        ctx.fillStyle = Color.fromMonochrome(c, 0.05).rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return canvas;
  }

  _drawTexture(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(this._texture, 0, 0);
    ctx.restore();
  }
}

export { Sketch };
