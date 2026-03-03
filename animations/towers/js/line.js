class Line {
  constructor(slot_width, points, color) {
    this._slot_width = slot_width;
    this._points = points;
    this._color = color;
  }

  show(ctx) {
    ctx.save();
    ctx.lineWidth = 5;

    ctx.strokeStyle = this._color.rgba;
    ctx.fillStyle = this._color.rgba;

    ctx.beginPath();
    this._points.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    this._points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, this._slot_width * 0.1, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.restore();
  }
}

export { Line };
