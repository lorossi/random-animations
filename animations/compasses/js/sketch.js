import { Engine } from "./lib.js";

import { Color, XOR128, SimplexNoise, Point } from "./lib.js";
import { Compass } from "./compass.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(240);
    this._compass_scl = 0.9;
    this._noise_scl = 0.001;
    this._time_scl = 1;

    // Won't be needed in the next version of the engine (?)
    this.canvas.addEventListener("mouseenter", () => this._mouseEnter());
    this.canvas.addEventListener("mouseleave", () => this._mouseLeave());

    this._mouse_in = false;
    this._last_mouse_pos = new Point(0, 0);

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    const noise_seed = this._xor128.random_int(1e31);
    this._noise = new SimplexNoise(noise_seed);

    const slots = this._xor128.random_int(15, 31);
    const compass_size = this.width / slots;

    this._compasses = new Array(slots * slots).fill(0).map((_, i) => {
      const x = (i % slots) * compass_size + compass_size / 2;
      const y = Math.floor(i / slots) * compass_size + compass_size / 2;
      return new Compass(x, y, compass_size, this._compass_scl, this._noise);
    });

    if (this._mouse_in) {
      this._compasses.forEach((compass) => compass.start_tracking());
      if (this._last_mouse_pos != null)
        this._compasses.forEach((compass) =>
          compass.update_mouse(this._last_mouse_pos.x, this._last_mouse_pos.y),
        );
    }

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    const theta = t * Math.PI * 2;
    const tx = ((1 + Math.cos(theta)) / 2) * this._time_scl;
    const ty = ((1 + Math.sin(theta)) / 2) * this._time_scl;

    this.ctx.save();
    this.background(this._bg);

    this._compasses.forEach((compass) => {
      compass.update_time(tx, ty, this._noise_scl);
      compass.draw(this.ctx, dt);
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

  mouseMoved(mx, my) {
    this._mouse_in = true;
    this._compasses.forEach((compass) => compass.update_mouse(mx, my));
    this._last_mouse_pos = new Point(mx, my);
  }

  click() {
    this.setup();
  }

  _mouseEnter() {
    if (this._recording) return;

    this._mouse_in = true;
    this._compasses.forEach((compass) => compass.start_tracking());
  }

  _mouseLeave() {
    if (this._recording) return;

    this._mouse_in = false;
    this._compasses.forEach((compass) => compass.stop_tracking());
  }
}

export { Sketch };
