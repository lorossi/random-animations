import { Engine } from "./lib.js";

import { Color, Utils, SimplexNoise, XOR128 } from "./lib.js";

import { Tower } from "./tower.js";
import { Line } from "./line.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(240);
    this._fg = Color.fromMonochrome(15);
    this._scl = 0.95;
    this._duration = 300;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e16));

    const towers_num = this._xor128.random_int(5, 8);
    const towers_slots = this._xor128.random_int(-1, 4) + towers_num;

    const towers_width = this.width / (towers_num * 2 + 1);
    const towers_height = this.height;

    const circle_radius = towers_width * 0.1;
    const lines_num = Utils.clamp(
      towers_num + this._xor128.random_int(-1, 2),
      1,
      towers_slots,
    );

    this._towers = new Array(towers_num).fill().map((_, i) => {
      const x = towers_width * (2 * i + 1);
      return new Tower(
        x,
        towers_width,
        towers_height,
        towers_slots,
        this._xor128,
        this._noise,
      );
    });

    const lines_points = new Array(lines_num)
      .fill()
      .map((_, x) => {
        const points = new Array(towers_num)
          .fill()
          .map((_, y) => this._towers[y].get_score_coords(x));
        const order = this._xor128.random();
        return { points, order };
      })
      .sort((a, b) => a.order - b.order)
      .map((l) => l.points);

    this._lines = new Array(lines_num).fill().map((_, x) => {
      return new Line(towers_width, circle_radius, lines_points[x], this._fg);
    });

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
    this._lines.forEach((line) => {
      line.update(t);
      line.show(this.ctx);
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
    this.setup();
    this.draw();
  }
}

export { Sketch };
