import {
  Color,
  Engine,
  GradientPalette,
  Palette,
  PaletteFactory,
  Point,
  SimplexNoise,
  XOR128,
} from "./lib.js";

import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._line_stripes = 3;
    this._hex_palettes = [
      ["#22577A", "#38A3A5", "#57CC99", "#80ED99", "#C7F9CC"],
      ["#355070", "#6D597A", "#B56576", "#E56B6F", "#EAAC8B"],
      ["#F4F1DE", "#E07A5F", "#3D405B", "#81B29A", "#F2CC8F"],
      ["#FFFCF2", "#CCC5B9", "#403D39", "#252422", "#EB5E28"],
      ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
    ];
    this._scl = 0.95;

    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._grid_slots = this._xor128.random_int(16, 40);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, true);
    if (this._xor128.random_bool()) this._palette.reverse();

    this._grid = new Grid(
      this.width,
      this._grid_slots,
      this._line_stripes,
      this._palette,
      this._xor128.random_int(1e6),
    );
    this._bg = this._palette.getColor(this._line_stripes + 1);

    document.body.style.background = this._bg.rgba;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);
    this._grid.update();
    this._grid.show(this.ctx);
    this.ctx.restore();

    if (this._recording && this._grid.ended) {
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
