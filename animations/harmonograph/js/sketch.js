import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Harmonograph } from "./harmonograph.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._cols = 3;
    this._scl = 0.95;
    this._bg_color = Color.fromMonochrome(15);
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
        h_scl / 2
      );
      h.setDependences(this._xor128);
      h.setAttributes(this._fg_color);
      return h;
    });

    this.background(this._bg_color.rgb);

    this._frame_offset = this.frameCount;
    document.body.style.backgroundColor = this._bg_color.rgb;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = ((this.frameCount - this._frame_offset) / this._duration) % 1;

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
      if (this.frameCount > 0 && this._recording) {
        this._recording = false;
        this.stopRecording();
        console.log("%cRecording stopped. Saving...", "color:yellow");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
      }

      if (this.frameCount - this._frame_offset > 0)
        this.background(this._bg_color.rgb);
    }
  }

  click() {
    this.setup();
  }
}

export { Sketch };
