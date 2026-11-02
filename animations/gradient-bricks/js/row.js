import { Utils } from "./lib.js";

class Segment {
  constructor(x, width, from, to, stop) {
    this._x = x;
    this._width = width;
    this._from = from;
    this._to = to;
    this._stop = stop;
  }

  show(ctx, dx, height) {
    const x0 = Math.round(this._x + dx);
    const x1 = Math.round(this._x + this._width + dx);

    const gradient = ctx.createLinearGradient(x0, 0, x1, 0);
    gradient.addColorStop(0, this._from.rgba);
    gradient.addColorStop(this._stop, this._from.rgba);
    gradient.addColorStop(1, this._to.rgba);

    ctx.fillStyle = gradient;
    ctx.fillRect(x0, 0, x1 - x0, height);
  }
}

class Row {
  constructor(y, width, height, palette, xor128) {
    this._y = y;
    this._width = width;
    this._height = height;
    this._palette = palette;
    this._xor128 = xor128;

    this._offset = 0;
    this._generateSegments();
  }

  _generateSegments() {
    const segments_num = this._xor128.random_int(3, 6);
    let widths = Array(segments_num)
      .fill(null)
      .map(() => this._xor128.random(0.1, 0.25));
    const total_width = widths.reduce((a, b) => a + b, 0);
    widths = widths.map((w) => (w / total_width) * this._width);

    let prev = null;
    let x = 0;
    this._segments = widths.map((width) => {
      let [from, to] = this._xor128.shuffle_array([...this._palette.colors]);
      // mostly keep a hard edge between consecutive segments
      if (from == prev && this._xor128.random() < 0.85) {
        [from, to] = [to, from];
      }
      prev = to;
      // some segments keep a flat color before fading
      const stop =
        this._xor128.random() < 0.3 ? this._xor128.random(0.1, 0.5) : 0;
      const segment = new Segment(x, width, from, to, stop);
      x += width;
      return segment;
    });
  }

  show(ctx) {
    ctx.save();
    ctx.translate(0, this._y);
    // the row is periodic, so draw it twice to cover the wrap around
    const dx = Utils.wrap(this._offset, 0, this._width);
    this._segments.forEach((s) => {
      s.show(ctx, dx, this._height);
      s.show(ctx, dx - this._width, this._height);
    });
    ctx.restore();
  }

  move(offset) {
    this._offset = offset;
  }
}

export { Row };
