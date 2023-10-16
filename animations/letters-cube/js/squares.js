class Square {
  constructor(width, height, scl, duration, xor128) {
    this._width = width;
    this._height = height;
    this._scl = scl;
    this._duration = duration;
    this._xor128 = xor128;

    this._lifetime = this._duration / 5;
    this._offset = this._xor128.random_int(this._lifetime);

    this._generateXY();
  }

  _generateXY() {
    this._x = this._xor128.random_int(this._scl, this._width - this._scl);
    this._y = this._xor128.random_int(this._scl, this._height - this._scl);
  }

  update(frameCount) {
    // take account for offset
    if ((frameCount - this._offset) % this._lifetime == 0) this._generateXY();
  }

  show(ctx) {
    this._updated++;
    if (this._updated >= this._lifetime) this._generateXY();

    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.globalCompositeOperation = "difference";
    ctx.fillRect(0, 0, this._scl, this._scl);
    ctx.restore();
  }
}

export { Square };
