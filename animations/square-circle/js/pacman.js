class Pacman {
  constructor(x, y, r, direction, phi, color) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._direction = direction;
    this._color = color;

    this._phases = 4;
    this._t = 0;
    this._phi = phi;
    this._angle = phi;
  }

  update(t) {
    // divide the time into 4 phases
    const [phase, remainder] = this._splitInPhases(t, this._phases);

    this._t = this._easeInOutPoly(remainder, 4);
    this._angle =
      this._phi + ((this._direction * Math.PI) / 2) * (this._t + phase);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.rotate(this._angle);
    ctx.fillStyle = this._color.rgba;

    ctx.beginPath();
    ctx.arc(0, 0, this._r, 0, (3 / 2) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  _easeInOutPoly(x, n) {
    if (x < 0.5) return 0.5 * (2 * x) ** n;
    return 1 - 0.5 * (2 * (1 - x)) ** n;
  }

  _splitInPhases(t, n) {
    const phase = Math.floor(t * n);
    const remainder = t * n - phase;
    return [phase, remainder];
  }
}

export { Pacman };
