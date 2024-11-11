import { Color } from "./engine.js";

class Palette {
  constructor(colors) {
    this._colors = colors;
  }

  shuffle(rand = Math) {
    this._colors = this._colors
      .map((c) => ({ color: c, order: rand.random() }))
      .sort((a, b) => a.order - b.order)
      .map((c) => c.color);

    return this;
  }

  copy() {
    return new Palette(this._colors.map((c) => c.copy()));
  }

  getColor(i) {
    return this._colors[i % this._colors.length];
  }

  getRandomColor(rand = Math) {
    const r = Math.floor(rand.random() * this._colors.length);
    return this.getColor(r);
  }

  get colors() {
    return this._colors;
  }

  get length() {
    return this._colors.length;
  }
}

const PALETTES = [
  // https://coolors.co/palette/ccab8f-cf8962-2f201a-e4d1a9-3a3b30-284241-555044-c1342c-e0dbd4-dbc99d
  // https://coolors.co/palette/582f0e-7f4f24-936639-a68a64-b6ad90-c2c5aa-a4ac86-656d4a-414833-333d29
  // https://coolors.co/palette/6f1d1b-bb9457-432818-99582a-ffe6a7
  [
    "#ccab8f",
    "#cf8962",
    "#2f201a",
    "#e4d1a9",
    "#3a3b30",
    "#284241",
    "#555044",
    "#c1342c",
    "#dbc99d",
    "#582f0e",
    "#7f4f24",
    "#936639",
    "#a68a64",
    "#b6ad90",
    "#c2c5aa",
    "#a4ac86",
    "#656d4a",
    "#414833",
    "#333d29",
    "#6f1d1b",
    "#bb9457",
    "#432818",
    "#99582a",
    "#ffe6a7",
  ],
];

class PaletteFactory {
  static getRandomPalette(xor128, randomize = true) {
    const colors = xor128.pick(PALETTES).map((c) => Color.fromHEX(c));
    const palette = new Palette(colors);
    if (randomize) palette.shuffle(xor128);

    return palette;
  }

  static getPalette(n) {
    if (n < 0 || n > PALETTES.length - 1)
      throw new Error("Palette index out of bounds");

    return new Palette(PALETTES[n].map((h) => Color.fromHEX(h)));
  }

  static getPalettesCount() {
    return PALETTES.length;
  }
}

export { PaletteFactory, Palette };
