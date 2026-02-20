class ErrorScreen {
  constructor(canvas_size, xor128, duration) {
    this._canvas_size = canvas_size;
    this._xor128 = xor128;
    this._duration = duration;

    this._img = new Image();
    this._img.src = "./assets/error.png";
    this._error_loaded = false;
    this._img.addEventListener("load", () => (this._error_loaded = true));

    this._reset();
  }

  _reset() {
    this._offset = this._xor128.random(-1, 1) * this._duration;
    this._w = this._xor128.random_int(
      this._canvas_size.x * 0.1,
      this._canvas_size.x * 0.3,
    );
    this._scl = this._img.width / this._w;
    this._h = this._img.height / this._scl;
    this._x = this._xor128.random_int(0, this._canvas_size.x - this._w);
    this._y = this._xor128.random_int(0, this._canvas_size.y - this._h);
    this._t = 0;
  }

  update() {
    this._t += 1;
    if (this._t >= this._offset + this._duration) {
      this._offset = 0;
      this._reset();
    }
  }

  draw(ctx) {
    if (!this._error_loaded) return;
    if (this._t < 0) return;

    ctx.save();
    ctx.translate(this._x + this._w / 2, this._y + this._h / 2);
    ctx.drawImage(this._img, -this._w / 2, -this._h / 2, this._w, this._h);
    ctx.restore();
  }
}

export { ErrorScreen };
