class Tile {
  constructor(x, y, size, palette, xor128) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._palette = palette;
    this._xor128 = xor128;
  }

  draw(ctx) {
    const angle = this._xor128.random_int(0, 3) * (Math.PI / 2);
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.rotate(angle);

    this._fillFunction(ctx);

    ctx.restore();
  }

  _fillFunction(ctx) {
    const [bg, fg] = this._palette.shuffle(this._xor128).colors;
    ctx.fillStyle = bg;
    ctx.fillRect(-this._size / 2, -this._size / 2, this._size, this._size);

    ctx.fillStyle = fg;
    ctx.strokeStyle = fg;
    ctx.lineWidth = 2;

    if (this._xor128.random_bool()) {
      ctx.beginPath();
      ctx.arc(-this._size / 2, -this._size / 2, this._size, 0, Math.PI / 2);
      ctx.lineTo(-this._size / 2, -this._size / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(
        this._size / 2,
        0,
        this._size / 2,
        Math.PI / 2,
        (3 / 2) * Math.PI
      );
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        -this._size / 2,
        0,
        this._size / 2,
        (3 / 2) * Math.PI,
        (5 / 2) * Math.PI
      );
      ctx.fill();
      ctx.stroke();
    }
  }
}

export { Tile };
