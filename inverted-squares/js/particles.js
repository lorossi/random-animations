class Particle {
  constructor(width, height, scl, xor128) {
    this._width = width;
    this._height = height;
    this._scl = scl;
    this._xor128 = xor128;
  }

  show(ctx) {
    // generate a random integer that is multiple of scl
    const x = this._xor128.random_int(this._width / this._scl) * this._scl;
    const y = this._xor128.random_int(this._height / this._scl) * this._scl;

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
    ctx.fillRect(0, 0, this._scl, this._scl);
    ctx.restore();
  }
}

export { Particle };
