import { Segment } from "./segment.js";

class Circle {
  constructor(x, y, scl) {
    this._x = x;
    this._start_y = y;
    this._scl = scl;

    this._segments = [];
    this._created = false;
  }

  setAttributes(palette, noise_scl, segments_num) {
    this._palette = palette;
    this._noise_scl = noise_scl;
    this._segments_num = segments_num;
  }

  initDependencies(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;
  }

  update() {
    if (!this._created) {
      const seed = this._xor128.random(2 ** 32);
      const inner_r = this._scl / 20;
      this._segments = new Array(this._segments_num)
        .fill(0)
        .map(() => {
          const angle = this._xor128.random(Math.PI * 2);
          const x = Math.cos(angle) * inner_r;
          const y = Math.sin(angle) * inner_r;
          const dx = this._xor128.random_interval(0, 0.5) * inner_r;
          const dy = this._xor128.random_interval(0, 0.25) * inner_r;
          const scl =
            ((inner_r * Math.PI * 20) / this._segments_num) *
            this._xor128.random(1, 4);

          const s = new Segment(x + dx, y + dy, scl);
          s.setAttributes(
            this._palette,
            seed,
            this._noise_scl,
            angle,
            this._scl / 2,
          );
          s.initDependencies(this._xor128, this._noise);
          return s;
        })
        .map((segment) => ({ segment: segment, order: this._xor128.random(1) }))
        .sort((a, b) => a.order - b.order)
        .map((obj) => obj.segment);
      this._created = true;
    }

    this._segments.forEach((segment) => {
      segment.update();
    });
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._start_y);

    this._segments.forEach((segment) => {
      segment.show(ctx);
    });

    ctx.restore();
  }
}

export { Circle };
