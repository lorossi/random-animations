import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Frame, Sine } from "./frame.js";

class Sketch extends Engine {
  preload() {
    this._cols = 3;
    this._bg = Color.fromMonochrome(15);
    this._scl = 0.9;
    this._frame_scl = 0.9;

    this._duration = 300;
    this._recording = false;
  }

  setup() {
    this._frame_offset = this.frameCount;
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const frame_size = this.width / this._cols;
    this._sines = new Array(4).fill(null).map(() => {
      const rho = this._xor128.random(0.1, 0.9) * frame_size * this._frame_scl;
      const omega = this._xor128.random_int(2, 8);
      const phi = this._xor128.random(Math.PI * 2);
      return new Sine(rho, omega, phi);
    });

    this._frames = new Array(this._cols * this._cols).fill(null).map((_, i) => {
      const x = (i % this._cols) * frame_size;
      const y = Math.floor(i / this._cols) * frame_size;
      const offset = Math.hypot(x, y) / (this.width * Math.SQRT2);
      const f = new Frame(x, y, frame_size, this._frame_scl);

      f.setSines(this._sines);
      f.setOffset(offset);
      f.setBG(this._bg);
      f.setRandom(this._xor128);
      f.init();
      return f;
    });

    this.background(this._bg);

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = ((this.frameCount - this._frame_offset) / this._duration) % 1;

    if (t == 0) this.background(this._bg);

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._frames.forEach((f) => {
      f.update(t);
      f.show(this.ctx);
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
