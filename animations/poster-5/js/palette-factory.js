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
  ["#dcdcdd", "#c5c3c6", "#46494c", "#4c5c68", "#1985a1"],
  ["#f79256", "#fbd1a2", "#7dcfb6", "#00b2ca", "#1d4e89"],
  ["#ed6a5a", "#f4f1bb", "#9bc1bc", "#5ca4a9", "#e6ebe0"],
  ["#247ba0", "#70c1b3", "#b2dbbf", "#f3ffbd", "#ff1654"],
  ["#227c9d", "#17c3b2", "#ffcb77", "#fef9ef", "#fe6d73"],
  ["#cfdbd5", "#e8eddf", "#f5cb5c", "#242423", "#333533"],
  ["#f1faee", "#a8dadc", "#457b9d", "#1d3557"],
  ["#bee9e8", "#62b6cb", "#1b4965", "#cae9ff", "#5fa8d3"],
  ["#0081a7", "#00afb9", "#fdfcdc", "#fed9b7", "#f07167"],
  ["#22577a", "#38a3a5", "#57cc99", "#80ed99", "#c7f9cc"],
  ["#05668d", "#427aa1", "#ebf2fa", "#679436", "#a5be00"],
];

class PaletteFactory {
  static getRandomPalette(xor128, length = 4) {
    const colors = xor128
      .pick(PALETTES)
      .map((c) => ({ color: c, order: xor128.random() }))
      .sort((a, b) => a.order - b.order)
      .slice(0, length)
      .map((c) => Color.fromHEX(c.color));

    return new Palette(colors);
  }

  static getPalette(n) {
    return new Palette(PALETTES[n].map((h) => Color.fromHEX(h)));
  }
}

export { PaletteFactory };
