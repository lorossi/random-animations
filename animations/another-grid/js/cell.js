class Cell {
  constructor(x, y, size, circle_scl = 0.85) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._circle_scl = circle_scl;

    this._has_background = false;
    this._circles_num = 0;
    this._palette = null;
  }

  setHasBackground(value) {
    this._has_background = value;
  }

  setCirclesNum(circles_num) {
    this._circles_num = circles_num;
  }

  setPalette(palette) {
    this._palette = palette;
  }

  show(ctx) {
    if (!this._has_background && !this._circles_num) return;

    if (this._has_background) this._showBackground(ctx);
    if (this._circles_num > 0) this._showCircle(ctx);
  }

  _showBackground(ctx) {
    ctx.save();
    ctx.fillStyle = this._palette.getColor(0).rgba;
    ctx.fillRect(this._x, this._y, this._size, this._size);

    ctx.restore();
  }

  _showCircle(ctx) {
    ctx.save();
    for (let i = 0; i < this._circles_num; i++) {
      ctx.fillStyle = this._palette.getColor(i + 1).rgba;
      ctx.beginPath();
      ctx.arc(
        this._x + this._size / 2,
        this._y + this._size / 2,
        ((this._size / 2) * this._circle_scl) / 2 ** i,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }
}

export { Cell };
