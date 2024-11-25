class Square {
  constructor(x, y, size, stripes, palette) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._stripes = stripes;
    this._palette = palette.copy();
  }

  show(ctx) {
    const scl = this._size / this._stripes;
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);

    // draw rectangle from center
    for (let i = this._stripes; i >= 0; i--) {
      const w = scl * i;
      ctx.fillStyle = this._palette.getColor(i).rgba;
      ctx.fillRect(-w / 2, -w / 2, w, w);
    }

    ctx.restore();
  }
}

export { Square };
