import { Engine, Color, XOR128, PaletteFactory } from "./lib.js";
import { Mesh } from "./mesh.js";
import { Automaton } from "./automaton.js";

class Sketch extends Engine {
  preload() {
    this._site_count = 2400;
    this._steps_per_frame = 4;

    this._palettes = [
      ["antwarpblue", "dullvioletblack"],
      ["brickred", "redviolet"],
      ["carminered", "sulphuryellow"],
      ["englishred", "cerulianblue"],
      ["eugeniared2", "seagreen"],
      ["lightglaucousblue", "darktyrianblue"],
      ["madderbrown", "deepindigo"],
      ["madderbrown", "violetblue"],
      ["olivebuff", "violetblue"],
      ["orangeyellow", "antwarpblue"],
      ["rawsienna", "vernoniapurple"],
      ["rosolancpurple", "helvetiablue"],
      ["yelloworange", "darktyrianblue"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._palette_factory = PaletteFactory.fromSanzoWadaArray(this._palettes);

    this._cols = this._xor128.random_int(1, 4); // 1x1 up to 3x3 grid
    const cell_w = this.width / this._cols;
    const cell_h = this.height / this._cols;
    const cell_site_count = Math.max(
      3,
      Math.round(this._site_count / this._cols ** 2),
    );

    this._cells = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const col = i % this._cols;
      const row = Math.floor(i / this._cols);

      const palette = this._palette_factory.getRandomPalette(
        this._xor128,
        false,
      );
      const low_color = palette.getColor(0);
      const high_color = palette.getColor(1);

      const mesh = new Mesh(cell_w, cell_h, cell_site_count, this._xor128);
      const automaton = new Automaton(mesh.neighbors, this._xor128);

      return {
        x: col * cell_w,
        y: row * cell_h,
        mesh,
        automaton,
        low_color,
        high_color,
      };
    });

    document.body.style.background = this._cells[0].low_color.hex;
  }

  draw() {
    this.ctx.save();
    this.background(this._cells[0].low_color);

    this._cells.forEach(({ x, y, mesh, automaton, low_color, high_color }) => {
      for (let i = 0; i < this._steps_per_frame; i++) automaton.step();

      this.ctx.save();
      this.ctx.translate(x, y);
      automaton.draw(this.ctx, mesh.cells, low_color, high_color);
      this.ctx.restore();
    });

    this.ctx.restore();
  }

  click() {
    this.setup();
  }
}

export { Sketch };
