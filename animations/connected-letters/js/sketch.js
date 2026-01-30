import {
  Color,
  Engine,
  GradientPalette,
  Palette,
  PaletteFactory,
  Point,
  SimplexNoise,
  XOR128,
} from "./lib.js";
import { Cell } from "./cell.js";
import { Line } from "./line.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._slots = 64;
    this._scl = 0.95;
    this._empty_ratio = 0.2;
    this._font = "Pixelify";
    this._fg = Color.fromMonochrome(240);
    this._bg = Color.fromMonochrome(20);
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    const slot_size = this.height / this._slots;
    this._cells = new Array(this._slots ** 2).fill().map((_, i) => {
      const letter_index =
        this._xor128.random() < this._empty_ratio
          ? 0 // empty cell
          : this._xor128.random_int(65, 90);

      const x = (i % this._slots) * slot_size + slot_size / 2;
      const y = Math.floor(i / this._slots) * slot_size + slot_size / 2;
      return new Cell(x, y, slot_size, letter_index, this._font, this._fg);
    });
    this._lines = [];
    this._alphabet = this._xor128.shuffle(
      new Array(26).fill(0).map((_, i) => String.fromCharCode(65 + i)),
    );

    this._font_loaded = false;
    document.fonts
      .load(`12px ${this._font}`)
      .then(() => (this._font_loaded = true));
    document.body.style.background = this._bg.rgba;

    this._last_index = -1;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    if (!this._font_loaded) {
      this._frame_offset = this.frameCount;
      return;
    }

    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    const current_index = Math.floor(t * 26);
    const fractional_t = t * 26 - current_index;
    const current_letter = this._alphabet[current_index];

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._cells.forEach((cell) => cell.update(fractional_t, current_letter));
    if (current_index !== this._last_index) {
      this._last_index = current_index;

      const active_cells = this._cells.filter(
        (cell) => cell.letter === current_letter,
      );

      this._lines = [];
      if (active_cells.length >= 2) {
        const shuffled = this._xor128.shuffle(active_cells);
        for (let i = 0; i < shuffled.length - 1; i += 2) {
          const cell_a = shuffled[i];
          const cell_b = shuffled[i + 1];
          this._lines.push(
            new Line(cell_a, cell_b, this._fg, this.height, this._xor128),
          );
        }
      }
    }

    this._lines.forEach((line) => line.show(this.ctx));
    this._cells.forEach((cell) => cell.show(this.ctx));
    this.ctx.restore();

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
