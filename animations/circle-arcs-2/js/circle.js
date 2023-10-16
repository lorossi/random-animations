import { Arc } from "./arc.js";
import { Color } from "./engine.js";

class Circle {
  constructor(x, y, r) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._scl = 0.8;
    this._arcs = [];
  }

  setAttributes(
    rings,
    min_arcs,
    max_arcs,
    min_arc_length,
    max_arc_length,
    probability
  ) {
    this._rings = rings;
    this._min_arcs = min_arcs;
    this._max_arcs = max_arcs;
    this._min_arc_length = min_arc_length;
    this._max_arc_length = max_arc_length;
    this._probability = probability;
  }

  setPalette(palette) {
    this._palette = palette;
  }

  injectDependencies(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;
  }

  generate() {
    for (let r = 0; r < this._rings; r++) {
      const arcs = this._xor128.random_int(this._min_arcs, this._max_arcs);

      for (let a = 0; a < arcs; a++) {
        if (this._xor128.random() > this._probability) continue;

        const start_angle = this._xor128.random(Math.PI * 2);
        const end_angle =
          start_angle +
          this._xor128.random(this._min_arc_length, this._max_arc_length);

        const fill = this._xor128.pick(this._palette);
        const inner_r = this._r * (r / this._rings);
        const outer_r = this._r * ((r + 1) / this._rings);
        const dr = this._xor128.random_interval(1, 0.1);

        this._arcs.push(
          new Arc(inner_r * dr, outer_r * dr, start_angle, end_angle, fill)
        );
      }
    }
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.scale(this._scl, this._scl);
    this._arcs.forEach((arc) => arc.show(ctx));
    ctx.restore();
  }
}

export { Circle };
