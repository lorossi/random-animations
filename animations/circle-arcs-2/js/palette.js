import { Color } from "./engine.js";

class Palette {
  constructor(background, colors) {
    this._colors = colors;
    this._background = background;
  }

  get colors() {
    return this._colors;
  }

  get background() {
    return this._background;
  }
}

const PALETTES = [["#023047", "#8ecae6", "#219ebc", "#ffb703", "#fb8500"]];

class PaletteFactory {
  static getRandomPalette(xor128) {
    const hex_list = xor128.pick(PALETTES);
    const [background, ...colors] = hex_list.map((h) => Color.fromHEX(h));

    return new Palette(background, colors);
  }
}

export { Palette, PaletteFactory };
