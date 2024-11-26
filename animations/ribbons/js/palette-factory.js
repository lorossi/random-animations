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
  // black and white
  ["#0F0F0F", "#373737", "#606060", "#898989", "#B2B2B2", "#DBDBDB"],
  // https://coolors.co/palette/086788-07a0c3-f0c808-fff1d0-dd1c1a
  ["#086788", "#07a0c3", "#f0c808", "#fff1d0", "#dd1c1a"],
  // https://coolors.co/palette/0c0a3e-7b1e7a-b33f62-f9564f-f3c677
  ["#0c0a3e", "#7b1e7a", "#b33f62", "#f9564f", "#f3c677"],
  // https://coolors.co/palette/0d1b2a-1b263b-415a77-778da9-e0e1dd
  ["#0d1b2a", "#1b263b", "#415a77", "#778da9", "#e0e1dd"],
  // https://coolors.co/palette/0d1321-1d2d44-3e5c76-748cab-f0ebd8
  ["#0d1321", "#1d2d44", "#3e5c76", "#748cab", "#f0ebd8"],
  // https://coolors.co/palette/0a2463-3e92cc-fffaff-d8315b-1e1b18
  ["#0a2463", "#3e92cc", "#fffaff", "#d8315b", "#1e1b18"],
  // https://coolors.co/palette/011627-fdfffc-2ec4b6-e71d36-ff9f1c
  ["#011627", "#fdfffc", "#2ec4b6", "#e71d36", "#ff9f1c"],
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
