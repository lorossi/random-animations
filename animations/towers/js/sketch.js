import { Engine } from "./lib.js";

import { Color, PaletteFactory, SimplexNoise, XOR128 } from "./lib.js";

import { Tower } from "./tower.js";
import { Line } from "./line.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(240);
    this._scl = 0.95;
    this._line_noise_scl = 0.1;
    this._hex_palettes = [
      // https://coolors.co/palette/5f0f40-9a031e-fb8b24-e36414-0f4c5c
      ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
      // https://coolors.co/palette/001427-708d81-f4d58d-bf0603-8d0801
      ["#001427", "#708d81", "#f4d58d", "#bf0603", "#8d0801"],
      // https://coolors.co/palette/33658a-86bbd8-2f4858-f6ae2d-f26419
      ["#33658a", "#86bbd8", "#2f4858", "#f6ae2d", "#f26419"],
      // https://coolors.co/palette/55dde0-33658a-2f4858-f6ae2d-f26419
      ["#55dde0", "#33658a", "#2f4858", "#f6ae2d", "#f26419"],
    ];
    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e16));

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);

    this._towers_num = this._xor128.random_int(5, 8);
    this._towers_slots = this._xor128.random_int(-1, 4) + this._towers_num;

    this._towers_width = this.width / (this._towers_num * 2 + 1);
    this._towers_height = this.height;

    this._towers = new Array(this._towers_num).fill().map((_, i) => {
      const x = this._towers_width * (2 * i + 1);
      return new Tower(
        x,
        this._towers_width,
        this._towers_height,
        this._towers_slots,
        this._xor128.random_int(2 ** 32),
      );
    });

    this._lines_points = new Array(this._towers_slots).fill().map((_, x) => {
      return new Array(this._towers_num).fill().map((_, y) => {
        const n = this._noise.noise(
          x * this._line_noise_scl,
          y * this._line_noise_scl,
          1000,
        );
        const i = Math.floor(((n + 1) / 2) * this._towers_slots);
        const tower = this._towers[y];
        return tower.get_coords(i);
      });
    });

    this._lines = new Array(this._towers_slots)
      .fill()
      .map(
        (_, i) =>
          new Line(
            this._towers_width,
            this._lines_points[i],
            this._palette.getColor(i),
          ),
      );

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
    this.scaleFromCenter(this._scl);
    this._towers.forEach((tower) => tower.show(this.ctx));
    this._lines.forEach((line) => line.show(this.ctx));
    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }

    this.noLoop();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
