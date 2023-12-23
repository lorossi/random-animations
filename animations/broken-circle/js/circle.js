class Circle {
  constructor(x, y, scl) {
    this._x = x;
    this._y = y;
    this._scl = scl;
    this._rays = 100;
  }

  initDependencies(xor128) {
    this._xor128 = xor128;

    this._direction = this._xor128.random_bool() ? -1 : 1;
    this._offset = this._xor128.random(Math.PI * 2);
  }

  draw(ctx, t) {
    const theta = t * Math.PI * 2;
    const r = this._scl * 0.1;
    const dx = Math.cos(theta) * r;
    const dy = Math.sin(theta) * r;

    ctx.save();
    ctx.translate(this._x + dx, this._y + dy);
    for (let i = 0; i < this._rays; i++) {
      const tt = ((i / this._rays + t) % 1) * this._direction + this._offset;
      const angle = tt * Math.PI * 2;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this._scl / 2, 0);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}

export { Circle };
