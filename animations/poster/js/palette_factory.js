//! https://paperheartdesign.com/blog/color-palette-terrific-teal
import { Color } from "./engine.js";

const PALETTES = [
  [
    Color.fromHEX("#090349"),
    Color.fromHEX("#072879"),
    Color.fromHEX("#740846"),
    Color.fromHEX("#A1002A"),
    Color.fromHEX("#F01501"),
  ],
  [
    Color.fromHEX("#2a416a"),
    Color.fromHEX("#305955"),
    Color.fromHEX("#258786"),
    Color.fromHEX("#ca7558"),
    Color.fromHEX("#9ec2b6"),
  ],
  [
    Color.fromHEX("#01213a"),
    Color.fromHEX("#01411f"),
    Color.fromHEX("#005d55"),
    Color.fromHEX("#08afa8"),
    Color.fromHEX("#8aed07"),
  ],
  [
    Color.fromHEX("#041e2b"),
    Color.fromHEX("#023f51"),
    Color.fromHEX("#db3600"),
    Color.fromHEX("#00829a"),
    Color.fromHEX("#0cb1c7"),
  ],
  [
    Color.fromHEX("#041421"),
    Color.fromHEX("#042630"),
    Color.fromHEX("#4c7273"),
    Color.fromHEX("#86b9b0"),
    Color.fromHEX("#d0d6d6"),
  ],
  [
    Color.fromHEX("#23383b"),
    Color.fromHEX("#246068"),
    Color.fromHEX("#3aa1aa"),
    Color.fromHEX("#e29000"),
    Color.fromHEX("#fadb67"),
  ],
  [
    Color.fromHEX("#0e3308"),
    Color.fromHEX("#023e48"),
    Color.fromHEX("#1b666b"),
    Color.fromHEX("#a64510"),
    Color.fromHEX("#ffa948"),
  ],
  [
    Color.fromHEX("#0d2c2f"),
    Color.fromHEX("#01555f"),
    Color.fromHEX("#ce505c"),
    Color.fromHEX("#f0839a"),
    Color.fromHEX("#ffe4ed"),
  ],
];

class PaletteFactory {
  static randomPalette(xor128) {
    return xor128.pick(PALETTES);
  }
}

export { PaletteFactory };
