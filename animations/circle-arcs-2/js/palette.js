import { Color } from "./engine.js";

class Palette {
  constructor(colors) {
    this._colors = colors;
  }

  get colors() {
    return this._colors.fg;
  }

  get background() {
    return this._colors.bg;
  }
}

class PaletteFactory {
  constructor(xor128) {
    this._xor128 = xor128;
  }

  randomPalette() {
    const length = this._xor128.random_int(4, 7);
    const background = Color.fromMonochrome(245);
    const colors = new Array(length).fill(0).map((_, i) => {
      const ch = (i / length) * 200 * this._xor128.random_interval(1, 0.15);
      return Color.fromMonochrome(ch);
    });

    return new Palette({ fg: colors, bg: background });
  }
}

export { Palette, PaletteFactory };
