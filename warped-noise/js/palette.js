import { Color } from "./engine.js";

class TriadicPalette {
  constructor(base_hue, span) {
    this._colors = Array(3)
      .fill(0)
      .map((_, i) => Color.fromHSL((base_hue + i * span) % 360, 100, 50));
  }

  get colors() {
    return this._colors;
  }
}

class ColorFactory {
  constructor(xor128) {
    this._xor128 = xor128;
    const base_hue = this._xor128.random(360);
    const span = this._xor128.random(40, 120);
    this._current_palette = new TriadicPalette(base_hue, span);
  }

  mix(levels) {
    const components = new Array(3).fill(0);
    levels = levels
      .map((l) => l / levels.reduce((acc, curr) => acc + curr, 0)) // normalize
      .forEach((l, i) => {
        if (i < this._current_palette.colors.length) {
          // get the rgb values
          components[0] += this._current_palette.colors[i].r * l;
          components[1] += this._current_palette.colors[i].g * l;
          components[2] += this._current_palette.colors[i].b * l;
        }
      });

    return new Color(...components);
  }
}

export { ColorFactory };
