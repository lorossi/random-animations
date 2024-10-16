import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Blob } from "./blob.js";

class Sketch extends Engine {
  preload() {
    this._fg_colors = [new Color(255, 0, 0, 0.5), new Color(0, 0, 255, 0.5)];
    this._bg_color = Color.fromMonochrome(245);
    this._blob_scl = 0.95;
    this._columns = 5;
    this._scl = 0.95;
    this._time_scl = 0.2;

    this._duration = 180;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    const noise_seed = this._xor128.random_int(1e16);
    this._noise = new SimplexNoise(noise_seed);

    const blob_size = this.width / this._columns;
    this._blobs = new Array(this._columns * this._columns)
      .fill(null)
      .map((_, i) => {
        const x = (i % this._columns) * blob_size;
        const y = Math.floor(i / this._columns) * blob_size;
        return new Blob(
          x,
          y,
          this._blob_scl,
          this._time_scl,
          blob_size,
          this._fg_colors,
          this._noise,
          this._xor128
        );
      });

    this._texture = this._createNoiseTexture(this.width, this.height, 2);

    this._frame_started = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  click() {
    this.setup();
  }

  draw() {
    const t = ((this.frameCount - this._frame_started) / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg_color);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._blobs.forEach((b) => b.update(t));
    this._blobs.forEach((b) => b.draw(this.ctx));

    this.ctx.restore();

    this._applyNoiseTexture(this._texture);

    if (t == 0 && this.frameCount > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _createNoiseTexture(width, height, scl) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < width; x += scl) {
      for (let y = 0; y < height; y += scl) {
        const ch = this._xor128.random_int(127);
        const color = Color.fromMonochrome(ch, 0.25);
        ctx.fillStyle = color.rgba;
        ctx.fillRect(x, y, scl, scl);
      }
    }

    return canvas;
  }

  _applyNoiseTexture(texture) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "screen";
    this.ctx.drawImage(texture, 0, 0);

    this.ctx.restore();
  }
}

export { Sketch };
