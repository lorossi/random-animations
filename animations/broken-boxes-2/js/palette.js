import { Color } from "./engine.js";

const PALETTE = [
  ["#fbf1c7", "#282828"],
  ["#262626", "#f0f0f0"],
  ["#14213d", "#e5e5e5"],
  ["#353535", "#ffffff"],
];

class Palette {
  constructor(colors) {
    this._fg = colors[0];
    this._bg = colors[1];
  }

  get fg() {
    return this._fg;
  }

  get bg() {
    return this._bg;
  }
}

class PaletteFactory {
  static randomPalette(xor128) {
    const hex_list = xor128.pick(PALETTE);
    const shuffled = xor128.shuffle([...hex_list]).map((h) => Color.fromHEX(h));
    return new Palette(shuffled);
  }
}

export { Palette, PaletteFactory };
