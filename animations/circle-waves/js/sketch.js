import { Engine, Color, Point } from "./lib.js";
import { Circle } from "./circle.js";
class Sketch extends Engine {
  preload() {
    this._duration = 120;
    this._recording = false;

    this._slots = 12;
    this._scl = 0.9;
    this._circle_scl = 0.8;

    this._bg = Color.fromMonochrome(168);
    this._white = Color.fromMonochrome(240);
    this._black = Color.fromMonochrome(15);
  }

  setup() {
    this._circle_size = this.width / this._slots;
    this._max_dist = this.width * Math.SQRT2;
    this._circles = new Array(this._slots * this._slots).fill().map((_, i) => {
      const x = i % this._slots;
      const y = Math.floor(i / this._slots);
      return new Circle(
        x,
        y,
        this._circle_size,
        this._circle_scl,
        this._white,
        this._black,
      );
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

    const eased_t = this._polyEaseInOut(t, 1.25);
    const theta = eased_t * Math.PI * 2;
    const dy = Math.sin(theta) * (this.height * 0.5);
    const center = new Point(this.width / 2, this.height / 2 + dy);

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._circles.forEach((circle) => {
      circle.update(center, this._max_dist);
      circle.draw(this.ctx);
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

  _polyEaseInOut(x, n = 2) {
    return x < 0.5
      ? Math.pow(2, n - 1) * Math.pow(x, n)
      : 1 - Math.pow(-2 * x + 2, n) / 2;
  }

  click() {
    this.setup();
  }
}

export { Sketch };
