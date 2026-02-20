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

import { Trail } from "./trail.js";
import { ErrorScreen } from "./error.js";
import { Bliss } from "./background.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromHEX("#245DDA");
    this._slots = 32;
    this._trail_length = 32;
    this._trails_num = 16;
    this._trail_speed = 1;
    this._error_windows_num = 6;
    this._error_window_duration = 60;

    this._noise_scl = 0.001;
    this._time_scl = 0.001;
    this._seed_scl = 0.1;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    const noise_seed = this._xor128.random_int(1e32 - 1);
    this._noise = new SimplexNoise(noise_seed);

    const canvas_size = new Point(this.width, this.height);

    this._bliss = new Bliss(canvas_size, this._xor128);
    this._error_screens = new Array(this._error_windows_num).fill().map(() => {
      return new ErrorScreen(
        canvas_size,
        this._xor128,
        this._error_window_duration,
      );
    });

    this._trails = new Array(this._trails_num).fill().map((_, i) => {
      const x = this._xor128.random_int(0, this.width);
      const y = this._xor128.random_int(0, this.height);
      const p = new Point(x, y);
      return new Trail(
        this._trail_length,
        this._trail_speed,
        this._noise_scl,
        i * this._seed_scl,
        p,
        canvas_size,
        this._xor128,
        this._noise,
      );
    });

    document.body.style.background = this._bg.rgba;
    this._frame_offset = this.frameCount;
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;
    const nt = delta_frame * this._time_scl;

    this.ctx.save();
    this.background(this._bg);

    this._bliss.draw(this.ctx);

    this._error_screens.forEach((screen) => {
      screen.update();
      screen.draw(this.ctx);
    });
    this._trails.forEach((trail) => {
      trail.update(dt, nt);
      trail.draw(this.ctx);
    });
    this.ctx.restore();
  }

  click() {
    this.setup();
  }
}

export { Sketch };
