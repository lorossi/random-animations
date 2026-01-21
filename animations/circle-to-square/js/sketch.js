import { Engine, XOR128, Color } from "./lib.js";
import { Shape } from "./shapes.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._bg_palette = [
      Color.fromHEX("#83c5be"),
      Color.fromHEX("#006d77"),
      Color.fromHEX("#e29578"),
      Color.fromHEX("#fcaf58"),
    ];
    this._shape_color = Color.fromHEX("#edf6f9");
    this._cols = 9;
    this._scl = 0.85;
    this._shape_scl = 0.85;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const shape_size = this.width / this._cols;
    this._shapes = new Array(this._cols ** 2).fill().map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);
      const d = Math.hypot(x, y) / (this._cols * Math.SQRT2);
      return new Shape(
        x * shape_size,
        y * shape_size,
        shape_size,
        this._shape_color,
        this._shape_scl,
        d,
      );
    });

    this._bg = this._xor128.pick(this._bg_palette);
    document.body.style.backgroundColor = this._bg.rgb;

    this._rotation = (this._xor128.random_int(4) * Math.PI) / 2;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = ((this.frameCount - this._frame_offset) / this._duration) % 1;

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this._bg.rgba;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.rotate(this._rotation);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this.ctx.save();
    this._shapes.forEach((s) => {
      s.update(t);
      s.show(this.ctx);
    });
    this.ctx.restore();

    this.ctx.restore();

    if (t == 0 && this.frameCount - this._frame_offset > 0 && this._recording) {
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
