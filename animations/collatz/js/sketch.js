import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Sequence } from "./sequence.js";

class Sketch extends Engine {
  preload() {
    this._n = 15;
    this._start_n = 5;
    this._r = 2;
    this._alpha = 0.25;
    this._scl = 0.95;
    this._white = Color.fromMonochrome(245);
    this._bg = Color.fromMonochrome(10);

    this._animated = true;

    this._duration = 300;
    this._recording = false;
  }

  setup() {
    this._sequences = new Array(this._n)
      .fill(0)
      .map(
        (_, i) =>
          new Sequence(i + this._start_n, this._white, this._r, this._alpha)
      );
    this._max_value = Math.max(...this._sequences.map((s) => s.max));

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = this._animated ? (this.frameCount / this._duration) % 1 : 1;
    if (!this._animated) this.noLoop();

    console.log(this._animated, t);

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this._bg.rgba;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, 0);

    const scale = this.width / this._max_value;
    this._sequences.forEach((s) => s.show(this.ctx, scale, t));

    this.ctx.restore();

    // if (t == 0 && this.frameCount > 0 && this._recording) {
    //   this._recording = false;
    //   this.stopRecording();
    //   console.log("%cRecording stopped. Saving...", "color:yellow");
    //   this.saveRecording();
    //   console.log("%cRecording saved", "color:green");
    // }
  }

  click() {
    this.setup();
    this.draw();
  }
}

const collatz = (n, prev = []) => {
  if (n == 1) return prev;
  if (n % 2 == 0) return collatz(n / 2, [...prev, n]);
  return collatz(3 * n + 1, [...prev, n]);
};

export { Sketch };
