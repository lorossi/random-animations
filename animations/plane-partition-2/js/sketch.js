import { Engine, SimplexNoise, Color, XOR128, Palette } from "./lib.js";
import { Rect, Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._min_size = 10;
    this._noise_scl = 0.001;
    this._splits_per_frame = 10;
    this._bg = Color.fromMonochrome(240);
    this._scl = 0.95;

    this._hex_palettes = [
      ["#03588C", "#0396A6", "#04BFAD", "#F28963", "#F25C5C"],
      ["#267365", "#F2CB05", "#F29F05", "#F28705", "#F23030"],
      ["#006BA6", "#0496FF", "#FFBC42", "#D81159", "#8F2D56"],
      ["#2F4858", "#33658A", "#86BBD8", "#F6AE2D", "#F26419"],
      ["#FFBC42", "#D81159", "#8F2D56", "#218380", "#73D2DE"],
      ["#119DA4", "#0C7489", "#13505B", "#040404", "#EEEEEE"],
      ["#5F0F40", "#9A031E", "#FB8B24", "#E36414", "#0F4C5C"],
      ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93"],
      ["#22577A", "#38A3A5", "#57CC99", "#80ED99", "#C7F9CC"],
    ];

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._grid_cols = this._xor128.random_int(1, 5);

    const palettes = this._hex_palettes
      .map((hex_arr) => ({
        order: this._xor128.random(),
        palette: Palette.fromHEXArray(hex_arr),
      }))
      .sort((a, b) => a.order - b.order)
      .map((obj) => obj.palette);

    this._grids = new Array(this._grid_cols ** 2).fill(0).map((_, i) => {
      const grid_size = this.width / this._grid_cols;
      const params = {
        bias: this._xor128.random(0.35, 0.65),
        min_size: this._min_size,
        noise_scl: this._noise_scl,
        splits_per_frame: this._splits_per_frame,
        palette: palettes[i % palettes.length],
        xor128: new XOR128(this._xor128.random_int(1e6)),
        noise: new SimplexNoise(this._xor128.random_int(1e6)),
      };
      const rect = new Rect(
        (i % this._grid_cols) * grid_size,
        Math.floor(i / this._grid_cols) * grid_size,
        grid_size,
        grid_size
      );
      return new Grid(rect, params);
    });

    document.body.style.background = this._bg.rgba;

    this._ended = false;
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

    this._grids.forEach((grid) => grid.update());
    this._grids.forEach((grid) => grid.show(this.ctx));

    this.ctx.restore();

    this._ended = this._grids.every((grid) => grid.ended);
    if (this._ended && this._recording) {
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
