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

const PALETTES = [
  ["#023047", "#8ecae6", "#219ebc", "#ffb703", "#fb8500"],
  ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
  ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
  ["#001524", "#15616d", "#ffecd1", "#ff7d00", "#78290f"],
  ["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"],
  ["#ffffff", "#00171f", "#003459", "#007ea7", "#00a8e8"],
];

class PaletteFactory {
  static getRandomPalette(xor128) {
    const hex_list = xor128.pick(PALETTES);
    const [background, ...colors] = xor128
      .shuffle(hex_list)
      .map((h) => Color.fromHEX(h));

    return new Palette(background, colors);
  }
}

export { Palette, PaletteFactory };
