import { Engine, SimplexNoise, XOR128 } from "./lib.js";
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
    const bias = this._xor128.random_interval(0.5, 0.4); // horizontal to vertical bias
    this._rects = [
      new Rectangle(
        0,
        0,
        this.width,
        this.height,
        this._xor128,
        this._noise,
        bias,
      ),
    ];
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
      if (i < this._splits_per_frame) next_rects.push(...r.split());
      else next_rects.push(r);
    });
    this.ctx.restore();

    this._rects = next_rects
      .flat() // flatten the list
      .map((r) => ({ data: r, order: this._xor128.random() })) // add random order
      .sort((a, b) => a.order - b.order) // sort by order
      .map((r) => r.data) // remove order (list is now shuffled)
      .sort((a, b) => a.ended - b.ended); // place rectangles that can be split first

    if (this._rects.every((r) => r.ended)) {
      console.log("%cEnded", "color:yellow");
      this._ended = true;
    }

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
