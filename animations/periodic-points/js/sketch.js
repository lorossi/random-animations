import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { PeriodicPoint } from "./point.js";

class Sketch extends Engine {
  preload() {
    this._cols = 10;
    this._points_scl = 0.5;
    this._points_n = 3;
    this._scl = 0.8;
    this._bg = Color.fromMonochrome(15);

    this._duration = 300;
    this._recording = false;
  }

  setup() {
    const seed = Date.now();
    const scl = Math.min(this.width, this.height) / this._cols;

    this._xor128 = new XOR128(seed);

    this._points = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);
      const r = (scl * this._points_scl) / 2;

      return new PeriodicPoint(
        x * scl + scl / 2,
        y * scl + scl / 2,
        r,
        this._points_n,
        this._duration,
        this._xor128
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
    this.background(this._bg.rgb);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._points.forEach((point) => point.show(this.ctx, t));
    this.ctx.restore();

    if (t >= 1 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }
}

export { Sketch };
