import { Color } from "./engine.js";

class Palette {
  constructor(background, colors) {
    this._colors = colors;
    this._background = background;
  }

  get colors() {
    return this._colors;
  }

  get background() {
    return this._background;
  }
}

class PaletteFactory {
  static getRandomPalette(xor128) {
    const length = xor128.random_int(4, 7);
    const background = Color.fromMonochrome(245);
    const colors = new Array(length).fill(0).map((_, i) => {
      const ch = (i / length) * 200 * xor128.random_interval(1, 0.15);
      return Color.fromMonochrome(ch);
    });

    return new Palette(background, colors);
  }
}

export { Palette, PaletteFactory };
