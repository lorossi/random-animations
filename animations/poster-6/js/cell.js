class Cell {
  constructor(x, y, size, circle_scl) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._circle_scl = circle_scl;
  }

  setPalette(palette) {
    this._palette = palette;
  }

  setXOR128(xor128) {
    this._xor128 = xor128;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.rotate(this._xor128.random_int(3) * (Math.PI / 2));
    const color_list = this._palette.shuffle(this._xor128).colors;

    for (let i = 0; i < 4; i++) {
      const bg = color_list[i].rgba;
      const fg = color_list[(i + 2) % 4].rgba;

      ctx.save();
      ctx.rotate((i * Math.PI) / 2);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-this._size / 2, -this._size / 2);
      ctx.lineTo(this._size / 2, -this._size / 2);
      ctx.closePath();
      ctx.clip();

      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
      ctx.fill();

      ctx.fillStyle = fg;
      for (let i = 0; i < 2; i++) {
        const x = i == 0 ? -this._size / 4 : this._size / 4;
        const r = (this._circle_scl * this._size) / 4;
        ctx.beginPath();
        ctx.arc(x, -this._size / 4, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }
}

export { Cell };
