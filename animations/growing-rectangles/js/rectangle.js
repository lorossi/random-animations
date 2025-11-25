class Rectangle {
  constructor(size, delay, phi, radius, color) {
    this._size = size;
    this._delay = delay;
    this._phi = phi;
    this._radius = radius;
    this._color = color;

    this._t = 0;
  }

  update(t) {
    this._t = t;
    this._tt = (t + this._delay) % 1;
  }

  draw(ctx) {
    const t = this._t;
    const tt = (this._t + this._delay) % 1;

    const size = this._size * tt;

    const a1 = t * Math.PI * 2 + this._phi;
    const r1 = this._radius * tt;
    const dx1 = Math.cos(a1) * r1;
    const dy1 = Math.sin(a1) * r1;

    const a2 = tt * Math.PI * 2 + this._phi;
    const r2 = this._radius * tt;
    const dx2 = Math.cos(a2) * r2;
    const dy2 = Math.sin(a2) * r2;

    ctx.save();
    ctx.fillStyle = this._color;
    ctx.translate(dx1 + dx2, dy1 + dy2);
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  get t() {
    return this._tt;
  }

  get delay() {
    return this._delay;
  }

  easeInExp(t, n) {
    if (t == 0) return 0;
    return Math.pow(2, n * (t - 1));
  }
}

export { Rectangle };
