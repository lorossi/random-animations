class Particle {
  constructor(width, height, scl, xor128) {
    this._width = width;
    this._height = height;
    this._scl = scl;
    this._xor128 = xor128;
  }

  show(ctx) {
    const x = this._xor128.random(this._width);
    const y = this._xor128.random(this._height);

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(0, 0, 0, 0.025)";
    ctx.beginPath();
    ctx.arc(0, 0, this._scl / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export { Particle };
