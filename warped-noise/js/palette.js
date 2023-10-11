import { Color } from "./engine.js";

const PALETTE = [
  [new Color(34, 87, 122), new Color(56, 163, 165), new Color(87, 204, 153)],
  [new Color(255, 188, 66), new Color(216, 17, 89), new Color(33, 131, 128)],
];

class ColorFactory {
  constructor(xor128) {
    this._xor128 = xor128;
    this._current_palette = this._xor128.pick(PALETTE);
  }

  mix(levels) {
    const components = new Array(3).fill(0);
    levels = levels
      .map((l) => l / levels.reduce((acc, curr) => acc + curr, 0)) // normalize
      .forEach((l, i) => {
        if (i < this._current_palette.length) {
          // get the rgb values
          components[0] += this._current_palette[i].r * l;
          components[1] += this._current_palette[i].g * l;
          components[2] += this._current_palette[i].b * l;
        }
      });

    return new Color(...components);
  }
}

export { ColorFactory };
