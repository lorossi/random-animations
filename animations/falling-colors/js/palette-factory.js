import { Color } from "./engine.js";

class Palette {
  constructor(colors) {
    this._colors = colors;
  }

  shuffle(xor128) {
    this._colors = this._colors
      .map((c) => ({ color: c, order: xor128.random() }))
      .sort((a, b) => a.order - b.order)
      .map((c) => c.color);

    return this;
  }

  get colors() {
    return this._colors;
  }

  get length() {
    return this._colors.length;
  }
}

const PALETTES = [
  ["#ffbe0b", "#fb5607", "#ff006e", "#3a86ff", "#3a86ff"],
  ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
  ["#f72585", "#7209b7", "#3a0ca3", "#4361ee", "#4cc9f0"],
  ["#ffbc42", "#d81159", "#8f2d56", "#218380", "#73d2de"],
  ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
  ["#a8d5e2", "#f9a620", "#ffd449", "#548c2f", "#104911"],
];

class PaletteFactory {
  static getRandomPalette(xor128) {
    const colors = xor128
      .pick(PALETTES)
      .map((c) => ({ color: c, order: xor128.random() }))
      .sort((a, b) => a.order - b.order)
      .map((c) => Color.fromHEX(c.color));

    return new Palette(colors);
  }

  static getPalette(n) {
    return new Palette(PALETTES[n].map((h) => Color.fromHEX(h)));
  }
}

export { PaletteFactory };
