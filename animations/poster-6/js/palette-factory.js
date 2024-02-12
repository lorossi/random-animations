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
  ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b"],
  ["#177e89", "#084c61", "#db3a34", "#ffc857", "#323031"],
  ["#fffcf2", "#ccc5b9", "#403d39", "#252422", "#eb5e28"],
  ["#011627", "#fdfffc", "#2ec4b6", "#e71d36", "#ff9f1c"],
  ["#335c67", "#fff3b0", "#e09f3e", "#9e2a2b", "#540b0e"],
  ["#8cb369", "#f4e285", "#f4a259", "#5b8e7d", "#bc4b51"],
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
