import { Color } from "./engine.js";

class Palette {
  constructor(colors) {
    this._colors = colors;
  }

  get colors() {
    return this._colors;
  }
}

const PALETTES = [
  [
    new Color(38, 70, 83),
    new Color(42, 157, 143),
    new Color(233, 196, 106),
    new Color(244, 162, 97),
    new Color(231, 111, 81),
  ],
  [
    new Color(255, 190, 11),
    new Color(251, 86, 7),
    new Color(255, 0, 110),
    new Color(131, 56, 236),
    new Color(58, 134, 255),
  ],

  [
    new Color(255, 89, 94),
    new Color(255, 202, 58),
    new Color(138, 201, 38),
    new Color(25, 130, 196),
    new Color(106, 76, 147),
  ],
  [
    new Color(237, 174, 73),
    new Color(209, 73, 91),
    new Color(0, 121, 140),
    new Color(48, 99, 142),
    new Color(0, 61, 91),
  ],
];

Object.freeze(PALETTES);

class PaletteFactory {
  static randomPalette(xor128) {
    const idx = xor128.random_int(PALETTES.length);
    console.log(idx);
    return new Palette(PALETTES[idx]);
  }

  static generatePalette(i) {
    const idx = i % PALETTES.length;
    return new Palette(PALETTES[idx]);
  }

  static get palette_count() {
    return PALETTES.length;
  }
}

export { Palette, PaletteFactory };
