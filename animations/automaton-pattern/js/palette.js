import { Color } from "./engine.js";

const PALETTES = [
  ["#811638", "#0B7978", "#FCB632", "#F27238", "#C32327"],
  ["#DA3391", "#E56E2E", "#F9C80E", "#EAA72F", "#259AA1"],
  ["#233D4D", "#FE7F2D", "#FCCA46", "#A1C181", "#619B8A"],
  ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93"],
  ["#006BA6", "#0496FF", "#FFBC42", "#D81159", "#8F2D56"],
  ["#CCDBDC", "#9AD1D4", "#80CED7", "#007EA7", "#003249"],
  ["#33A9AC", "#FFA646", "#F86041", "#982062", "#343779"],
];

class Palette {
  constructor(colors) {
    this._colors = colors;
  }

  get colors() {
    return this._colors;
  }

  shuffle(rng) {
    this._colors = rng.shuffle(this._colors);
  }

  copy() {
    return new Palette(this._colors.map((c) => c.copy()));
  }
}

class PaletteFactory {
  static createPalette(palette_i) {
    if (palette_i < 0 || palette_i >= PALETTES.length)
      throw new Error("Invalid palette index");

    return new Palette(PALETTES[palette_i].map((c) => Color.fromHEX(c)));
  }

  static createRandomPalette(rng) {
    const palette_i = rng.random_int(PALETTES.length);
    return PaletteFactory.createPalette(palette_i);
  }

  static getPaletteCount() {
    return PALETTES.length;
  }
}

export { Palette, PaletteFactory };
