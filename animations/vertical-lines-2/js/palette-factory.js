import { Color } from "./engine.js";

class Palette {
  constructor(colors) {
    this._colors = colors;
  }

  copy() {
    return new Palette(this._colors.map((c) => c.copy()));
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
  ["#0e7c7b", "#17bebb", "#d4f4dd", "#d62246", "#4b1d3f"],
  ["#335c67", "#fff3b0", "#e09f3e", "#9e2a2b", "#540b0e"],
  ["#d00000", "#ffba08", "#3f88c5", "#032b43", "#136f63"],
  ["#390099", "#9e0059", "#ff0054", "#ff5400", "#ffbd00"],
  ["#233d4d", "#fe7f2d", "#fcca46", "#a1c181", "#619b8a"],
  ["#3d348b", "#7678ed", "#f7b801", "#f18701", "#f35b04"],
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
