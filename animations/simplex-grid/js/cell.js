class Cell {
  constructor(x, y, size, palette) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._palette = palette;

    this._n = 0;
  }

  update(n) {
    this._n = n;
  }

  show(ctx) {
    const i = Math.floor(((this._n + 1) / 2) * this._palette.length);
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.fillStyle = this._palette.getColor(i).rgba;
    ctx.fillRect(0, 0, this._size, this._size);
    ctx.restore();
  }
}

export { Cell };
