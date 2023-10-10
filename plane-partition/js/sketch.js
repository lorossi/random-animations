import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Rectangle } from "./rectangle.js";

class Sketch extends Engine {
  preload() {
    this._splits_per_frame = 10;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(seed);
    const bias = this._xor128.random_interval(0.5, 0.2); // horizontal to vertical bias
    this._rects = [
      new Rectangle(
        0,
        0,
        this.width,
        this.height,
        this._xor128,
        this._noise,
        bias
      ),
    ];
    this._last_length = 1;
    this._ended = false;

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    if (this._ended) return;

    let next_rects = [];

    this.ctx.save();
    this.background("rgb(255, 255, 255)");
    this._rects.forEach((r, i) => {
      r.show(this.ctx);
      // next_rects.push(...r.split());
      if (i < this._splits_per_frame) next_rects.push(...r.split());
      else next_rects.push(r);
    });
    this.ctx.restore();

    this._rects = next_rects
      .flat() // flatten the list
      .map((r) => ({ data: r, order: this._xor128.random() })) // add random order
      .sort((a, b) => a.order - b.order) // sort by order
      .map((r) => r.data); // remove order (list is now shuffled)

    if (this._rects.length == this._last_length) {
      console.log("%cEnded", "color:yellow");
      this._ended = true;
    }
    this._last_length = this._rects.length;

    if (this._ended && this._recording) {
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
