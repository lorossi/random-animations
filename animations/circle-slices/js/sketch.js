import { Engine, XOR128, Color } from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(15);
    this._fg = Color.fromMonochrome(245);
    this._scl = 0.8;

    this._texture_oversize = 1.5;
    this._texture_scl = 2;

    this._duration = 30;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._slices_num = this._xor128.random_int(8, 15);
    this._slices_scl = this._xor128.random(0.6, 0.95);
    this._dt = this._xor128.random(-1, 1);
    this._direction = this._xor128.pick([-1, 1]);

    this._circle = new Circle(
      this.width / 2,
      this._slices_num,
      this._slices_scl,
      this._fg,
    );

    this._noise_texture = this._createNoiseTexture(
      this._texture_oversize,
      this._texture_scl,
    );

    document.body.style.backgroundColor = this._bg.hex;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg);

    this.ctx.save();
    this.scaleFromCenter(this._scl);

    this._circle.update(t * this._direction + this._dt);
    this._circle.show(this.ctx);
    this.ctx.restore();

    this._applyNoiseTexture(this._noise_texture, this);
    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _createNoiseTexture(oversize, scl) {
    const canvas = document.createElement("canvas");
    canvas.width = this.width * oversize;
    canvas.height = this.height * oversize;
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < canvas.width; x += scl) {
      for (let y = 0; y < canvas.height; y += scl) {
        const w = this._xor128.random_int(255);
        const c = Color.fromMonochrome(w, 0.04);

        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, scl, scl);
      }
    }

    return canvas;
  }

  _applyNoiseTexture(canvas) {
    const wiggle_room = canvas.width - this.width;
    const dx = -this._xor128.random_int(wiggle_room);
    const dy = -this._xor128.random_int(wiggle_room);

    this.ctx.save();
    this.ctx.globalCompositeOperation = "dodge";
    this.ctx.drawImage(canvas, dx, dy);
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
