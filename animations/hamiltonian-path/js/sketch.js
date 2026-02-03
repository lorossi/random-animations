import { PaletteFactory, Engine, XOR128 } from "./lib.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._duration = 600;
    this._recording = false;

    this._hex_palettes = [
      ["#DA525D", "#064F6E"],
      ["#C56127", "#007190"],
      ["#E2B540", "#4F4086"],
      ["#F2545B", "#2D6A4F"],
      ["#FFA400", "#009FFD"],
      ["#A63A50", "#F0E7D8"],
      ["#F1F7ED", "#243E36"],
    ];
    this._grid_cols = 1;
    this._scl = 0.98;
    this._noise_scl = 0.5;
    this._max_tries = 5e3;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, true);
    [this._fg, this._bg] = this._palette.colors;

    this._slots = this._xor128.random_int(24, 40);
    if (this._slots % 2 != 0) this._slots++;

    this._grid_size = this.width / this._grid_cols;

    this._grids = new Array(this._grid_cols ** 2).fill(0).map((_, i) => {
      return new Grid(
        this._grid_size,
        this._slots,
        this._xor128.random_int(1e9),
        this._noise_scl,
        this._max_tries,
        this._fg,
      );
    });
    this._grids.forEach((g) => g.solve());

    document.body.style.background = this._bg.rgba;
    this._animation_freeze = false;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;

    if (delta_frame % this._duration === 0 && delta_frame > 0) {
      this._animation_freeze = true;
      this.noLoop();
    }

    const t = this._animation_freeze ? 1 : (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._grids.forEach((grid, i) => {
      const x = (i % this._grid_cols) * this._grid_size;
      const y = Math.floor(i / this._grid_cols) * this._grid_size;
      this.ctx.save();
      this.ctx.translate(x, y);
      grid.update(t);
      grid.show(this.ctx);
      this.ctx.restore();
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
    if (this._animation_freeze) {
      this.setup();
      this.loop();
    } else {
      this._animation_freeze = true;
    }
  }
}

export { Sketch };
