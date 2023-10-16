class Arc {
  constructor(inner_r, outer_r, start_angle, end_angle, fill_color) {
    this._inner_r = inner_r;
    this._outer_r = outer_r;
    this._start_angle = start_angle;
    this._end_angle = end_angle;
    this._fill_color = fill_color;
  }

  show(ctx) {
    ctx.beginPath();
    ctx.arc(0, 0, this._inner_r, this._start_angle, this._end_angle);
    ctx.arc(0, 0, this._outer_r, this._end_angle, this._start_angle, true);
    ctx.closePath();
    ctx.fillStyle = this._fill_color.rgba;
    ctx.fill();
  }
}

export { Arc };
