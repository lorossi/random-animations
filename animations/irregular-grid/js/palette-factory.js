import { Color } from "./engine.js";

class Palette {
  constructor(colors) {
    this._colors = colors;
  }

  shuffle(xor128) {
    this._colors = this._colors
      .map((c) => ({ color: c, order: xor128.random() }))
      .sort((a, b) => a.order - b.order)
      .map((c) => c.color);

    return this;
  }

  copy() {
    return new Palette(...this._colors);
  }

  getColor(i) {
    return this._colors[i % this._colors.length];
  }

  get colors() {
    return this._colors;
  }

  get length() {
    return this._colors.length;
  }
}

const PALETTES = [
  // https://coolors.co/palette/d6d6d6-ffee32-ffd100-202020-333533
  ["#d6d6d6", "#ffee32", "#ffd100", "#202020", "#333533"],
  // https://coolors.co/palette/011627-fdfffc-2ec4b6-e71d36-ff9f1c
  ["#011627", "#fdfffc", "#2ec4b6", "#e71d36", "#ff9f1c"],
  // https://coolors.co/palette/ef476f-ffd166-06d6a0-118ab2-073b4c
  ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
  // https://coolors.co/palette/3d348b-7678ed-f7b801-f18701-f35b04
  ["#3d348b", "#7678ed", "#f7b801", "#f18701", "#f35b04"],
  // https://coolors.co/palette/3d348b-7678ed-f7b801-f18701-f35b04
  ["#3d348b", "#7678ed", "#f7b801", "#f18701", "#f35b04"],
  // https://coolors.co/palette/001219-005f73-0a9396-94d2bd-e9d8a6-ee9b00-ca6702-bb3e03-ae2012-9b2226
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
  // https://coolors.co/palette/ff595e-ffca3a-8ac926-1982c4-6a4c93
  ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"],
];

class PaletteFactory {
  static getRandomPalette(xor128) {
    const colors = xor128
      .pick(PALETTES)
      .map((c) => ({ color: c, order: xor128.random() }))
      .sort((a, b) => a.order - b.order)
      .map((c) => Color.fromHEX(c.color));

    return new Palette(colors);
  }

  static getPalette(n) {
    return new Palette(
      PALETTES[n % PALETTES.length].map((h) => Color.fromHEX(h))
    );
  }
}

export { PaletteFactory };
