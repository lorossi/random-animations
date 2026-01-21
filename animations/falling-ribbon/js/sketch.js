import {
  Engine,
  SimplexNoise,
  XOR128,
  Palette,
  PaletteFactory,
} from "./lib.js";
import { Ribbon } from "./ribbon.js";

class Sketch extends Engine {
  preload() {
    this._recording = false;
    this._duration = 300; // frames
    this._dy = 1; // pixels per iteration

    this._scl = 0.95;

    this._ribbon_noise_scl = 0.003;
    this._noise_scl = 0.0001;

    this._hex_palettes = [
      ["#FFFFED", "#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"],
      [
        "#0A0a0a",
        "#F8F9FA",
        "#E9ECEF",
        "#DEE2E6",
        "#CED4DA",
        "#ADB5BD",
        "#6C757D",
        "#495057",
        "#343A40",
        "#212529",
      ],
      [
        "#E9D8A6",
        "#001219",
        "#005F73",
        "#0A9396",
        "#94D2BD",
        "#EE9B00",
        "#CA6702",
        "#BB3E03",
        "#AE2012",
        "#9B2226",
      ],
      ["#FFFCF2", "#CCC5B9", "#403D39", "#252422", "#EB5E28"],
      ["#EDAE49", "#D1495B", "#00798C", "#30638E", "#003D5B"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._simplex = new SimplexNoise(this._seed);

    const palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    const full_palette = palette_factory.getRandomPalette(this._xor128, false);

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
          this._ribbon_noise_scl,
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
