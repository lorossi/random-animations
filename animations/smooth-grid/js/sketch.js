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

import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._bg = Color.fromMonochrome(240);
    this._time_scl = 0.5;

    this._hex_palettes = [
      ["#D0EFB1", "#B3D89C", "#9DC3C2", "#77A6B6", "#4D7298"],
      ["#1F363D", "#40798C", "#70A9A1", "#9EC1A3", "#CFE0C3"],
      ["#355070", "#6D597A", "#B56576", "#E56B6F", "#EAAC8B"],
      ["#03588C", "#0396A6", "#04BFAD", "#F28963", "#F25C5C"],
      ["#025259", "#007172", "#F29325", "#D94F04", "#F4E2DE"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._cols = this._xor128.random_int(5, 15);
    this._rows = this._xor128.random_int(5, 15);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, false);
    if (this._xor128.random_bool()) this._palette.reverse();

    this._grid = new Grid(
      this.width,
      this._cols,
      this._rows,
      this._xor128.random_int(2e32),
      this._palette,
    );

    this._bg = this._palette.getRandomColor(this._xor128);
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

    const theta = t * Math.PI * 2;
    const tx = (1 + Math.cos(theta)) * this._time_scl;
    const ty = (1 + Math.sin(theta)) * this._time_scl;

    this.ctx.save();
    this.background(this._bg);
    this._grid.update(tx, ty);
    this._grid.show(this.ctx);
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
