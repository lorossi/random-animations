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
    this._recording = false;

    this._bg = Color.fromMonochrome(10);
    this._levels = 5;
    this._step_duration = 30;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    const heap_size = 2 ** this._levels - 1;
    const heap_values = this._xor128.shuffle_array(
      new Array(heap_size).fill(0).map((_, i) => i + 1),
    );
    this._heap = VisualMaxHeap.from_array(heap_values, this._step_duration);

    document.body.style.backgroundColor = this._bg.hex;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const was_finished = this._heap.finished;

    this.ctx.save();
    this.background(this._bg);
    this._heap.show(this.ctx);
    this.ctx.restore();

    if (was_finished) return;

    if (this._heap.finished && this._recording) {
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
