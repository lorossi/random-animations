import { Color } from "./engine.js";

class Palette {
  constructor(colors) {
    this._colors = colors;
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

  get colors() {
    return this._colors;
  }

  get length() {
    return this._colors.length;
  }
}

const PALETTES = [
  // https://coolors.co/palette/2f4858-33658a-86bbd8-f6ae2d-f26419
  ["#2f4858", "#33658a", "#86bbd8", "#f6ae2d", "#f26419"],
  // https://coolors.co/palette/ff595e-ffca3a-8ac926-1982c4-6a4c93
  ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"],
  // https://coolors.co/palette/edae49-d1495b-00798c-30638e-003d5b
  ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b"],
  // https://coolors.co/palette/ffbe0b-fb5607-ff006e-8338ec-3a86ff
  ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
  // https://coolors.co/palette/5f0f40-9a031e-fb8b24-e36414-0f4c5c
  ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
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
