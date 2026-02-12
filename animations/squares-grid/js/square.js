class Square {
  constructor(x, y, size, stripes_num, stripes_color, noise_scl, noise) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._stripes_num = stripes_num;
    this._stripes_color = stripes_color;
    this._noise_scl = noise_scl;
    this._noise = noise;

    this._direction = 1;
  }

  update(tx, ty) {
    const n = this._noise.noise(
      tx,
      ty,
      this._x * this._noise_scl,
      this._y * this._noise_scl,
    );
    this._direction = n > 0 ? 1 : -1;
  }

  draw(ctx) {
    const stripes_size = (this._size / this._stripes_num) * Math.SQRT2;
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);

    // clip the square
    ctx.beginPath();
    ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
    ctx.clip();

    // rotate 45 degrees and scale the stripes
    ctx.rotate(Math.PI / 4);
    ctx.scale(this._direction, this._direction);

    // draw the stripes
    ctx.fillStyle = this._stripes_color;
    for (let i = -this._stripes_num; i < this._stripes_num; i++) {
      ctx.fillRect(
        i * stripes_size,
        -this._size,
        stripes_size / 2,
        this._size * 2,
      );
    }

    ctx.restore();
  }
}

export { Square };
