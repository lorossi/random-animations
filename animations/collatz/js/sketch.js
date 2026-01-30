import { Engine, Color, XOR128 } from "./lib.js";
import { Sequence } from "./sequence.js";

class Sketch extends Engine {
  preload() {
    this._r = 2;
    this._alpha = 0.25;
    this._scl = 0.95;
    this._white = Color.fromMonochrome(245);
    this._bg = Color.fromMonochrome(10);

    this._duration = 300;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._n = this._xor128.random_int(12, 36);
    this._start_n = this._xor128.random_int(3, 6);

    this._sequences = new Array(this._n)
      .fill(0)
      .map(
        (_, i) =>
          new Sequence(i + this._start_n, this._white, this._r, this._alpha),
      );
    this._max_value = Math.max(...this._sequences.map((s) => s.max));

    document.body.style.backgroundColor = this._bg.rgb;

    this._ended = false;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;
    if (t == 0 && delta_frame > 0) this._ended = true;

    // stop the timing and recording when the animation loop ends
    const tt = this._ended ? 1 : t;

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);
    this.ctx.translate(0, this.width / 2);

    const scale = this.width / this._max_value;
    this._sequences.forEach((s) => s.show(this.ctx, scale, tt));

    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
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
