class Particle {
  constructor(x, y, size) {
    this._x = x;
    this._y = y;

    this._phi = Math.atan2(this._y, this._x);

    this._size = size;

    this._a = 0;
  }

  update(t) {
    this._t = t;
    this._t_smooth = Math.cos(t * Math.PI - this._phi) ** 2;
    this._a = this._t_smooth * Math.PI;
  }

  show(ctx) {
    const scl = this._rescale(this._t_smooth, 0, 1, 0.75, 1);

    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.rotate(this._a);
    ctx.scale(scl, scl);

    ctx.strokeStyle = "rgb(15, 15, 15)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-this._size / 2, 0);
    ctx.lineTo(this._size / 2, 0);

    ctx.stroke();

    ctx.restore();
  }

  _rescale(x, oldMin, oldMax, newMin = 0, newMax = 1) {
    return ((x - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
  }
}

export { Particle };
