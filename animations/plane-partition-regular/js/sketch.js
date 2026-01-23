import { Engine, SimplexNoise, XOR128, Color } from "./lib.js";
import { Rectangle } from "./rectangle.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(15);
    this._fg = Color.fromMonochrome(245);

    this._splits_per_frame = 5;
    this._scl = 0.95;
    this._split_probability = 0.75;

    this._recording = false;
    this._frame_offset = 0;
    this._ease_duration = 120;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(seed);
    this._rects = [
      new Rectangle(
        0,
        0,
        this.width,
        this._split_probability,
        this._fg,
        this._xor128,
        this._noise,
      ),
    ];
    this._ended = false;

    document.body.style.backgroundColor = this._bg.rgba;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    if (this._ended) return;

    const elapsed = this.frameCount - this._frame_offset;
    const split_this_frame =
      elapsed < this._ease_duration
        ? this._easeIn(elapsed / this._ease_duration) * this._splits_per_frame
        : this._splits_per_frame;

    let next_rects = [];
    this.ctx.save();
    this.background(this._bg.rgb);
    this.scaleFromCenter(this._scl);

    this._rects.forEach((r, i) => {
      r.show(this.ctx);
      if (i < split_this_frame) next_rects.push(...r.split());
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
    this._frame_offset = this.frameCount;
    this.setup();
  }

  _easeIn(x) {
    return Math.sin((x * Math.PI) / 2);
  }
}

export { Sketch };
