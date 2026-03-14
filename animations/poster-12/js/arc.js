class Arc {
  constructor(radius, width, height, fill, stroke) {
    this._radius = radius;
    this._width = width;
    this._height = height;
    this._fill = fill;
    this._stroke = stroke;

    this._line_width = 4;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this._fill.rgba;
    ctx.strokeStyle = this._stroke.rgba;
    ctx.lineWidth = this._line_width;

    ctx.beginPath();
    ctx.arc(0, 0, this._radius, 0, Math.PI);
    ctx.arc(0, 0, this._radius - this._width, Math.PI, 0, true);
    ctx.rect(-this._radius, 0, this._width, -this._height);
    ctx.rect(this._radius, 0, -this._width, -this._height);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

export { Arc };
