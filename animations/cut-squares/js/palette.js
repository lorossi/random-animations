import { Color } from "./engine.js";

const PALETTES = [
  [Color.fromMonochrome(15), Color.fromMonochrome(245)],
  [Color.fromHEX("#130e0a"), Color.fromHEX("#dcd7c4")],
];

class Palette {
  constructor(fg, bg) {
    this._fg = fg;
    this._bg = bg;
  }

  get foreground() {
    return this._fg;
  }

  get background() {
    return this._bg;
  }
}

class PaletteFactory {
  static getPalette(i) {
    if (i > PALETTES.length)
      throw Error(`i must be lower than ${PALETTES.length}`);

    return new Palette(...PALETTES[i]);
  }

  static getPaletteCount() {
    return PALETTES.length;
  }
}

export { Palette, PaletteFactory };
