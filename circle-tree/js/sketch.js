import { Engine, SimplexNoise } from "./engine.js";
import { Line } from "./line.js";
import { XOR128 } from "./xor128.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._lines_num = 360;
    this._noises_num = 18;
    this._range = 2 ** 6;
    this._scl = 0.85;
    this._center_r = 15;
  }

  setup() {
    const seed = new Date().getTime();

    const noises = Array(this._noises_num)
      .fill()
      .map((_, i) => new SimplexNoise(seed + i * 10));

    const xor128 = new XOR128(seed);

    this._lines = Array(this._lines_num)
      .fill()
      .map((_, i) => {
        const seed = Math.sin((i / this._lines_num) * Math.PI * 2);
        const noise = noises[i % this._noises_num];
        return new Line(this.width / 2, this._range, seed, noise, xor128);
      });

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;
    this._lines.forEach((l) => l.update(t));

    this.ctx.save();
    this.background("rgb(15, 15, 15)");
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);

    this._lines.forEach((l, i) => {
      this.ctx.save();
      this.ctx.rotate((i / this._lines_num) * Math.PI * 2);
      l.show(this.ctx);
      this.ctx.restore();
    });

    this.ctx.save();
    this.ctx.fillStyle = "rgb(240, 240, 240)";

    this.ctx.beginPath();
    this.ctx.arc(0, 0, this._center_r, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();

    this.ctx.restore();

    if (t >= 1 && this._recording) {
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
}

export { Sketch };
