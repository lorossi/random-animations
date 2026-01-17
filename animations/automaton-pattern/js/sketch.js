import { Engine, XOR128, PaletteFactory, Color } from "./lib.js";
import { Automaton } from "./automaton.js";
import { WolframCodeGenerator } from "./wolfram_code.js";

class Sketch extends Engine {
  preload() {
    this._automaton_cols_cells = 50;
    this._automata_cols = 2;

    this._scl = 1;

    this._hex_palettes = [
      ["#811638", "#0B7978", "#FCB632", "#F27238", "#C32327"],
      ["#DA3391", "#E56E2E", "#F9C80E", "#EAA72F", "#259AA1"],
      ["#233D4D", "#FE7F2D", "#FCCA46", "#A1C181", "#619B8A"],
      ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93"],
      ["#006BA6", "#0496FF", "#FFBC42", "#D81159", "#8F2D56"],
      ["#CCDBDC", "#9AD1D4", "#80CED7", "#007EA7", "#003249"],
      ["#33A9AC", "#FFA646", "#F86041", "#982062", "#343779"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);
    this._radix = 4;

    const automaton_size = this.width / this._automata_cols;

    this._automata = new Array(this._automata_cols * this._automata_cols)
      .fill(null)
      .map(() => {
        const wolfram_code = WolframCodeGenerator.generateRandom(
          this._radix,
          this._xor128,
        );
        const current_palette = this._palette.copy();
        current_palette.shuffle(this._xor128);

        const automaton = new Automaton(
          wolfram_code,
          automaton_size,
          automaton_size,
          this._automaton_cols_cells,
          this._radix,
          current_palette,
        );

        automaton.randomInitialState(this._xor128);

        return automaton;
      });

    this._bg = this._palette.getRandomColor(this._xor128);
    document.body.style.background = this._bg.hex;
    this._correctCanvasSize(1000);
  }

  click() {
    this.setup();
  }

  draw() {
    if (this._automata.every((a) => a.ended)) return;

    this.ctx.save();
    this.background(this._bg);
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
