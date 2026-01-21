class Sines {
  constructor(
    x,
    width,
    height,
    phi,
    omega,
    vertical_omega,
    segments,
    color,
    shade,
  ) {
    this._x = x;
    this._width = width;
    this._height = height;
    this._phi = phi;
    this._omega = omega;
    this._vertical_omega = vertical_omega;
    this._segments = segments;
    this._color = color;
    this._shade = shade;

    this._border = 0.85;
    this._t = 0;
    this._h = 12;
  }

  _drawLine(ctx, w) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, 0);
    ctx.stroke();
    ctx.restore();
  }

  show(ctx, t) {
    ctx.save();

    for (let i = 0; i < this._segments; i++) {
      const theta = -this._omega * t * Math.PI * 2 + this._phi;
      const gamma = (i / this._segments) * Math.PI * 2 * this._vertical_omega;
      const dy = (this._height / this._segments) * (i + 0.5);

      const w = Math.cos(theta + gamma) * this._width * this._border;

      ctx.save();

      ctx.translate(this._x, dy);
      ctx.lineCap = "round";
      // draw the shade
      ctx.save();
      const shade_dist = this._h / 2;
      const shade_gamma = (Math.PI * i) / this._segments;
      const shade_d = -shade_dist * Math.cos(shade_gamma);
      ctx.lineWidth = this._h;
      ctx.translate(shade_d, shade_d);
      ctx.strokeStyle = this._shade;
      this._drawLine(ctx, w);
      ctx.restore();

      // draw the line
      ctx.save();
      ctx.lineWidth = this._h;
      ctx.strokeStyle = this._color;
      this._drawLine(ctx, w);
      ctx.restore();

      ctx.restore();
    }

    ctx.restore();
  }
}

export { Sines };
