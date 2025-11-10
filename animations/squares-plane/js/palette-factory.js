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
  // https://coolors.co/palette/003049-d62828-f77f00-fcbf49-eae2b7
  ["#003049", "#D62828", "#F77F00", "#FCBF49", "#EAE2B7"],
  // https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51
  ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
  // https://coolors.co/palette/e63946-f1faee-a8dadc-457b9d-1d3557
  ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
  // https://coolors.co/palette/ef476f-ffd166-06d6a0-118ab2-073b4c
  ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"],
  // https://coolors.co/palette/233d4d-fe7f2d-fcca46-a1c181-619b8a
  ["#233D4D", "#FE7F2D", "#FCCA46", "#A1C181", "#619B8A"],
  // https://coolors.co/palette/4d5f5f-91b7b7-b9e1dc-ec4b36-f58120
  ["#4D5F5F", "#91B7B7", "#B9E1DC", "#EC4B36", "#F58120"],
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
