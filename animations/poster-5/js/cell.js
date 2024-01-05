class Cell {
  constructor(x, y, size, levels, level_scl) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._levels = levels;
    this._level_scl = level_scl;
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
      // create the randomly permuted palette
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);

      // draw the background triangle
      const bg_color = color_list[i % this._palette.length].rgba;

      ctx.fillStyle = bg_color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-this._size / 2, -this._size / 2);
      ctx.lineTo(this._size / 2, -this._size / 2);
      ctx.closePath();
      ctx.fill();

      // draw the circles
      for (let j = 0; j < this._levels; j++) {
        const dr = this._size / 2 / (this._levels + 1);
        const r_in = dr * (j + 1);
        const r_out = r_in + dr * this._level_scl;

        const fill_index =
          (i + j) % this._palette.length != i
            ? (i + j) % this._palette.length
            : (i + j + 1) % this._palette.length;

        const fill = color_list[fill_index].rgba;

        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = fill;

        ctx.beginPath();
        ctx.arc(0, 0, r_out, -Math.PI / 4, Math.PI / 4);
        ctx.arc(0, 0, r_in, Math.PI / 4, -Math.PI / 4, true);
        ctx.closePath();
        ctx.clip();

        ctx.fillRect(-this._size / 2, -this._size / 2, this._size, this._size);
        ctx.restore();
      }

      ctx.restore();
    }

    ctx.restore();
  }
}

export { Cell };
