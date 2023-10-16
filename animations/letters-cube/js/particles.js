class Particle {
  constructor(width, height, scl, xor128) {
    this._width = width;
    this._height = height;
    this._scl = scl;
    this._xor128 = xor128;
  }

  update() {
    this._x = this._xor128.random_int(this._width);
    this._y = this._xor128.random_int(this._height);
  }

  show(ctx) {
    ctx.save();

    ctx.translate(this._x, this._y);
    ctx.fillStyle = "rgba(15, 15, 15, 0.25)";

    ctx.beginPath();
    ctx.arc(0, 0, this._scl / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
export { Particle };
