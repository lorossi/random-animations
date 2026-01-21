import { Engine, SimplexNoise, Color, XOR128, PaletteFactory } from "./lib.js";
import { Line } from "./line.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;
    this._frame_offset = 0;

    this._lines_h = 3;
    this._lines_num = 150;
    this._scrambled_width = 2 / 3;
    this._scrambled_height = 0.9;
    this._scrambled_slope = 2 / 3;
    this._bg = Color.fromMonochrome(15);
    this._time_scl = 3;
    this._noise_scl = 0.05;

    this._rgb_palettes = [
      [
        [38, 70, 83],
        [42, 157, 143],
        [233, 196, 106],
        [244, 162, 97],
        [231, 111, 81],
      ],
      [
        [255, 190, 11],
        [251, 86, 7],
        [255, 0, 110],
        [131, 56, 236],
        [58, 134, 255],
      ],
      [
        [255, 89, 94],
        [255, 202, 58],
        [138, 201, 38],
        [25, 130, 196],
        [106, 76, 147],
      ],
      [
        [237, 174, 73],
        [209, 73, 91],
        [0, 121, 140],
        [48, 99, 142],
        [0, 61, 91],
      ],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._palette_factory = PaletteFactory.fromRGBArray(this._rgb_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);

    document.body.style.background = this._bg.hex;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frames = this.frameCount - this._frame_offset;
    const t = (delta_frames / this._duration) % 1;
    const a = t * Math.PI * 2;
    const nx = (1 + Math.cos(a)) * this._time_scl;
    const ny = (1 + Math.sin(a)) * this._time_scl;

    this.ctx.save();
    this.background(this._bg);

    this._generateLines(nx, ny);
    this._lines.forEach((l) => l.show(this.ctx));

    this.ctx.restore();

    if (t == 0 && delta_frames > 0 && this._recording) {
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
      // position
      const y = dy + this._lines_h * i;
      const h = this._lines_h;

      // color
      const p = i / this._lines_num;
      const color = this._palette.getSmoothColor(p);
      color.a = 0.7;

      const l = new Line(y, h, this.width);
      l.setAttributes(
        scrambled_start,
        scrambled_end,
        scrambled_slope,
        scrambled_section_y[i].y,
        color,
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
