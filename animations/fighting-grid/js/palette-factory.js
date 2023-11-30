import { Color } from "./engine.js";

class Palette {
  constructor(colors) {
    this._colors = colors;
  }

  get colors() {
    return this._colors;
  }
}

const PALETTES = [
  ["#8ecae6", "#219ebc", "#023047", "#ffb703", "#fb8500"],
  ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
  ["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557"],
  ["#003049", "#d62828", "#f77f00", "#fcbf49", "#eae2b7"],
  ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
  ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
  ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b"],
  ["#066043", "#5e794c", "#c65b54", "#d0812c", "#daa603"],
  [
    "#001219",
    "#005f73",
    "#0a9396",
    "#94d2bd",
    "#e9d8a6",
    "#ee9b00",
    "#ca6702",
    "#bb3e03",
    "#ae2012",
    "#9b2226",
  ],
];

class PaletteFactory {
  static getRandomPalette(xor128) {
    const hex_list = xor128.pick(PALETTES);
    const colors = hex_list.map((h) => Color.fromHEX(h));
    return new Palette(colors);
  }
}

export { PaletteFactory };
