class Raindrop {
  constructor(x, y, width, height, color) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._color = color;
  }

  show(ctx) {
    ctx.save();
    ctx.fillStyle = this._color.rgba;

    ctx.translate(this._x, this._y);

    ctx.beginPath();
    ctx.moveTo(this._width / 2, 0); // Precise top center

    ctx.bezierCurveTo(
      this._width / 2,
      this._height * 0.3, // Control point 1
      this._width * 0.95,
      this._height * 0.95, // Control point 2 (wider + rounder bottom)
      this._width / 2,
      this._height, // End point (bottom center)
    );

    ctx.bezierCurveTo(
      this._width * 0.05,
      this._height * 0.95, // Mirrored control point 1 (wider + rounder bottom)
      this._width / 2,
      this._height * 0.3, // Mirrored control point 2
      this._width / 2,
      0, // End point (top center)
    );

    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export { Raindrop };
