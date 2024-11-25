class Circle {
  constructor(radius, color, phi) {
    this._radius = radius;
    this._color = color;
    this._phi = phi;

    this._size = 0;
  }

  update(t) {
    const theta = this._wrapTheta(t * Math.PI * 2 + this._phi);
    const s = Math.abs(Math.cos(theta)) * 0.5 + 0.5;
    this._size = s * this._radius;
  }

  show(ctx) {
    ctx.save();
    ctx.fillStyle = this._color;

    ctx.beginPath();
    ctx.arc(0, 0, this._size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _wrapTheta(t) {
    while (t < 0) t += Math.PI * 2;
    while (t > Math.PI * 2) t -= Math.PI * 2;

    return t;
  }

  _easeInOutPoly(x, n = 2) {
    return x < 0.5
      ? 0.5 * Math.pow(2 * x, n)
      : 1 - 0.5 * Math.pow(2 * (1 - x), n);
  }
}

export { Circle };
