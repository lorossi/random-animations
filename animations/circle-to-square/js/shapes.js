class Shape {
  constructor(x, y, size, color, scl, d) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._color = color;
    this._scl = scl;
    this._d = d;
  }

  update(t) {
    const tt = this._wrap(t - this._d);
    this._radii = this._size * this._easeTrig(tt);
  }

  show(ctx) {
    ctx.save();
    ctx.fillStyle = this._color.rgba;
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl, this._scl);
    ctx.translate(-this._size / 2, -this._size / 2);
    ctx.beginPath();
    ctx.roundRect(0, 0, this._size, this._size, this._radii);
    ctx.fill();
    ctx.restore();
  }

  _easeTrig(x, n = 4) {
    return Math.sin(x * Math.PI) ** n;
  }

  _wrap(x, min = 0, max = 1) {
    while (x < min) x += max - min;
    while (x > max) x -= max - min;
    return x;
  }
}

export { Shape };
