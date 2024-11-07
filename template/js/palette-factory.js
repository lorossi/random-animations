import { Color } from "./engine.js";

class Palette {
  constructor(colors) {
    this._colors = [...colors];
  }

  shuffle(rand = Math) {
    this._colors = this._colors
      .map((c) => ({ color: c, order: rand.random() }))
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

const PALETTES = [];

class PaletteFactory {
  static getRandomPalette(xor128, randomize = true) {
    const colors = xor128.pick(PALETTES).map((c) => Color.fromHEX(c));
    const palette = new Palette(colors);
    if (randomize) palette.shuffle(xor128);

    return palette;
  }

  static getPalette(n) {
    if (n < 0 || n > PALETTES.length - 1)
      throw new Error("Palette index out of bounds");

    return new Palette(PALETTES[n].map((h) => Color.fromHEX(h)));
  }

  static getPalettesCount() {
    return PALETTES.length;
  }
}

export { PaletteFactory };
