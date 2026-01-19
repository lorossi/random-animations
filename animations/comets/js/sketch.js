import { Engine, SimplexNoise, XOR128, Color } from "./lib.js";
import { Line } from "./line.js";

class Sketch extends Engine {
  preload() {
    this._lines_num = 15;
    this._background_color = Color.fromMonochrome(15);
    this._scl = 0.9;
    this._time_scl = 1;
    this._points_num = 500;

    this._duration = 600;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._lines = new Array(this._lines_num).fill(0).map((_, i) => {
      const r = (this.width / 2) * ((i + 1) / (this._lines_num + 2));
      const w = (this.width / 2 / this._lines_num) * 0.125;
      const ch = this._xor128.random(180, 250);
      const color = Color.fromMonochrome(ch, 0.8);
      const direction = i % 2 == 0 ? 1 : -1;
      const l = new Line(r, w, color, direction);
      this._xor128.random_bool();
      l.setAttributes(this._time_scl, this._points_num);
      l.initDependencies(this._xor128, this._noise);
      return l;
    });

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this.background(this._background_color.rgb);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this._lines.forEach((l) => {
      l.update(t);
      l.show(this.ctx);
    });
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
