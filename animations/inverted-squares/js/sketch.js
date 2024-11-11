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

    this._texture_scl = 4;
    this._texture_oversampling = 2;

    this._colors = [Color.fromMonochrome(15), Color.fromMonochrome(245)];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

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

    this._noise_texture = this._generateNoiseTexture(
      this._texture_scl,
      this._texture_oversampling
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

    this._applyNoiseTexture(this._noise_texture);

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

  _generateNoiseTexture(scl = 2, oversampling = 16) {
    const canvas = document.createElement("canvas");
    canvas.width = this.width * oversampling;
    canvas.height = this.height * oversampling;

    const ctx = canvas.getContext("2d");

    for (let y = 0; y < this.height * oversampling; y += scl) {
      for (let x = 0; x < this.width * oversampling; x += scl) {
        const ch = this._xor128.random_int(0, 127);
        const c = Color.fromMonochrome(ch, 0.1);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, scl, scl);
      }
    }

    return canvas;
  }

  _applyNoiseTexture(texture) {
    const dx = -this._xor128.random_int(
      this.width * (this._texture_oversampling - 1)
    );
    const dy = -this._xor128.random_int(
      this.height * (this._texture_oversampling - 1)
    );

    this.ctx.save();
    this.ctx.globalCompositeOperation = "hard-light";
    this.ctx.drawImage(
      texture,
      dx,
      dy,
      this.width * this._texture_oversampling,
      this.height * this._texture_oversampling
    );
    this.ctx.restore();
  }
}

export { Sketch };
