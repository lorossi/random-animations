import { Shape } from "./shape.js";
import { Color } from "./lib.js";

class Blob {
  constructor(x, y, scl, time_scl, size, fill_colors, noise, rng) {
    this._x = x;
    this._y = y;
    this._scl = scl;
    this._time_scl = time_scl;
    this._size = size;
    this._fill = fill_colors;
    this._noise = noise;
    this._rng = rng;

    this._rotation = (this._rng.random_int(4) * Math.PI) / 2;

    const shuffled_colors = this._fill
      .slice()
      .map((c) => ({ color: c, order: this._rng.random() }))
      .sort((a, b) => a.order - b.order)
      .map((c) => c.color);

    const point_fill = Color.fromMonochrome(15, 0.75);
    this._shapes = new Array(4)
      .fill(null)
      .map(
        (_, i) =>
          new Shape(
            size,
            this._time_scl,
            shuffled_colors[i % 2],
            point_fill,
            noise,
            rng,
          ),
      );
  }

  update(t) {
    this._shapes.forEach((s) => s.update(t));
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl, this._scl);
    ctx.rotate(this._rotation);

    this._shapes.forEach((s, i) => {
      ctx.rotate((i * Math.PI) / 2);
      s.draw(ctx);
    });

    ctx.restore();
  }
}

export { Blob };
