import { Color, Engine, Point, Utils, XOR128 } from "./lib.js";

import { Circle } from "./circle.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._colors = [Color.fromMonochrome(20), Color.fromMonochrome(235)];
    this._special_colors = [
      Color.fromHex("#802626"),
      Color.fromHex("#008842"),
      Color.fromHex("#006eb8"),
      Color.fromHex("#f99d1b"),
    ];

    this._scl = 0.9;
    this._noise_scl = 0.75;
    this._circle_scl = 0.5;

    this._phase_duration = 30;
    this._recording = false;

    this._frame_queued = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    [this._bg, this._fg] = this._xor128.shuffle_array(this._colors);
    const special_color = this._xor128.pick(this._special_colors);

    this._slots = this._xor128.random_int(4, 15);
    if (this._slots % 2 != 0) this._slots++;

    const grid_seed = this._xor128.random_int(2 ** 32);
    this._grid = new Grid(this._slots, grid_seed, 50000, this._noise_scl);
    this._grid.solve();

    const circle_radius = this.width / this._slots / 2;
    const special_i = Math.floor(this._slots ** 2 / 2);
    this._circles = new Array(this._slots ** 2).fill(0).map((_, i) => {
      const x = i % this._slots;
      const y = Math.floor(i / this._slots);
      const pos = new Point(x, y);
      const color = i === special_i ? special_color : this._fg;
      return new Circle(pos, circle_radius, this._circle_scl, color);
    });

    // assign initial destinations

    document.body.style.background = this._bg.hex;
    this._steps = 0;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._phase_duration) % 1;
    const eased_t = Utils.ease_in_out_poly(t, 7);

    if (t == 0) {
      this._grid.rotate_path();
      const path = this._grid.path_points;

      for (let i = 0; i < path.length; i++) {
        const current = path[i];
        const next = path[(i + 1) % path.length];
        this._circles[i].setStart(current);
        this._circles[i].setDestination(next);
      }

      if (delta_frame !== 0) {
        this._steps++;
      }
    }

    if (
      this._frame_queued &&
      delta_frame % this._phase_duration == Math.floor(this._phase_duration / 2)
    ) {
      this._frame_queued = false;
      this.saveFrame();
    }

    this.background(this._bg);

    this.ctx.save();
    this.scaleFromCenter(this._scl);
    this._circles.forEach((c) => c.update(eased_t));
    this._circles.forEach((c) => c.draw(this.ctx));
    this.ctx.restore();

    if (t == 0 && this._steps == this._slots ** 2 && this._recording) {
      this._recording = false;
      this.stopRecording();
      this.saveRecording();
    }
  }

  click() {
    this.setup();
  }

  keyPress(key, code) {
    if (key == "Enter") {
      console.log("Steps:", this._steps);
      this._frame_queued = true;
      return;
    }
  }
}

export { Sketch };
