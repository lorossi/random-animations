import { Palette, Color } from "./lib.js";

const _clamp_c = (x) => Math.min(255, Math.max(0, x));

class RandomPaletteFactory {
  static getRandomPalette(xor128, dc = 8) {
    const colors_num = xor128.random_int(4, 6);
    const start = xor128.random_int(0, 16);
    const end = start + xor128.random_int(64, 92);

    const colors = new Array(colors_num).fill(null).map((_, i) => {
      const n = start + (end - start) / (i + 1);
      const r = _clamp_c(xor128.random_interval(n, dc));
      const g = _clamp_c(xor128.random_interval(n, dc));
      const b = _clamp_c(xor128.random_interval(n, dc));

      return new Color(r, g, b);
    });
    return new Palette(colors);
  }
}

export { RandomPaletteFactory };
