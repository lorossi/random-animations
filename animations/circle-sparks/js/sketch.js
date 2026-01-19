import { Engine, SimplexNoise, XOR128, Color } from "./lib.js";
import { Line } from "./line.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._lines_num = 360;
    this._noises_num = 18;
    this._range = 2 ** 6;
    this._scl = 0.85;
    this._center_r = 15;
    this._bg = Color.fromMonochrome(15);
    this._fg = Color.fromMonochrome(240);
  }

  setup() {
    this._seed = new Date().getTime();

    const noises = Array(this._noises_num)
      .fill()
      .map((_, i) => new SimplexNoise(this._seed + i * 10));

    const xor128 = new XOR128(this._seed);

    this._lines = Array(this._lines_num)
      .fill()
      .map((_, i) => {
        const line_seed = Math.sin((i / this._lines_num) * Math.PI * 2);
        const noise = noises[i % this._noises_num];
        return new Line(
          this.width / 2,
          this._range,
          line_seed,
          this._fg,
          noise,
          xor128,
        );
      });

    document.body.style.backgroundColor = this._bg.rgba;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;
    this._lines.forEach((l) => l.update(t));

    this.ctx.save();
    this.background(this._bg);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);

    this._lines.forEach((l, i) => {
      this.ctx.save();
      this.ctx.rotate((i / this._lines_num) * Math.PI * 2);
      l.show(this.ctx);
      this.ctx.restore();
    });

    this.ctx.save();
    this.ctx.fillStyle = this._fg.rgba;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, this._center_r, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();

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
    this.draw();
  }
}

export { Sketch };
