import { Engine, XOR128, Point, Color } from "./lib.js";
import { Harmonograph } from "./harmonograph.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._cols = 3;
    this._scl = 0.95;
    this._bg = Color.fromMonochrome(15);
    this._fg_color = Color.fromMonochrome(240, 0.5);
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const h_scl = this.width / this._cols;
    this._h = new Array(this._cols ** 2).fill().map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      const h = new Harmonograph(
        x * h_scl + h_scl / 2,
        y * h_scl + h_scl / 2,
        h_scl / 2,
      );
      h.setDependences(this._xor128);
      h.setAttributes(this._fg_color);
      return h;
    });

    this.background(this._bg.rgb);

    this._frame_offset = this.frameCount;
    document.body.style.backgroundColor = this._bg.rgb;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const frame_delta = this.frameCount - this._frame_offset;
    const t = (frame_delta / this._duration) % 1;

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._h.forEach((h) => {
      h.update(t);
      h.draw(this.ctx);
    });

    this.ctx.restore();

    if (t == 0) {
      if (frame_delta > 0 && this._recording) {
        this._recording = false;
        this.stopRecording();
        console.log("%cRecording stopped. Saving...", "color:yellow");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
      }

      if (frame_delta > 0) this.background(this._bg.rgb);
    }
  }

  click() {
    this.setup();
  }
}

export { Sketch };
