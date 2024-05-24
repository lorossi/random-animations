import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Letter, Symbol } from "./letter.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;
    this._alphabet_length = 15;
    this._cols = 20;
    this._letters_scl = 0.75;
    this._scl = 0.95;
    this._space_chance = 0.1;
    this._letters_cols = 2;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const parameters = Symbol.Empty(this._letters_cols).parameters;

    let alphabet_seeds = [];
    while (alphabet_seeds.length < this._alphabet_length) {
      const n = this._xor128.random_int(2 ** (parameters + 1));
      if (!alphabet_seeds.includes(n)) alphabet_seeds.push(n);
    }

    const letter_size = this.width / this._cols;

    this._text = new Array(this._cols ** 2).fill().map((_, i) => {
      const x = (i % this._cols) * letter_size;
      const y = Math.floor(i / this._cols) * letter_size;
      const letter_seed =
        this._xor128.random() > this._space_chance
          ? this._xor128.pick(alphabet_seeds)
          : 0;
      return new Letter(
        x,
        y,
        letter_size,
        this._letters_scl,
        letter_seed,
        this._letters_cols
      );
    });

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    if (t == 0 && this.frameCount > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }

    this.ctx.save();
    this.background("#fff");
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._text.forEach((l, i) => {
      l.show(this.ctx);
    });
    this.ctx.restore();

    this.noLoop();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
