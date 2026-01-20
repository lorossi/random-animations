class Square {
  constructor(x, y, size, scl, phi, color) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._scl = scl;
    this._phi = phi;
    this._color = color;

    this._cx = 0;
    this._cy = 0;
    this._angle = 0;
  }

  update(t) {
    this._angle = Math.PI * 2 * t + this._phi;
    this._cx = ((Math.cos(this._angle) * this._size) / 2) * Math.SQRT2;
    this._cy = ((Math.sin(this._angle) * this._size) / 2) * Math.SQRT2;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl, this._scl);

    // create a clipping region
    ctx.beginPath();
    ctx.arc(
      this._cx,
      this._cy,
      this._size * 2,
      -this._angle,
      -this._angle - Math.PI,
    );
    ctx.clip("evenodd");

    // draw the square
    ctx.fillStyle = this._color.rgb;
    ctx.beginPath();
    ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

export { Square };
