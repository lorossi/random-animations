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
  ["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557"],
  ["#3d348b", "#7678ed", "#f7b801", "#f18701", "#f35b04"],
  ["#22577a", "#38a3a5", "#57cc99", "#80ed99", "#c7f9cc"],
  ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b"],
  ["#BF349A", "#8C2771", "#E7DCF2", "#2ABFBF", "#29A6A6"],
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
