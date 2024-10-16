import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Automaton } from "./automaton.js";
import { PaletteFactory } from "./palette.js";
import { WolframCodeGenerator } from "./wolfram_code.js";

class Sketch extends Engine {
  preload() {
    this._automaton_cols_cells = 50;
    this._automata_cols = 2;

    this._scl = 1;
    this._bg_color = Color.fromMonochrome(245);
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._palette = PaletteFactory.createRandomPalette(this._xor128);
    this._radix = 4;

    const automaton_size = this.width / this._automata_cols;

    this._automata = new Array(this._automata_cols * this._automata_cols)
      .fill(null)
      .map(() => {
        const automaton = new Automaton(
          WolframCodeGenerator.generateRandom(this._radix, this._xor128),
          automaton_size,
          automaton_size,
          this._automaton_cols_cells,
          this._radix
        );

        const current_palette = this._palette.copy();
        current_palette.shuffle(this._xor128);
        automaton.setPalette(current_palette);
        automaton.randomInitialState(this._xor128);

        return automaton;
      });

    this._correctCanvasSize(1000);
  }

  click() {
    this.setup();
  }

  draw() {
    if (this._automata.every((a) => a.ended)) return;

    this.ctx.save();
    this.background(this._bg_color);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    const automaton_size = this.width / this._automata_cols;

    this._automata.forEach((a, i) => {
      const x = (i % this._automata_cols) * automaton_size;
      const y = Math.floor(i / this._automata_cols) * automaton_size;

      this.ctx.save();
      this.ctx.translate(x, y);

      while (!a.ended) {
        a.computeNext();
        a.show(this.ctx);
      }

      this.ctx.restore();
    });

    this.ctx.restore();
  }

  _correctCanvasSize(size = 1000) {
    const total_cells = this._automaton_cols_cells * this._automata_cols;
    const remainder = size - Math.floor(size / total_cells) * total_cells;
    this.canvas.width = size - remainder;
    this.canvas.height = size - remainder;
  }

  _wrapRadix(value) {
    while (value < 0) value += this._radix;
    return value % this._radix;
  }

  get rules() {
    return this._automaton.rules;
  }
}

export { Sketch };
