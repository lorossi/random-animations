import {
  Color,
  Engine,
  GradientPalette,
  Palette,
  PaletteFactory,
  Point,
  SimplexNoise,
  XOR128,
} from "./lib.js";
import { Grid } from "./grid.js";
import { RotatingPoint } from "./rotating_point.js";

class Sketch extends Engine {
  preload() {
    this._points_num = 8;
    this._scl = 4;

    this._palette = new Palette([
      Color.fromMonochrome(20),
      Color.fromMonochrome(225),
    ]);

    this._duration = 600;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._points = new Array(this._points_num).fill().map(() => {
      const x = this._xor128.random_int(this.width);
      const y = this._xor128.random_int(this.height);
      const r = this.width / 32;
      const dir = this._xor128.pick([-1, 1]);
      const dt = this._xor128.random(1);
      const strength = this._xor128.random_int(1, 3);
      return new RotatingPoint(x, y, r, dir, dt, strength);
    });

    this._grid = new Grid(this.width, this._scl);

    const bg = this._palette.getRandomColor(this._xor128);
    this.background(bg);

    document.body.style.backgroundColor = bg.rgba;
    this._frame_offset = this.frameCount;
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;
    this._points.forEach((p) => p.update(t));
    this._grid.update(this._points);

    this.ctx.save();

    this._grid.show(this.ctx, this._scl, this._palette);
    this._points.forEach((p) => p.show(this.ctx, this._scl));

    this.ctx.restore();

    if (this._recording && t == 0 && delta_frame > 0) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    this.setup();
    this.loop();
  }
}

export { Sketch };
