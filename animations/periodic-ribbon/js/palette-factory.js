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

  copy() {
    return new Palette(...this._colors);
  }

  getColor(i) {
    return this._colors[i % this._colors.length];
  }

  get colors() {
    return this._colors;
  }

  get length() {
    return this._colors.length;
  }
}

const PALETTES = [
  ["#0F0F0F", "#F0F0F0"],
  ["#19719C", "#FFFFFF"],
  ["#E68C3A", "#F4F2EF"],
  ["#EAE2D8", "#197F7F"],
  ["#EAE2D8", "#CC5F3A"],
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
