import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._cols = 20;
    this._bg_color = Color.fromMonochrome(235);
    this._scl = 1;
    this._texture_scl = 2;
    this._texture_oversample = 2;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette = PaletteFactory.getRandomPalette(this._xor128);
    this._grid = new Grid(this.width, this._cols, this._seed, this._palette);
    this._texture = this._createTexture();

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
    this.background(this._bg_color);
    this.scaleFromCenter(this._scl);

    this._grid.update(t);
    this._grid.show(this.ctx);

    this.ctx.restore();

    this.ctx.save();
    this._applyTexture(this._texture);
    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width * this._texture_oversample;
    canvas.height = this.height * this._texture_oversample;
    const ctx = canvas.getContext("2d");

    ctx.save();
    for (let x = 0; x < canvas.width; x += this._texture_scl) {
      for (let y = 0; y < canvas.height; y += this._texture_scl) {
        const r = this._xor128.random_int(127);
        const c = Color.fromMonochrome(r, 0.1);

        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }
    ctx.restore();

    return canvas;
  }

  _applyTexture(texture) {
    const sx = -this._xor128.random_int(
      (this._texture_oversample - 1) * this.width
    );
    const sy = -this._xor128.random_int(
      (this._texture_oversample - 1) * this.height
    );

    this.ctx.save();
    this.ctx.globalCompositeOperation = "dodge";
    this.ctx.drawImage(texture, sx, sy);
    this.ctx.restore();
  }

  click() {
    this.setup();
  }
}

export { Sketch };
