class Circle {
  constructor(x, y, size, scl, upper_color, lower_color) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._scl = scl;
    this._upper_color = upper_color;
    this._lower_color = lower_color;
    this._phi = 0;
  }

  update(center, max_dist) {
    const dist =
      Math.hypot(
        this._x * this._size + this._size / 2 - center.x,
        this._y * this._size + this._size / 2 - center.y,
      ) / max_dist;
    this._phi = 2 * Math.PI * dist + Math.PI;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(
      this._x * this._size + this._size / 2,
      this._y * this._size + this._size / 2,
    );
    ctx.scale(this._scl, this._scl);
    ctx.rotate(this._phi);

    // upper circle
    ctx.fillStyle = this._upper_color.rgb;
    ctx.beginPath();
    ctx.arc(0, 0, this._size / 2, Math.PI, 2 * Math.PI);
    ctx.fill();

    // lower circle
    ctx.fillStyle = this._lower_color.rgb;
    ctx.beginPath();
    ctx.arc(0, 0, this._size / 2, 0, Math.PI);
    ctx.fill();

    ctx.restore();
  }
}

export { Circle };
