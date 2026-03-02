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

import { Tower } from "./tower.js";
import { Line } from "./line.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromHEX("#f8eee9");
    this._hex_colors = ["#660708", "#e5383b"];
    this._scl = 0.95;
    this._noise_scl = 0.05;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e16));

    this._towers_num = this._xor128.random_int(5, 12);
    this._towers_slots = this._xor128.random_int(5, 12);
    this._palette = GradientPalette.fromHEXColors(
      ...this._hex_colors,
      this._towers_slots,
    );

    this._towers_width = this.width / (this._towers_num * 2 + 1);
    this._towers_height = this.height;

    this._towers = new Array(this._towers_num).fill().map((_, i) => {
      const x = this._towers_width * (2 * i + 1);
      return new Tower(
        x,
        this.height,
        this._towers_width,
        this._towers_height,
        this._towers_slots,
      );
    });

    this._towers_slot_values = new Array(this._towers_num).fill().map((_, x) =>
      new Array(this._towers_slots)
        .fill()
        .map((_, y) => ({
          n: this._noise.noise(x * this._noise_scl, y * this._noise_scl, 1000),
          y: y,
        }))
        .sort((a, b) => a.n - b.n)
        .map((p) => p.y),
    );

    this._lines_i = new Array(this._towers_num).fill().map((_, x) =>
      new Array(this._towers_slots)
        .fill()
        .map((_, y) => ({
          n: this._noise.noise(x * this._noise_scl, y * this._noise_scl, 2000),
          y: y,
        }))
        .sort((a, b) => a.n - b.n)
        .map((p) => p.y),
    );

    // perform a transposition to get the lines points
    this._lines_points = new Array(this._towers_slots).fill().map((_, y) =>
      new Array(this._towers_num).fill().map((_, x) => {
        const slot = this._lines_i[x][y];
        return { coords: this._towers[x].get_coords(slot), i: slot };
      }),
    );

    this._lines = new Array(this._towers_slots)
      .fill()
      .map(
        (_, i) =>
          new Line(this._towers_width, this._lines_points[i], this._palette),
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
    this._towers.forEach((tower, i) => {
      tower.update(this._towers_slot_values[i], t);
      tower.show(this.ctx);
    });
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
