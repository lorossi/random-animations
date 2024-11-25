import { Color } from "./engine.js";

class Palette {
  constructor(colors) {
    this._colors = colors;
  }

  static fromArrayHEX(colors) {
    return new Palette(colors.map((c) => Color.fromHEX(c)));
  }

  static fromArrayRGB(colors) {
    return new Palette(colors.map((c) => Color.fromRGB(c)));
  }

  shuffle(rand = Math) {
    this._colors = this._colors
      .map((c) => ({ color: c, order: rand.random() }))
      .sort((a, b) => a.order - b.order)
      .map((c) => c.color);

    return this;
  }

  copy() {
    return new Palette(this._colors.map((c) => c.copy()));
  }

  getColor(i) {
    return this._colors[i % this._colors.length];
  }

  getRandomColor(rand = Math) {
    const r = Math.floor(rand.random() * this._colors.length);
    return this.getColor(r);
  }

  get colors() {
    return this._colors;
  }

  get length() {
    return this._colors.length;
  }
}

const PALETTES = [
  // https://coolors.co/palette/e63946-f1faee-a8dadc-457b9d-1d3557
  ["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557"],
  // https://coolors.co/palette/2b2d42-8d99ae-edf2f4-ef233c-d90429
  ["#2b2d42", "#8d99ae", "#edf2f4", "#ef233c", "#d90429"],
  // https://coolors.co/palette/da2c38-226f54-87c38f-f4f0bb-43291f
  ["#da2c38", "#226f54", "#87c38f", "#f4f0bb", "#43291f"],
  // https://coolors.co/palette/011627-fdfffc-2ec4b6-e71d36-ff9f1c
  ["#011627", "#fdfffc", "#2ec4b6", "#e71d36", "#ff9f1c"],
];

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

export { PaletteFactory, Palette };
