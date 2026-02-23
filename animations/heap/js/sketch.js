import { Engine } from "./lib.js";

import {
  Color,
  GradientPalette,
  Palette,
  PaletteFactory,
  Point,
  SimplexNoise,
  Utils,
  XOR128,
} from "./lib.js";

import { VisualMaxHeap } from "./heap.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._bg = Color.fromMonochrome(10);
    this._levels = 6;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    const heap_size = 2 ** this._levels - 1;
    const heap_values = this._xor128.shuffle_array(
      new Array(heap_size).fill(0).map((_, i) => i + 1),
    );
    this._heap = VisualMaxHeap.from_array(heap_values);

    this._frame_offset = this.frame_count;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frame_count - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;
    console.log(this._heap.length);

    this.ctx.save();
    this.background(this._bg);
    // this.scaleFromCenter(0.9);
    this._heap.show(this.ctx);
    this.ctx.restore();

    // if (t == 0 && delta_frame > 0 && this._recording) {
    //   this._recording = false;
    //   this.stopRecording();
    //   console.log("%cRecording stopped. Saving...", "color:yellow");
    //   this.saveRecording();
    //   console.log("%cRecording saved", "color:green");
    // }
  }

  click() {
    this.setup();
  }
}

export { Sketch };
