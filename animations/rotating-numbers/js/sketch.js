import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Letter } from "./letter.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._fg = Color.fromHex("#4AF626");
    this._bg = Color.fromMonochrome(15);

    this._scl = 0.95;
    this._text_scl = 0.85;
    this._trail_length = 10;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._cols = this._xor128.random_int(7, 14);

    const letter_scl = this.width / this._cols;

    this._letters = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = (i % this._cols) * letter_scl;
      const y = Math.floor(i / this._cols) * letter_scl;
      const letter = this._xor128.random_int(0, 10);
      return new Letter(
        x,
        y,
        letter_scl,
        this._text_scl,
        this._trail_length,
        letter,
        this._fg,
        this._xor128
      );
    });

    // Pick 2 random letters and place "L" and "R" there
    const available_indices = this._xor128.shuffle([
      ...Array(this._letters.length).keys(),
    ]);
    this._letters[available_indices[0]].setLetter("L");
    this._letters[available_indices[1]].setLetter("R");

    this._first_frame_preloaded = false;
    this._preload_length = 10;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    if (delta_frame == 0 && !this._first_frame_preloaded) {
      // simulate the last "preload_length" frames to avoid a blank first frame
      for (let f = 0; f < this._preload_length; f++) {
        const tt =
          ((this._duration - this._preload_length + f) / this._duration) % 1;
        this._letters.forEach((letter) => letter.update(tt));
      }
      this._first_frame_preloaded = true;
    }

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._letters.forEach((letter) => letter.update(t));
    this._letters.forEach((letter) => letter.show(this.ctx));
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
