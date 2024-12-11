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

  removeSimilarColors(other, epsilon = 8) {
    const color_diff = (c1, c2) => {
      const r = Math.abs(c1.r - c2.r);
      const g = Math.abs(c1.g - c2.g);
      const b = Math.abs(c1.b - c2.b);

      return Math.sqrt(r * r + g * g + b * b);
    };

    const colors = this._colors.filter((c1) =>
      other._colors.every((c2) => color_diff(c1, c2) > epsilon)
    );

    this._colors = colors;
  }

  get colors() {
    return this._colors;
  }

  get length() {
    return this._colors.length;
  }
}

const PALETTES = [
  // https://coolors.co/palette/0d1b2a-1b263b-415a77-778da9-e0e1dd
  ["#0D1B2A", "#1B263B", "#415A77", "#778DA9", "#E0E1DD"],
  // https://coolors.co/palette/0d3b66-faf0ca-f4d35e-ee964b-f95738
  ["#0D3B66", "#FAF0CA", "#F4D35E", "#EE964B", "#F95738"],
];

class PaletteFactory {
  static getRandomPalette(rand = Math, randomize = true) {
    const colors_index = Math.floor(rand.random() * PALETTES.length);
    let colors = PALETTES[colors_index].map((c) => Color.fromHEX(c));

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

    return new Palette(PALETTES[n].map((h) => Color.fromHEX(h)));
  }

  static getPalettesCount() {
    return PALETTES.length;
  }
}

export { PaletteFactory, Palette };
