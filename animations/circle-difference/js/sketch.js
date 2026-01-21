import { Engine, XOR128, Color } from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._cols = 2;
    this._scl = 0.95;
    this._circle_scl = 0.75;

    this._bg = Color.fromMonochrome(15);
    this._fg_color = Color.fromMonochrome(245, 0.25);

    this._frame_offset = 0;
    this._duration = 450;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._circles = new Array(this._cols * this._cols).fill().map((_, i) => {
      const scl = this.width / this._cols;
      const r = scl / 2;
      const x = (i % this._cols) * scl + scl / 2;
      const y = Math.floor(i / this._cols) * scl + scl / 2;

      return new Circle(x, y, r * this._circle_scl, this._xor128);
    });

    this.background(this._bg);
    document.body.style.backgroundColor = this._bg.rgba;

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
    this.scaleFromCenter(this._scl);
    this.ctx.strokeStyle = this._fg_color.rgba;

    this._circles.forEach((circle) => {
      circle.draw(t, this.ctx);
    });

    this.ctx.restore();

    if (t == 0 && delta_frame > 0) {
      if (this._recording) {
        this._recording = false;
        this.stopRecording();
        console.log("%cRecording stopped. Saving...", "color:yellow");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
      }

      this.background(this._bg);
    }
  }

  click() {
    this.setup();
  }
}

export { Sketch };
