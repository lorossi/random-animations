class Arc {
  constructor(inner_r, outer_r, start_angle, end_angle, fill_color) {
    this._inner_r = inner_r;
    this._outer_r = outer_r;
    this._start_angle = start_angle;
    this._end_angle = end_angle;
    this._fill_color = fill_color;

    this._d_start = 0;
    this._d_end = 0;
  }

  initDependencies(noise) {
    this._noise = noise;
  }

  update(tx, ty, seed) {
    const n1 = this._noise.noise(tx, ty, seed, 0);
    const n2 = this._noise.noise(tx, ty, 0, seed);

    this._d_start = this._rescale(n1, -1, 1, -0.9, 0.9) * Math.PI * 2;
    this._d_end = this._rescale(n2, -1, 1, -0.9, 0.9) * Math.PI * 2;
  }

  show(ctx) {
    ctx.save();
    ctx.fillStyle = this._fill_color.rgba;
    ctx.beginPath();
    ctx.arc(
      0,
      0,
      this._inner_r,
      this._start_angle + this._d_start,
      this._end_angle + this._d_end
    );
    ctx.arc(
      0,
      0,
      this._outer_r,
      this._end_angle + this._d_end,
      this._start_angle + this._d_start,
      true
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _rescale(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }
}

export { Arc };
