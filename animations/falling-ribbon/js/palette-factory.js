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
  // https://coolors.co/palette/ffbe0b-fb5607-ff006e-8338ec-3a86ff
  ["#FFFFED", "#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"],
  // https://coolors.co/palette/f8f9fa-e9ecef-dee2e6-ced4da-adb5bd-6c757d-495057-343a40-212529
  [
    "#0A0a0a",
    "#F8F9FA",
    "#E9ECEF",
    "#DEE2E6",
    "#CED4DA",
    "#ADB5BD",
    "#6C757D",
    "#495057",
    "#343A40",
    "#212529",
  ],
  // https://coolors.co/palette/001219-005f73-0a9396-94d2bd-e9d8a6-ee9b00-ca6702-bb3e03-ae2012-9b2226
  [
    "#E9D8A6",
    "#001219",
    "#005F73",
    "#0A9396",
    "#94D2BD",
    "#EE9B00",
    "#CA6702",
    "#BB3E03",
    "#AE2012",
    "#9B2226",
  ],
  // https://coolors.co/palette/fffcf2-ccc5b9-403d39-252422-eb5e28
  ["#FFFCF2", "#CCC5B9", "#403D39", "#252422", "#EB5E28"],
  // https://coolors.co/palette/edae49-d1495b-00798c-30638e-003d5b
  ["#EDAE49", "#D1495B", "#00798C", "#30638E", "#003D5B"],
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
