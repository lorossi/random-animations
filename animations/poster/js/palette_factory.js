//! https://paperheartdesign.com/blog/color-palette-terrific-teal
import { Color } from "./engine.js";

const PALETTES = [
  ["#090349", "#072879", "#740846", "#A1002A", "#F01501"],
  ["#2a416a", "#305955", "#258786", "#ca7558", "#9ec2b6"],
  ["#01213a", "#01411f", "#005d55", "#08afa8", "#8aed07"],
  ["#041e2b", "#023f51", "#db3600", "#00829a", "#0cb1c7"],
  ["#041421", "#042630", "#4c7273", "#86b9b0", "#d0d6d6"],
  ["#23383b", "#246068", "#3aa1aa", "#e29000", "#fadb67"],
  ["#0e3308", "#023e48", "#1b666b", "#a64510", "#ffa948"],
  ["#0d2c2f", "#01555f", "#ce505c", "#f0839a", "#ffe4ed"],
];

class Palette {
  constructor(colors) {
    this._colors = colors;
  }

  get colors() {
    return this._colors;
  }
}

class PaletteFactory {
  static getRandomPalette(xor128) {
    const hexes = xor128.pick(PALETTES);
    return new Palette(hexes.map((h) => Color.fromHEX(h)));
  }
}

export { PaletteFactory };
