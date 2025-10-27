class Spinner {
  constructor(x, y, radius, fg) {
    this._x = x;
    this._y = y;
    this._radius = radius;
    this._fg = fg;

    this._angle = 0;
    this._length = Math.PI;
  }

  update() {
    this._angle += Math.PI / 60;
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.rotate(this._angle);

    ctx.beginPath();
    ctx.arc(0, 0, this._radius, 0, this._length);
    ctx.strokeStyle = this._fg.rgba;
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.restore();
  }
}

export { Spinner };
