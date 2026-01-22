import { Engine, PaletteFactory, XOR128 } from "./lib.js";

import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._cell_scl = 0.85;

    this._hex_palettes = [
      // ["#FFFCF2", "#CCC5B9", "#403D39", "#252422", "#EB5E28"],
      // ["#000000", "#2F4550", "#586F7C", "#B8DBD9", "#F4F4F9"],
      // ["#353535", "#3C6E71", "#FFFFFF", "#D9D9D9", "#284B63"],
      ["#01161E", "#124559", "#598392", "#AEC3B0", "#EFF6E0"],
    ];

    this._update_every = 1;

    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, false);
    if (this._xor128.random_bool()) this._palette.reverse();

    this._grid = new Grid(
      this.width,
      this._cell_scl,
      this._palette,
      this._xor128,
    );

    this._bg = this._xor128.pick([
      this._palette.getColor(0),
      this._palette.getColor(this._palette.length - 1),
    ]);
    document.body.style.background = this._bg.hex;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);
    if (delta_frame % this._update_every === 0) {
      this._grid.update();
    }
    this._grid.show(this.ctx);

    this.ctx.restore();

    if (delta_frame * this._update_every > 0 && this._recording) {
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
