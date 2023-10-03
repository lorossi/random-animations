import { Color } from "./engine.js";

class Palette {
  constructor(offset) {
    if (offset === undefined) offset = Math.random();
    else if (offset < 0) throw new Error("offset must be >= 0");

    this._offset = offset;

    this._cache = {};
    this._epsilon = 0.005;
  }

  interpolate(t) {
    // approximate t to epsilon
    const bounded_t = (t + this._offset) % 1;
    const approx_t = Math.floor(bounded_t / this._epsilon) * this._epsilon;
    if (approx_t in this._cache) return this._cache[approx_t];

    const h = Math.floor(approx_t * 360);
    const c = Color.fromHSL(h, 100, 50);
    this._cache[approx_t] = c;

    return c;
  }
}

export { Palette };
