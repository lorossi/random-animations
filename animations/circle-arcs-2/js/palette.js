import { Color } from "./engine.js";

class Palette {
  constructor(colors) {
    this._colors = colors;
  }

  get colors() {
    return this._colors.fg;
  }

  get background() {
    return this._colors.bg;
  }
}

const PALETTES = [
  {
    fg: [
      new Color(120, 0, 0),
      new Color(193, 18, 31),
      new Color(0, 48, 73),
      new Color(102, 155, 188),
    ],
    bg: new Color(253, 240, 213),
  },
];

class PaletteFactory {
  constructor(xor128) {
    this._xor128 = xor128;
  }

  randomPalette() {
    const index = this._xor128.random_int(PALETTES.length);
    return new Palette(PALETTES[index]);
  }
}

export { Palette, PaletteFactory };
