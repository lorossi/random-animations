import { Color, Engine, SimplexNoise, XOR128 } from "./lib.js";
import { Sun } from "./sun.js";

class Sketch extends Engine {
  preload() {
    this._noise_scl = 0.25;
    this._time_scl = 0.5;
    this._rays_count = 500;
    this._bg = Color.fromMonochrome(20);
    this._scl = 0.95;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));
    this._stagger = this._xor128.random_int(1, 5);

    const inner_r = this.width / 16;
    const outer_r = this.width / 2;
    this._sun = new Sun(inner_r, outer_r, this._seed, this._rays_count);

    document.body.style.backgroundColor = this._bg.rgba;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    const time_theta = t * 2 * Math.PI;
    const tx = (1 + Math.cos(time_theta)) * this._time_scl;
    const ty = (1 + Math.sin(time_theta)) * this._time_scl;

    this.ctx.save();
    this.background(this._bg);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);

    this._sun.update(tx, ty, this._noise_scl);
    this._sun.show(this.ctx, this._stagger);

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
