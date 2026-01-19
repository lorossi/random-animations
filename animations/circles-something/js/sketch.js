import { Engine, XOR128, Color } from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromHEX("#ffe8d6");
    this._cols = 15;
    this._circle_scl = 0.9;
    this._scl = 0.9;
    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const circle_size = Math.min(this.width, this.height) / this._cols;
    this._circles = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      return new Circle(x, y, circle_size, this._circle_scl, this._xor128);
    });

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.background(this._bg);
    this.ctx.save();

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._circles.forEach((c) => c.update(t));
    this._circles.forEach((c) => c.drawOrbit(this.ctx));
    this._circles.forEach((c) => c.draw(this.ctx));

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
  }
}

export { Sketch };
