import { Color } from "./engine.js";

class Palette {
  constructor(colors) {
    this._colors = colors;
  }

  static fromArrayHEX(colors) {
    return new Palette(colors.map((c) => Color.fromHex(c)));
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

  getSmoothColor(t, easing = null) {
    const n = this._colors.length - 1;
    const integer_part = Math.floor(t * n) % n;
    const fractional_part = t * n - Math.floor(t * n);

    const c1 = this.getColor(integer_part);
    const c2 = this.getColor(integer_part + 1);

    return c1.mix(c2, fractional_part, easing);
  }
  get colors() {
    return this._colors;
  }

  get length() {
    return this._colors.length;
  }
}

const PALETTES = [
  // https://coolors.co/palette/ef476f-ffd166-06d6a0-118ab2-073b4c
  ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"],
  // https://coolors.co/palette/001524-15616d-ffecd1-ff7d00-78290f
  ["#001524", "#15616D", "#FFECD1", "#FF7D00", "#78290F"],
  // https://coolors.co/palette/001427-708d81-f4d58d-bf0603-8d0801
  ["#001427", "#708D81", "#F4D58D", "#BF0603", "#8D0801"],
  // https://coolors.co/palette/335c67-fff3b0-e09f3e-9e2a2b-540b0e
  ["#335C67", "#FFF3B0", "#E09F3E", "#9E2A2B", "#540B0E"],
  // https://coolors.co/palette/5f0f40-9a031e-fb8b24-e36414-0f4c5c
  ["#5F0F40", "#9A031E", "#FB8B24", "#E36414", "#0F4C5C"],
  // https://coolors.co/palette/283d3b-197278-edddd4-c44536-772e25
  ["#283D3B", "#197278", "#EDDDD4", "#C44536", "#772E25"],

  ["#E7363C", "#F56438", "#FCAB20", "#59AC99", "#3E446E"],
];

class PaletteFactory {
  static getRandomPalette(rand = Math, randomize = true) {
    const colors_index = Math.floor(rand.random() * PALETTES.length);
    let colors = PALETTES[colors_index].map((c) => {
      if (c instanceof Color) {
        return c.copy();
      }

      return Color.fromHex(c);
    });

    if (randomize) {
      colors = colors
        .map((c) => ({ color: c, order: rand.random() }))
        .sort((a, b) => a.order - b.order)
        .map((c) => c.color);
    }

    return new Palette(colors);
  }
  static getPalette(n) {
    if (n < 0 || n > PALETTES.length - 1)
      throw new Error("Palette index out of bounds");

    return new Palette(PALETTES[n].map((h) => Color.fromHex(h)));
  }

  static getPalettesCount() {
    return PALETTES.length;
  }
}

export { PaletteFactory, Palette };
