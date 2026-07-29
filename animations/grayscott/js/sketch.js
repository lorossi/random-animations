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
    this._bg = Color.fromMonochrome(240);
    this._fg = Color.fromMonochrome(15);
    this._n = 500; // grid size
    this._type = GrayScottType.SOLITONS; // color scheme
    this._cols = 1; // number of columns in the grid

    this._steps_per_frame = 5; // number of simulation steps per frame
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const scl = Math.floor(this.width / this._cols / this._n);

    this._grayscott = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const col = i % this._cols;
      const row = Math.floor(i / this._cols);
      const x = col * this._n * scl;
      const y = row * this._n * scl;
      return GrayScottFactory.create(
        this._type,
        x,
        y,
        this._n,
        scl,
        this._xor128.random_int(1e12),
        Color.fromMonochrome(15),
      );
    });

    document.body.style.background = this._bg.hex;

    this._frame_offset = this.frame_count;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frame_count - this._frame_offset;
    const ended = false; // to do: implement a condition to end the sketch

    this.background(this._bg);
    this._grayscott.forEach((gs) => {
      if (!gs.hasConverged()) gs.step(this._steps_per_frame);
    });
    this._grayscott.forEach((gs) => gs.draw(this.ctx));

    if (ended && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }

    if (this.frameCount % 100 === 0) {
      console.log(this.frameCount, this.frameRateAverage);
    }
  }

  click() {
    this.setup();
  }
}

export { Sketch };
