import { Point, Color } from "./lib.js";

class Tower {
  constructor(x, width, max_height, slots, xor128, noise) {
    this._x = x;
    this._width = width;
    this._max_height = max_height;
    this._slots = slots;
    this._xor128 = xor128;
    this._noise = noise;

    this._stroke_c = Color.fromMonochrome(25);
    this._noise_scl = 0.0005;

    this._slots_size = Math.min(this._max_height / this._slots, this._width);
    this._height = this._slots_size * this._slots;

    this._scores = new Array(this._slots)
      .fill(0)
      .map((_, i) => {
        const n = this._noise.noise(i, this._x * this._noise_scl, 1000);
        return { index: i, value: ((n + 1) / 2) * this._slots };
      })
      .sort((a, b) => b.value - a.value)
      .map((s) => s.index);

    this._lines_num = new Array(this._slots)
      .fill(0)
      .map(() => 2 ** this._xor128.random_int(2, 4));
    this._lines_angle = new Array(this._slots)
      .fill(0)
      .map(() => (this._xor128.pick([-1, 1]) * Math.PI) / 4);
  }

  show(ctx) {
    const dx = this._x;
    const dy = (this._max_height - this._height) / 2;

    ctx.save();
    ctx.translate(dx, dy);
    ctx.strokeStyle = this._stroke_c.rgba;

    for (let i = 0; i < this._slots; i++) {
      this._draw_slot(ctx, i);
    }

    ctx.restore();
  }

  _draw_slot(ctx, i) {
    const size = this._slots_size;
    const y = i * size;
    const dx = (size * Math.SQRT2) / this._lines_num[i];

    ctx.save();
    ctx.translate(0, y);
    ctx.lineWidth = 2;

    // clip the slot
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.clip();

    ctx.translate(size / 2, size / 2);
    ctx.rotate(this._lines_angle[i]);
    ctx.translate((-size / 2) * Math.SQRT2, (-size / 2) * Math.SQRT2);

    for (let j = 0; j < this._lines_num[i]; j++) {
      const x = j * dx;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size * Math.SQRT2);
      ctx.stroke();
    }

    ctx.restore();
  }

  get_coords(slot) {
    const x = this._x + this._width / 2;
    const y =
      (this._max_height - this._height) / 2 +
      slot * this._slots_size +
      this._slots_size / 2;
    return new Point(x, y);
  }

  get_score_coords(score) {
    const slot = this._scores[score];
    return this.get_coords(slot);
  }

  get slot_height() {
    return this._slots_size;
  }
}

export { Tower };
