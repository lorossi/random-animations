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
import { Line } from "./line.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._texture_scl = 4;
    this._texture_oversize = 1.05;
    this._hex_palettes = [
      ["#cad2c5", "#84a98c", "#52796f", "#354f52", "#2f3e46"],
      ["#eff1ed", "#373d20", "#717744", "#bcbd8b", "#766153"],
      ["#22223b", "#4a4e69", "#9a8c98", "#c9ada7", "#f2e9e4"],
      ["#353535", "#3c6e71", "#ffffff", "#d9d9d9", "#284b63"],
      ["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._lines_num = this._xor128.random_int(5, 20);
    this._rect_num = this._xor128.random_int(5, 20);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);
    [this._bg, ...this._fg] = this._palette.colors.sort(
      (a, b) => b.luminance - a.luminance,
    );

    const scl = this._xor128.random(0.9, 1);
    this._lines = new Array(this._lines_num).fill().map((_, i) => {
      const y = (i / this._lines_num) * this.height;
      const width = this.width;
      const height = this.height / this._lines_num;
      const fg = this._xor128.pick(this._fg);

      return new Line(y, width, height, this._rect_num, scl, fg, this._xor128);
    });

    document.body.style.backgroundColor = this._bg.hex;

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
    this._lines.forEach((line) => {
      line.update(t);
      line.draw(this.ctx);
    });

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
