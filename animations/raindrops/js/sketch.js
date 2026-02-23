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

import { Raindrop } from "./raindrop.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._bg = Color.fromMonochrome(240);
    this._raindrop_color = Color.fromCSS("lightblue");
  }

  setup() {
    this._drop = new Raindrop(
      this.width / 2,
      this.height / 2,
      this.width / 10,
      this.height / 10,
      this._raindrop_color,
    );

    this._frame_offset = this.frame_count;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frame_count - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg);
    this._drop.show(this.ctx);
    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }
}

export { Sketch };
