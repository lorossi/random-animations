class HalfCircle {
  constructor(x, y, r, inner_r, theta_1, theta_2, fg_color, lines = 5) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._theta_1 = theta_1;
    this._theta_2 = theta_2;
    this._inner_r = inner_r;
    this._color = fg_color;
    this._lines = lines;
  }

  update() {}

  show(ctx) {
    ctx.save();
    ctx.fillStyle = this._color.rgba;

    for (let i = 0; i < this._lines; i++) {
      const slice_width = (this._r - this._inner_r) / (this._lines * 2);
      const r = this._inner_r + slice_width * (2 * i + 2);
      const inner_r = r - slice_width;

      ctx.beginPath();
      ctx.arc(this._x, this._y, r, this._theta_1, this._theta_2, false);
      ctx.arc(this._x, this._y, inner_r, this._theta_2, this._theta_1, true);
      ctx.fill();
    }
    ctx.restore();
  }
}

export { HalfCircle };
