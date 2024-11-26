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
  // https://coolors.co/palette/031926-468189-77aca2-9dbebb-f4e9cd
  ["#031926", "#468189", "#77aca2", "#9dbebb", "#f4e9cd"],
  // https://coolors.co/palette/2d3142-bfc0c0-ffffff-ef8354-4f5d75
  ["#2d3142", "#bfc0c0", "#ffffff", "#ef8354", "#4f5d75"],
  // https://coolors.co/palette/011627-fdfffc-2ec4b6-e71d36-ff9f1c
  ["#011627", "#fdfffc", "#2ec4b6", "#e71d36", "#ff9f1c"],
  // https://coolors.co/palette/31393c-2176ff-33a1fd-fdca40-f79824
  ["#31393c", "#2176ff", "#33a1fd", "#fdca40", "#f79824"],
  // https://coolors.co/palette/8ecae6-219ebc-023047-ffb703-fb8500
  ["#8ecae6", "#219ebc", "#023047", "#ffb703", "#fb8500"],
  // https://coolors.co/palette/e63946-f1faee-a8dadc-457b9d-1d3557
  ["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557"],
  // https://coolors.co/palette/353535-3c6e71-ffffff-d9d9d9-284b63
  ["#353535", "#3c6e71", "#ffffff", "#d9d9d9", "#284b63"],
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
