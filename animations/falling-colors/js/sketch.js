import { Engine, SimplexNoise, XOR128, Color, PaletteFactory } from "./lib.js";
import { Vector } from "./vectors.js";
import { Slice } from "./slice.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(240);
    this._drop_count = 150;
    this._time_scl = 0.01;
    this._slice_cols = 5;
    this._hex_palettes = [
      ["#ffbe0b", "#fb5607", "#ff006e", "#3a86ff", "#3a86ff"],
      ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
      ["#f72585", "#7209b7", "#3a0ca3", "#4361ee", "#4cc9f0"],
      ["#ffbc42", "#d81159", "#8f2d56", "#218380", "#73d2de"],
      ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
      ["#a8d5e2", "#f9a620", "#ffd449", "#548c2f", "#104911"],
    ];

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }

    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);
    const slice_size = this.width / this._slice_cols;

    this._slices_seeds = new Array(this._slice_cols ** 2)
      .fill()
      .map(() => this._xor128.random_int(1e9));

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
        this._palette,
        this._drop_count,
        this._xor128,
      );
    });

    document.body.style.backgroundColor = this._bg.rgb;

    this.ctx.save();
    this.ctx.fillStyle = this._bg.rgb;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  draw() {
    const tn = this._time_scl * this.frameCount;

    this.ctx.save();
    this._slices.forEach((slice, i) => {
      const a =
        (this._noise.noise(tn, this._slices_seeds[i], 1000) * Math.PI) / 2;
      const force_vec = new Vector(0, 1).rotate(a);
      if (i == 0) console.log(tn, a, force_vec);

      slice.update(force_vec, 1);
      slice.draw(this.ctx);
    });
    this.ctx.restore();

    const ended = this._slices.every((slice) => slice.ended);
    if (ended && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
      this.noLoop();
    }

    if (ended) {
      this.noLoop();
    }
  }

  click() {
    this.loop();
    this.setup();
  }
}

export { Sketch };
