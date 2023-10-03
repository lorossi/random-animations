class Sine {
  constructor(width, height, xor128) {
    this._width = width;
    this._height = height;
    this._xor128 = xor128;

    this._scl = 2;
    this._noise_scl = 10;
    this._rotation = this._xor128.random_interval(0, Math.PI / 180);

    const widths = Math.floor(
      (this._height / this._scl) * 2 * this._xor128.random(0.4, 1)
    );
    this._widths = new Array(Math.floor(widths))
      .fill(0)
      .map(() => this._xor128.random(this._width));
  }

  draw(ctx, t) {
    ctx.save();
    ctx.strokeStyle = "rgb(240, 240, 240)";
    ctx.lineWidth = this._scl;

    const current_w = Math.min(
      Math.floor(t * this._widths.length),
      this._widths.length
    );
    const current_y = (current_w * this._scl) / 2;

    const w = this._widths[current_w];
    ctx.beginPath();
    ctx.moveTo(-w / 2, current_y);
    ctx.lineTo(w / 2, current_y);
    ctx.stroke();
    ctx.restore();
  }

  get nodes_num() {
    return this._widths.length;
  }

  get rotation() {
    return this._rotation;
  }
}

export { Sine };
