import { Color } from "./lib.js";

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
  ["#FFFFFF", "#F50A32", "#F5AF0A", "#0A697B", "#333333"],
  ["#FFFFFF", "#D32F2F", "#009688", "#546E7A", "#263238"],
  ["#F0F0F0", "#2E2E2E", "#45597F", "#417568", "#FFCF50", "#E63946"],
  ["#0D518C", "#F2B807", "#F29F05", "#F2E2CE", "#F21B1B"],
  ["#F0F0F0", "#03588C", "#0396A6", "#04BFAD", "#F28963", "#F25C5C"],
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
