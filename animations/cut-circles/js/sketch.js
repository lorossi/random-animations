import { Engine, SimplexNoise, XOR128, Color } from "./lib.js";
import { Cell } from "./cell.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._bg = Color.fromMonochrome(240);

    this._line_color = Color.fromMonochrome(20);
    this._fill_colors = [
      "#5f0f40",
      "#9a031e",
      "#fb8b24",
      "#e36414",
      "#0f4c5c",
      "#233d4d",
      "#fe7f2d",
      "#fcca46",
      "#a1c181",
      "#619b8a",
    ];

    this._noise_scl = 0.001;
    this._time_scl = 0.25;
    this._scl = 0.95;
    this._circle_scl = 0.9;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e6));

    const cols = this._xor128.random_int(7, 15);
    const cell_scl = this.width / cols;
    const fill_color = Color.fromHex(this._xor128.pick(this._fill_colors));
    const direction = this._xor128.pick([-1, 1]);
    this._cells = new Array(cols * cols).fill(null).map((_, i) => {
      const x = (i % cols) * cell_scl;
      const y = Math.floor(i / cols) * cell_scl;
      return new Cell(
        x,
        y,
        cell_scl,
        direction,
        this._line_color,
        fill_color,
        this._noise,
        this._noise_scl,
        this._circle_scl,
      );
    });

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    const time_theta = t * Math.PI * 2;
    const tx = (1 + Math.cos(time_theta)) * this._time_scl;
    const ty = (1 + Math.sin(time_theta)) * this._time_scl;

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._cells.forEach((cell) => cell.update(tx, ty));
    this._cells.forEach((cell) => cell.show(this.ctx));

    if (t == 0 && delta_frame > 0 && this._recording) {
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
