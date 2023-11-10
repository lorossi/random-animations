import { Engine, SimplexNoise, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Line } from "./line.js";
import { PaletteFactory } from "./palette.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;
    this._frame_offset = 0;

    this._lines_h = 3;
    this._lines_num = 150;
    this._scrambled_width = 0.33;
    this._scrambled_height = 0.9;
    this._scrambled_slope = 0.25;
    this._background_color = Color.fromMonochrome(25);
    this._time_scl = 3;
    this._noise_scl = 0.1;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));
    this._palette = PaletteFactory.randomPalette(this._xor128).colors;

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = ((this.frameCount - this._frame_offset) / this._duration) % 1;
    const a = t * Math.PI * 2;
    const nx = (1 + Math.cos(a)) * this._time_scl;
    const ny = (1 + Math.sin(a)) * this._time_scl;

    this.ctx.save();
    this.background(this._background_color.rgb);

    this._generateLines(nx, ny);
    this._lines.forEach((l) => l.show(this.ctx));

    this.ctx.restore();

    if (t == 0 && this.frameCount > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _generateLines(nx, ny) {
    const dy = (this.height - this._lines_h * this._lines_num) / 2;

    const scrambled_start = this.width * (0.5 - this._scrambled_width / 2);
    const scrambled_end = this.width * (0.5 + this._scrambled_width / 2);
    const scrambled_slope =
      (this.width * this._scrambled_slope * this._scrambled_width) / 2;

    const scrambled_h = this.height * this._scrambled_height;
    const scrambled_dy = (this.height - scrambled_h) / 2;

    const scrambled_section_y = new Array(this._lines_num)
      .fill(0)
      .map((_, i) => ({
        order: this._noise.noise(nx, ny, i * this._noise_scl),
        y: scrambled_dy + (scrambled_h * i) / this._lines_num,
        index: i,
      }))
      .sort((a, b) => a.order - b.order)
      .map((o) => ({
        y: o.y,
        index: o.index,
      }));

    this._lines = new Array(this._lines_num).fill(0).map((_, i) => {
      const y = dy + this._lines_h * i;
      const h = this._lines_h;

      const p = scrambled_section_y[i].index / this._lines_num;
      const start_color_index = Math.floor(p * (this._palette.length - 1));
      const end_color_index = start_color_index + 1;

      const color = this._palette[start_color_index].mix(
        this._palette[end_color_index],
        p * this._palette.length - start_color_index
      );

      const l = new Line(y, h, this.width);
      l.setAttributes(
        scrambled_start,
        scrambled_end,
        scrambled_slope,
        scrambled_section_y[i].y,
        color
      );
      return l;
    });
  }

  click() {
    this._frame_offset = this.frameCount;
    this.setup();
  }
}

export { Sketch };
