import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { PaletteFactory } from "./palette-factory.js";
import { Vector } from "./vectors.js";
import { Slice } from "./slice.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromHEX("#ffffff");
    this._drop_count = 50;
    this._time_scl = 0.01;
    this._slice_cols = 5;
    this._texture_scl = 3;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }

    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    const palette = PaletteFactory.getRandomPalette(this._xor128);
    const slice_size = this.width / this._slice_cols;

    this._slices_seeds = new Array(this._slice_cols ** 2)
      .fill()
      .map(() => this._xor128.random_int(1e9));

    console.log(this._slices_seeds);

    this._slices = new Array(this._slice_cols ** 2).fill().map((_, i) => {
      const x = (i % this._slice_cols) * slice_size;
      const y = Math.floor(i / this._slice_cols) * slice_size;
      const width = slice_size;
      const height = slice_size;
      return new Slice(
        x,
        y,
        width,
        height,
        palette,
        this._drop_count,
        this._xor128
      );
    });

    this.ctx.save();
    this.ctx.fillStyle = this._bg.rgb;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  draw() {
    const ended = this._slices.every((slice) => slice.ended);
    if (ended && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
      this.noLoop();
    }

    const tn = this._time_scl * this.frameCount;

    this.ctx.save();
    this._slices.forEach((slice, i) => {
      const a = (this._noise.noise(tn, this._slices_seeds[i]) * Math.PI) / 2;
      const force_vec = new Vector(0, 1).rotate(a);

      slice.update(force_vec, 1);
      slice.draw(this.ctx);
    });
    this.ctx.restore();

    if (ended) {
      console.log("Restarting");
      this._addTexture();
      this.noLoop();
    }
  }

  click() {
    this.loop();
    this.setup();
  }

  _addTexture() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "overlay";
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const ch = this._xor128.random(128);
        const c = Color.fromMonochrome(ch, 0.5);
        this.ctx.fillStyle = c.rgba;
        this.ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }
    this.ctx.restore();
  }
}

export { Sketch };
