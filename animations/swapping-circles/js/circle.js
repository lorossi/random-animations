class Circle {
  constructor(pos, radius, scl, color) {
    this._pos = pos.copy();
    this._radius = radius;
    this._scl = scl;
    this._color = color.copy();

    this._start_pos = pos.copy();
    this._dest_pos = pos.copy();
  }

  setDestination(pos) {
    this._dest_pos = pos.copy();
  }

  resetDestination() {
    this._pos = this._dest_pos.copy();
  }

  update(t) {
    this._pos = this._start_pos.copy().lerp(this._dest_pos, t);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(
      this._pos.x * this._radius * 2 + this._radius,
      this._pos.y * this._radius * 2 + this._radius
    );
    ctx.scale(this._scl, this._scl);

    ctx.fillStyle = this._color.rgba;

    ctx.beginPath();
    ctx.arc(0, 0, this._radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  get pos_array() {
    return [this._pos.x, this._pos.y];
  }
}

export { Circle };
