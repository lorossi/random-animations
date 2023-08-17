import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Sines } from "./sines.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._sines_num = 6;
    this._omega = 2;
    this._vertical_omega = 2;
    this._background = "#01112e";
    this._sines_colors = ["#e8a93f", "#0B87BA"];
    this._sines_shades = ["#D38F5E", "#014D69"];
    this._segments_num = 25;

    this._scl = 0.9;
  }

  setup() {
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }

    this._sines = [];
    for (let i = 0; i < this._sines_num; i++) {
      const phi = (i / this._sines_num) * Math.PI * 2;
      const dx = ((i + 1) / (this._sines_num + 1)) * this.width;
      const width = this.width / this._sines_num;

      const s = new Sines(
        dx,
        width,
        this.height,
        phi,
        this._omega,
        this._vertical_omega,
        this._segments_num,
        this._sines_colors[i % this._sines_colors.length],
        this._sines_shades[i % this._sines_shades.length]
      );
      this._sines.push(s);
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this._background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._sines.forEach((s) => s.show(this.ctx, t));

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
