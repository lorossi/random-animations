class Circle {
  constructor(x, y, radius, stripes_num, color) {
    this._x = x;
    this._y = y;
    this._radius = radius;
    this._stripes_num = stripes_num;
    this._color = color;
  }

  draw(ctx, t) {
    const scl = this._radius / this._stripes_num / 2;

    ctx.save();
    ctx.fillStyle = this._color.rgba;

    for (let i = 0; i < this._stripes_num; i++) {
      let r1 = this._radius - i * scl * 2 + t * scl * 2;
      if (r1 < scl) r1 = scl;
      if (r1 > this._radius) r1 -= this._radius;
      let r2 = r1 - scl;
      if (r2 < 0) r2 = 0;

      ctx.beginPath();
      ctx.arc(this._x, this._y, r1, 0, Math.PI * 2);
      ctx.arc(this._x, this._y, r2, Math.PI * 2, 0, true);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  _wrapR(r) {
    while (r < 0) r += this._radius;
    while (r > this._radius) r -= this._radius;
    return r;
  }
}

export { Circle };
