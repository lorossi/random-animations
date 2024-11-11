class Square {
  constructor(x, y, size, stripe_scl, stripe_colors) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._stripe_scl = stripe_scl;
    this._stripe_colors = stripe_colors;
  }

  show(ctx) {
    const stripes_num = this._size / this._stripe_scl;

    ctx.save();

    for (let i = 0; i < stripes_num; i++) {
      ctx.fillStyle = this._stripe_colors[i % 2].rgba;
      ctx.strokeStyle = this._stripe_colors[i % 2].rgba;

      const d_pos = (this._stripe_scl * i) / 2;
      this._drawRect(ctx, d_pos);
    }

    ctx.restore();
  }

  _drawRect(ctx, d_pos) {
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.beginPath();
    ctx.rect(d_pos, d_pos, this._size - 2 * d_pos, this._size - 2 * d_pos);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

export { Square };
