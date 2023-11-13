class Circle {
  constructor(x, y, r, xor128) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._xor128 = xor128;

    this._circles_num = this._xor128.random_int(2, 8);
    this._inner_r = this._generateR();
    this._coefficients = this._generateCoefficients();
  }
  _generateR() {
    let r = Array(this._circles_num)
      .fill()
      .map(() => this._xor128.random());
    const m = Math.min(...r);
    const M = Math.max(...r);
    const rr = this._r / (this._circles_num + 1);
    return r.map((v) => ((v - m) / (M - m)) * (this._r - rr) + rr);
  }

  _generateCoefficients() {
    return Array(this._circles_num)
      .fill()
      .map(() => this._xor128.random_int(1, 12));
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
