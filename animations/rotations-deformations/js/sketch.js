import { Engine, XOR128, Color } from "./lib.js";
import { Blob } from "./blob.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(15);
    this._fg = Color.fromMonochrome(255, 0.25);
    this._text_fg = Color.fromMonochrome(255, 0.75);
    this._speed = 1;
    this._noise_scl = 0.02;
    this._scl = 0.95;

    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._rotation = (this._xor128.random_int() * Math.PI) / 2;

    const rows = this._xor128.random_int(4, 8);
    const blob_size = this.height / rows;
    this._blobs = new Array(rows).fill(0).map((_, i) => {
      const x = blob_size / 2;
      const y = blob_size / 2 + i * blob_size;
      const seed = this._xor128.random_int(1e6);
      const b = new Blob(
        x,
        y,
        blob_size,
        this._speed,
        seed,
        this.width / 2,
        this._fg,
      );
      b.setNoiseScale(this._noise_scl);
      return b;
    });

    this.background(this._bg);
    document.body.style.background = this._bg.hex;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const ended = this._blobs.every((blob) => blob.offBounds());
    const delta_frame = this.frameCount - this._frame_offset;

    this.ctx.save();

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.rotate(this._rotation);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._blobs.forEach((blob) => blob.update(delta_frame));

    this._blobs.forEach((blob) => {
      this.ctx.save();
      this.ctx.translate(this.width / 2, 0);
      blob.draw(this.ctx);
      this.ctx.scale(-1, 1);
      blob.draw(this.ctx);
      this.ctx.restore();
    });
    // draw a vertical line in the center
    if (delta_frame == 0) this._drawMiddleLine(this.ctx);

    this.ctx.restore();

    if (ended && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _drawMiddleLine(ctx) {
    ctx.strokeStyle = this._fg.rgb;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.width / 2, 0);
    ctx.lineTo(this.width / 2, this.height);
    ctx.stroke();
  }

  click() {
    this.setup();
  }
}

export { Sketch };
