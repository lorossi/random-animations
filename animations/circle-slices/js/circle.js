class Circle {
  constructor(r, slices_num, slices_scl, fg_color) {
    this._r = r;
    this._slices_num = slices_num;
    this._slices_scl = slices_scl;
    this._fg_color = fg_color;

    this._slice_width = (this._r * 2) / slices_num;
    this._t = 0;
  }

  update(t) {
    this._t = t;
  }

  show(ctx) {
    ctx.save();
    ctx.translate(0, this._r);

    for (let i = 0; i < this._slices_num; i++) {
      const dx = this._t * this._slice_width;
      const sx = this._slice_width * i;
      const x = this._wrap(sx + dx, 0, this._r * 2);

      const height = Math.sqrt(this._r ** 2 - (this._r - x) ** 2) * 2;

      ctx.fillStyle = this._fg_color.rgba;
      ctx.beginPath();
      ctx.ellipse(
        x + this._slice_width / 2,
        0,
        (this._slice_width / 2) * this._slices_scl,
        height / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  }

  _wrap(x, min_x, max_x) {
    while (x < min_x) x += max_x - min_x;
    return x % max_x;
  }

  _easeInOutPoly(x, n = 2) {
    return x ** n;
  }
}

export { Circle };
