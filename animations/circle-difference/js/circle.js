class Circle {
  constructor(x, y, r, xor128) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._xor128 = xor128;

    this._circles_num = this._xor128.random_int(2, 5);
    this._inner_r = this._generateR();

    do {
      this._coefficients = this._generateCoefficients();
    } while (new Set(this._coefficients).size != this._coefficients.length);
  }

  _generateR() {
    return new Array(this._circles_num)
      .fill()
      .map(() => this._xor128.random(this._r));
  }

  _generateCoefficients() {
    return new Array(this._circles_num)
      .fill()
      .map(() => this._xor128.random_int(3, 10));
  }

  draw(t, ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.beginPath();

    for (let i = 0; i < this._circles_num; i++) {
      const r = this._inner_r[i];
      const a = this._coefficients[i] * t * Math.PI * 2;
      const x = r * Math.cos(a);
      const y = r * Math.sin(a);

      if (i == 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.restore();
  }
}

export { Circle };
