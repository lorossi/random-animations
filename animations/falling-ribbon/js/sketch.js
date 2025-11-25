import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Ribbon } from "./ribbon.js";

class Sketch extends Engine {
  preload() {
    this._recording = false;
    this._duration = 300; // frames
    this._dy = 1; // pixels per iteration

    this._scl = 0.95;

    this._ribbon_noise_scl = 0.003;
    this._noise_scl = 0.0001;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._simplex = new SimplexNoise(this._seed);

    const full_palette = PaletteFactory.getRandomPalette(this._xor128, false);

    this._bg = full_palette.getColor(0);
    let rest = full_palette.colors.slice(1, full_palette.length);
    if (this._xor128.random_bool()) rest = rest.reverse();
    const palette = new Palette(rest);

    const ribbon_max_width = this.width / palette.length;
    const ribbon_seed = this._xor128.random_int(1e3);

    this._ribbons = Array(palette.length)
      .fill(0)
      .map((_, i) => {
        const seed = ribbon_seed + i;
        return new Ribbon(
          ribbon_max_width,
          this.height,
          palette.getColor(i),
          seed,
          this._dy,
          this._ribbon_noise_scl
        );
      });

    this._steps = Math.ceil(this.height / this._dy);
    this._dxs = new Array(this._steps).fill(0).map((_, i) => {
      const n = this._simplex.noise(i * this._noise_scl, 3000);
      return n * (this.width / 2) * 0.5;
    });
    console.log(this._dxs);

    this.background(this._bg);
    document.body.style.background = this._bg.hex;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const frame = this.frameCount - this._frame_offset;

    this.ctx.save();
    this.scaleFromCenter(this._scl);

    const iterations_per_frame = Math.ceil(this._steps / this._duration);

    for (let i = 0; i < iterations_per_frame; i++) {
      const widths = new Array(this._ribbons.length).fill(0);
      this._ribbons.forEach((ribbon, i) => {
        ribbon.update();
        widths[i] = ribbon.width;
      });

      const total_width = widths.reduce((a, b) => a + b, 0);
      const dx = this._dxs[frame * iterations_per_frame + i];
      this._ribbons.forEach((ribbon, i) => {
        const x =
          this.width / 2 -
          total_width / 2 +
          widths.slice(0, i).reduce((a, b) => a + b, 0);
        ribbon.show(this.ctx, x + dx, 0);
      });
    }

    this.ctx.restore();

    const ended = this._ribbons.every((ribbon) => ribbon.ended);
    if (ended && this._recording) {
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
