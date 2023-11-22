import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Inverter } from "./inverter.js";
import { Square } from "./square.js";
import { Particle } from "./particles.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._min_cols = 2;
    this._max_cols = 5;

    this._min_stripes_num = 4;
    this._max_stripes_num = 9;

    this._min_inverter_scl = 4;
    this._min_inverter_density = 0.25;
    this._max_inverter_density = 1;

    this._particles_num = 10000;
    this._particles_scl = 10;
    this._colors = ["rgb(15, 15, 15)", "rgb(240, 240, 240)"];

    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
  }

  setup() {
    const cols = this._xor128.random_int(this._min_cols, this._max_cols);
    const stripes_num = this._xor128.random_int(
      this._min_stripes_num,
      this._max_stripes_num
    );
    const stripe_scl = this.width / cols / stripes_num;
    const inverter_scl =
      (stripe_scl / 2) *
      this._xor128.random_int(this._min_inverter_scl, stripes_num);

    const inverters_num = Math.floor(cols ** 2 * 2);

    this._squares = Array(cols ** 2)
      .fill()
      .map((_, i) => {
        const x = i % cols;
        const y = Math.floor(i / cols);

        const xx = (x * this.width) / cols;
        const yy = (y * this.height) / cols;

        const colors =
          (x + y) % 2 == 0 ? [...this._colors] : [...this._colors].reverse();

        return new Square(xx, yy, this.width / cols, stripe_scl, colors);
      });

    this._inverters = Array(inverters_num)
      .fill()
      .map(
        () => new Inverter(this.width, this.height, inverter_scl, this._xor128)
      );

    this._particles = Array(this._particles_num)
      .fill()
      .map(
        () =>
          new Particle(
            this.width,
            this.height,
            this._particles_scl,
            this._xor128
          )
      );

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this._squares.forEach((s) => s.show(this.ctx));
    this.ctx.restore();

    this.ctx.save();
    this._inverters.forEach((i) => i.update(t));
    this._inverters.forEach((i) => i.show(this.ctx));
    this.ctx.restore();

    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this._particles.forEach((p) => p.show(this.ctx));
    this.ctx.restore();

    if (t >= 1 && this._recording) {
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
