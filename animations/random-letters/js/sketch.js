import { Engine, XOR128, Color } from "./lib.js";
import { Letter, Symbol } from "./letter.js";

class Sketch extends Engine {
  preload() {
    this._alphabet_length = 16;
    this._cols = 20;
    this._scl = 0.95;
    this._space_chance = 0.1;

    this._letters_scl = 0.75;
    this._letters_cols = 2;
    this._letter_color = Color.fromMonochrome(20);

    this._bg = Color.fromMonochrome(245);
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

    this._lines = new Array(this._cols ** 2).fill().map((_, i) => {
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
        this._letters_cols,
        this._letter_color,
      );
    });

    document.body.style.background = this._bg.rgb;
  }

  draw() {
    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._lines.forEach((l) => l.show(this.ctx));
    this.ctx.restore();

    this.noLoop();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
