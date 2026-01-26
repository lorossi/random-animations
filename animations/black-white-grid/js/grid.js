class Cell {
  constructor(x, y, w, h, palette, xor128) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
    this._palette = palette.copy();
    this._xor128 = xor128;

    this._min_size = 50;
    this._children = [];

    this._cols_num = this._xor128.random_int(4, 10);
    this._rows_num = Math.ceil(this._cols_num * (this._h / this._w));

    this._rotation = this._xor128.random_int(8) * (Math.PI / 4);

    this._palette.shuffle(this._xor128);

    this._draw_function = this._xor128
      .pick([this._draw_one, this._draw_two, this._draw_three])
      .bind(this);
  }

  split() {
    if (this._children.length > 0) return;
    if (Math.min(this._w, this._h) < this._min_size) return;

    const split_horizontally = this._xor128.random_bool();
    const l = this._xor128.random(0.4, 0.6);

    if (split_horizontally) {
      const h1 = this._h * l;
      const h2 = this._h * (1 - l);
      this._children.push(
        new Cell(this._x, this._y, this._w, h1, this._palette, this._xor128),
      );
      this._children.push(
        new Cell(
          this._x,
          this._y + h1,
          this._w,
          h2,
          this._palette,
          this._xor128,
        ),
      );
    } else {
      const w1 = this._w * l;
      const w2 = this._w * (1 - l);
      this._children.push(
        new Cell(this._x, this._y, w1, this._h, this._palette, this._xor128),
      );
      this._children.push(
        new Cell(
          this._x + w1,
          this._y,
          w2,
          this._h,
          this._palette,
          this._xor128,
        ),
      );
    }

    this._children.forEach((child) => child.split());
  }

  show(ctx) {
    if (this._children.length > 0) {
      this._children.forEach((child) => child.show(ctx));
      return;
    }

    ctx.save();
    ctx.translate(this._x + this._w / 2, this._y + this._h / 2);
    ctx.rotate(this._rotation);
    ctx.translate(-this._w / 2, -this._h / 2);

    const [bg, fg] = this._palette.colors;
    const cell_scl = Math.floor(
      Math.min(this._w / this._cols_num, this._h / this._rows_num),
    );

    // fill background
    ctx.fillStyle = bg.rgba;
    ctx.beginPath();
    ctx.rect(0, 0, this._w, this._h);
    ctx.fill();

    // draw grid
    ctx.fillStyle = fg.rgba;
    this._draw_function(ctx, cell_scl);

    ctx.restore();
  }

  _draw_one(ctx, cell_scl) {
    for (let xx = 0; xx < this._cols_num; xx++) {
      if (xx % 2 == 0) continue;

      for (let yy = 0; yy < this._rows_num; yy++) {
        if ((xx + yy) % 2 == 0) continue;

        ctx.fillRect(xx * cell_scl, yy * cell_scl, cell_scl, cell_scl);
      }
    }
  }

  _draw_two(ctx, cell_scl) {
    for (let xx = 0; xx < this._cols_num; xx++) {
      if (xx % 2 == 0) continue;

      for (let yy = 0; yy < this._rows_num; yy++) {
        if ((xx + yy) % 4 == 0) continue;

        ctx.fillRect(xx * cell_scl, yy * cell_scl, cell_scl, cell_scl);
      }
    }
  }

  _draw_three(ctx, cell_scl) {
    for (let xx = 0; xx < this._cols_num; xx++) {
      for (let yy = 0; yy < this._rows_num; yy++) {
        if ((xx + yy) % 2 == 0) continue;

        ctx.fillRect(xx * cell_scl, yy * cell_scl, cell_scl, cell_scl);
      }
    }
  }
}

class Grid {
  constructor(width, height, font, palette, xor128) {
    this._width = width;
    this._height = height;
    this._font = font;
    this._palette = palette;
    this._xor128 = xor128;

    this._root = new Cell(
      0,
      0,
      this._width,
      this._height,
      this._palette,
      this._xor128,
    );
    this._cells = [this._root];
  }

  generate() {
    this._root.split();
  }

  show(ctx) {
    ctx.save();
    this._root.show(ctx);
    ctx.restore();
  }
}

export { Grid };
