import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Line } from "./lines.js";

class Sketch extends Engine {
  preload() {
    this._inner_r = 0.1;
    this._outer_r = 0.5;
    this._scl = 0.9;
    this._lines_num = 100;
    this._points_num = 100;
    this._displacement = 50;
    this._noise_scl = 0.005;
    this._seed_scl = 0.2;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._lines = new Array(this._lines_num).fill(0).map((_, i) => {
      const angle = (i / this._lines_num) * Math.PI * 2;
      const start = this._inner_r * this.width;
      const length = (this._outer_r - this._inner_r) * this.width;
      const points = this._points_num;

      const line = new Line(angle, start, length, points);
      line.setAttributes(
        this._points_num,
        this._displacement,
        this._noise_scl,
        this._seed_scl
      );
      line.initDependencies(this._xor128, this._noise);
      return line;
    });

    this.background("black");

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    // this.background("black");
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);

    this.ctx.save();
    this._lines.forEach((l) => {
      l.update(t);
      l.draw(this.ctx);
    });
    this.ctx.restore();

    this.ctx.restore();

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
  }
}

export { Sketch };
