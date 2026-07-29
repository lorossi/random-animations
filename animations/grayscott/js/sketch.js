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

import { GrayScottFactory, GrayScottType } from "./grayscott.js";

class Sketch extends Engine {
  preload() {
    this._recording = false;
    this._n = 250; // grid size
    this._cols = 1; // number of columns in the grid

    this._steps_per_frame = 10; // number of simulation steps per frame

    this._hex_array = [
      ["#083D77", "#EBEBD3"],
      ["#223843", "#EFF1F3"],
      ["#393E41", "#D3D0CB"],
      ["#F6D8AE", "#2E4057"],
      ["#FEFEFE", "#0F0F0F"],
    ]; // array of color palettes in HEX format
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._palette_factory = PaletteFactory.fromHEXArray(
      this._hex_array,
      this._xor128,
    );
    this._palette = this._palette_factory.getRandomPalette(this._xor128, true);
    [this._bg, this._fg] = this._palette.colors;

    const scl = Math.floor(this.width / this._cols / this._n);
    const type = GrayScottFactory.randomType(this._xor128);
    console.log(`GrayScott type: ${type}`);
    this._grayscott = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const col = i % this._cols;
      const row = Math.floor(i / this._cols);
      const x = col * this._n * scl;
      const y = row * this._n * scl;
      return GrayScottFactory.create(
        type,
        x,
        y,
        this._n,
        scl,
        this._xor128.random_int(1e12),
        this._fg,
      );
    });

    document.body.style.background = this._fg.hex;

    this._frame_offset = this.frame_count;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    this.background(this._bg);
    this._grayscott.forEach((gs) => gs.step(this._steps_per_frame));
    this._grayscott.forEach((gs) => gs.draw(this.ctx));
  }

  click() {
    const delta_frame = this.frame_count - this._frame_offset;
    if (delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }

    this.setup();
  }
}

export { Sketch };
