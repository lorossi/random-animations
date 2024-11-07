import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Harmonograph, Harmonic } from "./harmonograph.js";

class Sketch extends Engine {
  preload() {
    this._duration = 1800;
    this._recording = false;

    this._cols = 3;
    this._harmonics_per_cell = 4;
    this._bg = Color.fromMonochrome(15);
    this._fg_color = Color.fromMonochrome(240);
    this._scl = 0.9;
  }

  click() {
    this.setup();
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const h_scl = this.width / this._cols;

    // calculate the amplitues
    let amplitudes = new Array(this._harmonics_per_cell)
      .fill()
      .map(() => this._xor128.random(0.2, 1) * this._xor128.pick([-1, 1]));
    // normalize the amplitudes so that the sum is 1
    const sum = amplitudes.reduce((acc, a) => acc + a);
    amplitudes = amplitudes.map((a) => a / sum);

    this._harmonics = new Array(this._harmonics_per_cell).fill().map((_, i) => {
      const A = (amplitudes[i] * h_scl) / 10;
      const omega = this._xor128.random_int(1, 8);
      const phi = this._xor128.random(2 * Math.PI);
      return new Harmonic(A, omega, phi);
    });

    this._h = new Array(this._cols ** 2).fill().map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);
      const phi = (i / this._cols ** 2) * 2 * Math.PI;

      const h = new Harmonograph(
        x * h_scl + h_scl / 2,
        y * h_scl + h_scl / 2,
        h_scl / 2,
        phi
      );

      h.setArmonics(this._harmonics);
      h.setFgColor(this._fg_color);
      return h;
    });

    this.background(this._bg);

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = ((this.frameCount - this._frame_offset) / this._duration) % 1;
    this.ctx.save();
    this.scaleFromCenter(this._scl);
    this._h.forEach((h) => {
      h.update(t);
      h.draw(this.ctx);
    });

    this.ctx.restore();

    const ended = this._h.every((h) => h.ended);
    if (ended) {
      if (this._recording) {
        this._recording = false;
        this.stopRecording();
        console.log("%cRecording stopped. Saving...", "color:yellow");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
      }

      console.log("%cAnimation ended", "color:green");
      this.setup();
    }
  }

  _lcm(a, b) {
    return (a * b) / this._gcd(a, b);
  }

  _gcd(a, b) {
    if (b == 0) return a;

    return this._gcd(b, a % b);
  }
}

export { Sketch };
