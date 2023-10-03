import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Sine } from "./sines.js";

class Sketch extends Engine {
  preload() {
    this._sin_num = 10;
    this._sin_spacing = 0.8;
    this._scl = 0.8;
    this._noise_scl = 0.1;

    this._duration = 120;
    this._recording = false;
    this._frame_offset = 0;
  }

  setup() {
    const seed = new Date().getTime();
    this._sin_width = this.width / this._sin_num;

    this._xor128 = new XOR128(seed);
    this._sin_pos = new Point(0, 0);

    console.log(this._sin_pos);

    this._sines = new Array(this._sin_num)
      .fill(0)
      .map(
        () =>
          new Sine(
            this._sin_width * this._sin_spacing +
              this._xor128.random_interval(0, 0.5) * this._sin_width,
            this.height,
            this._xor128
          )
      );

    this._max_nodes = this._sines.reduce(
      (acc, sine) => (sine.nodes_num > acc ? sine.nodes_num : acc),
      0
    );

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }

    this.background("rgb(15, 15, 15)");
  }

  draw() {
    const t = ((this.frameCount - this._frame_offset) / this._duration) % 1;

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._sines.forEach((sine, i) => {
      const sine_t = t / (sine.nodes_num / this._max_nodes);
      this.ctx.save();
      this.ctx.translate(this.width / 2, this.height / 2);
      this.ctx.rotate((Math.PI / 2) * i);
      this.ctx.translate(-this.width / 2, -this.height / 2);

      this.ctx.translate(i * this._sin_width + this._sin_width / 2, 0);
      this.ctx.rotate(sine.rotation);
      sine.draw(this.ctx, sine_t);
      this.ctx.restore();
    });

    this.ctx.restore();

    if (t == 0 && this.frameCount - this._frame_offset > 0) {
      if (this._recording) {
        this._recording = false;
        this.stopRecording();
        console.log("%cRecording stopped. Saving...", "color:yellow");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
      }

      this.noLoop();
    }
  }

  click() {
    this._frame_offset = this.frameCount;
    this.setup();
    this.loop();
  }
}

export { Sketch };
