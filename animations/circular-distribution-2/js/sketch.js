import { Engine, SimplexNoise, XOR128, Color } from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._scl = 0.9;
    this._circles_num = 5;
    this._circle_scl = 1;
    this._circle_inner_r = 0.7;
    this._points_num = 2000;
    this._noise_scl = 0.05;
    this._time_scl = 0.5;
    this._circle_color = Color.fromMonochrome(245);
    this._background_color = Color.fromMonochrome(15);
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._circles = new Array(this._circles_num).fill().map((_, i) => {
      const r = (this.width / 2 / this._circles_num) * (i + 1);
      const c = new Circle(this.width / 2, this.height / 2, r);
      c.initDependencies(this._xor128, this._noise);
      c.setAttributes(
        this._points_num,
        this._circle_scl,
        this._circle_inner_r,
        this._noise_scl,
        this._time_scl,
      );
      c.setColor(this._circle_color);
      c.init();

      return c;
    });

    document.body.style.backgroundColor = this._background_color.rgb;

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
    this.background(this._background_color.rgb);
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
