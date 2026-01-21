import { Arc } from "./arc.js";

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
    probability,
    time_scl,
  ) {
    this._rings = rings;
    this._min_arcs = min_arcs;
    this._max_arcs = max_arcs;
    this._min_arc_length = min_arc_length;
    this._max_arc_length = max_arc_length;
    this._probability = probability;
    this._time_scl = time_scl;
  }

  setPalette(palette) {
    this._palette = palette;
  }

  initDependencies(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;

    this._seed = this._xor128.random(2 ** 32);
  }

  generate() {
    for (let r = 0; r < this._rings; r++) {
      const arcs = this._xor128.random_int(this._min_arcs, this._max_arcs);
      const angle_length =
        ((Math.PI * 2) / arcs) * this._xor128.random_interval(1, 0.25);
      const fill = this._xor128.pick(this._palette);

      for (let a = 0; a < arcs; a++) {
        const start_angle = angle_length * a;
        const end_angle =
          start_angle + angle_length * this._xor128.random_interval(1, 0.25);

        const inner_r = this._r * (r / this._rings);
        const outer_r = this._r * ((r + 1) / this._rings);
        const dr = this._xor128.random_interval(1, 0.1);

        const new_arc = new Arc(
          inner_r * dr,
          outer_r * dr,
          start_angle,
          end_angle,
          fill,
        );
        new_arc.initDependencies(this._noise);
        this._arcs.push(new_arc);
      }
    }
  }

  update(t) {
    const theta = Math.PI * 2 * t;
    const tx = this._time_scl * (1 + Math.cos(theta));
    const ty = this._time_scl * (1 + Math.sin(theta));

    this._arcs.forEach((a, i) => a.update(tx, ty, this._seed + i / 1000));
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
