import { Color } from "./engine.js";

class Palette {
  constructor(background, colors) {
    this._background = background;
    this._colors = colors;
  }

  get background() {
    return this._background;
  }

  get colors() {
    return this._colors;
  }
}

const PALETTES = [
  ["#fdf0d5", "#780000", "#c1121f", "#003049", "#669bbc"],
  ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
  ["#f1faee", "#e63946", "#a8dadc", "#457b9d", "#1d3557"],
  ["#eae2b7", "#003049", "#d62828", "#f77f00", "#fcbf49"],
  ["#f2e8cf", "#386641", "#6a994e", "#a7c957", "#bc4749"],
  ["#ef233c", "#2b2d42", "#8d99ae", "#edf2f4", "#d90429"],
  ["#e0fbfc", "#3d5a80", "#98c1d9", "#ee6c4d", "#293241"],
];

class PaletteFactory {
  static getRandomPalette(xor128) {
    const hex_list = xor128.pick(PALETTES);
    const bg = Color.fromHEX(hex_list[0]);
    const colors = hex_list.slice(1).map((h) => Color.fromHEX(h));
    return new Palette(bg, colors);
  }
}

export { PaletteFactory };
