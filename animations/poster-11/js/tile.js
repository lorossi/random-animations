class Tile {
  constructor(x, y, probability, size, color, xor128) {
    this._x = x;
    this._y = y;
    this._probability = probability;
    this._size = size;
    this._color = color;
    this._xor128 = xor128;
  }

  draw(ctx) {
    if (this._xor128.random() < this._probability) return;

    const angle = this._xor128.random_int(0, 3) * (Math.PI / 2);
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.rotate(angle);

    this._fillFunction(ctx);

    ctx.restore();
  }

  _fillFunction(ctx) {
    ctx.fillStyle = this._color;

    const max_points = 1000;
    const d_angle = (Math.PI * 2) / max_points;
    for (let i = 0; i < max_points; i++) {
      ctx.save();
      const curr_c = this._color.copy();
      curr_c.a = this._easeIn(i / max_points, 2);
      ctx.fillStyle = curr_c.rgba;

      ctx.beginPath();
      ctx.arc(0, 0, this._size / 2, i * d_angle, (i + 1) * d_angle);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  _easeIn(x, n) {
    return x ** n;
  }
}

export { Tile };
