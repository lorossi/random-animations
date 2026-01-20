import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Line } from "./line.js";
import { PaletteFactory } from "./palette-factory.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(245);
    this._noise_scl = 0.1;
    this._time_scl = 0.5;
    this._texture_scl = 3;
    this._texture_size = this.width * 1.25;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));
    this._palette = PaletteFactory.getRandomPalette(this._xor128);

    const cols = this._xor128.random_int(6, 12);
    const width = this.width / cols;
    this._lines = new Array(cols).fill(null).map((_, i) => {
      const line_num = this._xor128.random_int(3, 8);
      const l = new Line(i * width, this.height, width, line_num);
      l.injectDependencies(this._xor128, this._noise);
      l.setPalette(this._palette);
      l.setAttributes(this._noise_scl, this._time_scl);
      return l;
    });

    this._texture = this._createTexture();

    this._frame_offset = this.frameCount;

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = ((this.frameCount - this._frame_offset) / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg.rgba);

    this._lines.forEach((l) => l.update(t));
    this._lines.forEach((l) => l.show(this.ctx));

    // paste texture
    this.ctx.globalCompositeOperation = "multiply";
    const texture_x = this._xor128.random_int(
      0,
      this._texture_size - this.width,
    );
    const texture_y = this._xor128.random_int(
      0,
      this._texture_size - this.height,
    );
    this.ctx.drawImage(this._texture, -texture_x, -texture_y);

    this.ctx.restore();

    if (t == 0 && this.frameCount > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this._texture_size;
    canvas.height = this._texture_size;

    const ctx = canvas.getContext("2d");
    for (let x = 0; x < canvas.width; x += this._texture_scl) {
      for (let y = 0; y < canvas.height; y += this._texture_scl) {
        const n = this._xor128.random(127);
        const c = Color.fromMonochrome(n, 0.065);

        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return canvas;
  }

  click() {
    if (this._recording) return;

    this.setup();
  }
}

export { Sketch };
