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
  ["#0077b6", "#00b4d8", "#90e0ef"],
  ["#007f5f", "#aacc00", "#ffff3f"],
  ["#04b2d9", "#27296d", "#da4167"],
  ["#02205f", "#ffcb05", "#5595b2"],
  ["#5f0f40", "#9a031e", "#fb8b24"],
  ["#390099", "#9e0059", "#ff0054"],
];

class PaletteFactory {
  static getRandomPalette(xor128) {
    const hex_list = xor128.pick(PALETTES);
    const colors = xor128.shuffle(hex_list).map((h) => Color.fromHEX(h));

    return new Palette(colors);
  }
}

export { Palette, PaletteFactory };
