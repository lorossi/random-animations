import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";

class Sketch extends Engine {
  preload() {
    this._duration = 120;
    this._recording = false;

    this._cols = 12;
    this._scl = 0.9;
    this._circle_scl = 0.8;
  }

  setup() {
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;
    const scl = Math.min(this.width, this.height) / this._cols;

    this.ctx.save();
    this.background("rgb(168, 168, 168)");

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2 + scl / 2, -this.height / 2 + scl / 2);

    const eased_t = this._polyEaseInOut(t, 1.25);
    const center = new Point(
      this.width * 0.35 * Math.cos(eased_t * Math.PI * 2),
      this.height * 0.35 * Math.sin(eased_t * Math.PI * 2)
    );

    for (let x = 0; x < this._cols; x++) {
      for (let y = 0; y < this._cols; y++) {
        const pos = new Point(x * scl, y * scl);
        const dist =
          ((pos.x - center.x) ** 2 + (pos.y - center.y) ** 2) ** 0.5 /
          (this.width * Math.SQRT2);
        const phi = Math.PI * dist * 2 + Math.PI;

        this.ctx.save();
        this.ctx.translate(x * scl, y * scl);
        this.ctx.rotate(phi);
        this.ctx.scale(this._circle_scl, this._circle_scl);

        // upper circle, white
        this.ctx.fillStyle = "rgb(255, 255, 255)";
        this.ctx.beginPath();
        this.ctx.arc(0, 0, scl / 2, Math.PI, 2 * Math.PI);
        this.ctx.fill();
        // lower circle, black
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.beginPath();
        this.ctx.arc(0, 0, scl / 2, 0, Math.PI);
        this.ctx.fill();

        this.ctx.restore();
      }
    }
    this.ctx.restore();

    if (t >= 1 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _polyEaseInOut(x, n = 2) {
    return x < 0.5
      ? Math.pow(2, n - 1) * Math.pow(x, n)
      : 1 - Math.pow(-2 * x + 2, n) / 2;
  }
}

export { Sketch };
