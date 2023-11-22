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
    [38, 70, 83],
    [42, 157, 143],
    [233, 196, 106],
    [244, 162, 97],
    [231, 111, 81],
  ],
  [
    [255, 190, 11],
    [251, 86, 7],
    [255, 0, 110],
    [131, 56, 236],
    [58, 134, 255],
  ],

  [
    [255, 89, 94],
    [255, 202, 58],
    [138, 201, 38],
    [25, 130, 196],
    [106, 76, 147],
  ],
  [
    [237, 174, 73],
    [209, 73, 91],
    [0, 121, 140],
    [48, 99, 142],
    [0, 61, 91],
  ],
];

Object.freeze(PALETTES);

class PaletteFactory {
  static getRandomPalette(xor128) {
    const idx = xor128.random_int(PALETTES.length);
    const colors = PALETTES[idx].map((c) => Color.fromRGB(...c));
    return new Palette(colors);
  }

  static generatePalette(i) {
    const idx = i % PALETTES.length;
    const colors = PALETTES[idx].map((c) => Color.fromRGB(...c));
    return new Palette(colors);
  }

  static get palette_count() {
    return PALETTES.length;
  }
}

export { Palette, PaletteFactory };
