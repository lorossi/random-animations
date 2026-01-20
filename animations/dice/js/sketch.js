import { Engine, XOR128, Color } from "./lib.js";
import { Die } from "./die.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._bg = Color.fromMonochrome(10);
    this._noise_scl = 0.00075;
    this._noise_rho = 1;
    this._scl = 0.95;
    this._cols = 25;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    const size = this.width / this._cols;
    const dice_seed = this._xor128.random_int(1e6);

    this._dice = Array(this._cols * this._cols)
      .fill(0)
      .map(
        (_, i) =>
          new Die(
            (i % this._cols) * size,
            Math.floor(i / this._cols) * size,
            size,
            dice_seed,
            this._noise_scl,
          ),
      );

    document.body.style.background = this._bg.hex;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    const theta = t * Math.PI * 2;
    const tx = (1 + Math.cos(theta)) * this._noise_rho;
    const ty = (1 + Math.sin(theta)) * this._noise_rho;

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._dice.forEach((die) => {
      die.update(tx, ty);
      die.show(this.ctx);
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
