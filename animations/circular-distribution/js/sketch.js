import { Engine, SimplexNoise, XOR128, Color } from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._cols = 2;
    this._scl = 0.9;
    this._circle_scl = 0.9;
    this._circle_inner_r = 0.6;
    this._points_num = 2500;
    this._noise_scl = 0.05;
    this._time_scl = 0.75;
    this._fg = Color.fromMonochrome(245);
    this._bg = Color.fromMonochrome(15);
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    const circle_r = this.width / this._cols / 2;
    this._circles = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = (i % this._cols) * circle_r * 2 + circle_r;
      const y = Math.floor(i / this._cols) * circle_r * 2 + circle_r;
      const c = new Circle(x, y, circle_r);

      c.initDependencies(this._xor128, this._noise);
      c.setColor(this._fg);
      c.setAttributes(
        this._points_num,
        this._circle_scl,
        this._circle_inner_r,
        this._noise_scl,
        this._time_scl,
      );
      c.init();
      return c;
    });

    document.body.style.backgroundColor = this._bg.rgb;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg.rgb);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    this._circles.forEach((c) => {
      c.update(t);
      c.show(this.ctx);
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
  }
}

export { Sketch };
