import { Engine, XOR128, Color } from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._circles_num = 14;
    this._bg = Color.fromMonochrome(245);
    this._scl = 0.95;

    this._duration = 300;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const h = this._xor128.random(360);
    const palette = new Array(this._circles_num).fill().map((_, i) => {
      const x = i / this._circles_num;
      const v = 20 + x * 40;
      return Color.fromHSL(h, 40, v);
    });

    this._circles = new Array(this._circles_num)
      .fill()
      .map((_, i) => {
        const c = palette[i];
        const r = (this.height / 2 / this._circles_num) * (i + 1);
        const phi = (i * Math.PI * 2) / this._circles_num;

        return new Circle(r, c, phi);
      })
      .reverse();

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = ((this.frameCount - this._frame_offset) / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);

    this._circles.forEach((c) => {
      c.update(t);
      c.show(this.ctx);
    });

    this.ctx.restore();

    if (t == 0 && this.frameCount - this._frame_offset > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    if (!this._recording) {
      this.setup();
    }
  }
}

export { Sketch };
