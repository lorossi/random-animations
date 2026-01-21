class Tile {
  constructor(x, y, size, fg, noise, scale = 0.9, noise_scl = 0.1) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._fg = fg;
    this._noise = noise;
    this._scale = scale;
    this._noise_scl = noise_scl;

    this._draw = this._selectDrawFunction();
  }

  _selectDrawFunction() {
    const functions = [
      this._empty,
      this._drawCircle,
      this._drawSemiCircle,
      this._drawTwoCircles,
      this._drawTwoSemiCircles,
    ];
    const n = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
    );
    const index = Math.floor(((n + 1) / 2) * functions.length);
    return functions[index];
  }

  _empty() {}

  _drawCircle(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, this._size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawSemiCircle(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, this._size / 2, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.restore();
  }

  _drawTwoCircles(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, -this._size / 6, this._size / 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, this._size / 6, this._size / 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawTwoSemiCircles(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(-this._size / 6, 0, this._size / 4, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this._size / 6, 0, this._size / 4, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    ctx.restore();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scale, this._scale);
    ctx.fillStyle = this._fg.rgba;

    this._draw(ctx);

    ctx.restore();
  }
}

export { Tile };
