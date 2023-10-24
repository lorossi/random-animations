class Rectangle {
  constructor(x, y, w, h, xor128, noise, bias = 0.25) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
    this._xor128 = xor128;
    this._noise = noise;
    this._bias = bias;

    this._min_size = 15;
    this._noise_scl = 0.005;
    this._ch =
      (this._noise.noise(x * this._noise_scl, y * this._noise_scl) + 1) * 127.5;
    this._can_split = true;
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.fillStyle = `rgb(${this._ch}, ${this._ch}, ${this._ch})`;
    ctx.fillRect(0, 0, this._w, this._h);
    ctx.restore();
  }

  split() {
    const r = this._xor128.random_interval(0.5, 0.25); // split ratio

    if (this._xor128.random() < this._bias) return this._splitVertical(r);
    return this._splitHorizontal(r);
  }

  _splitVertical(r) {
    if (!this._can_split) return [this];
    this._can_split = false;
    if (this._w * r < this._min_size) return [this];

    const new_x = this._x + this._w * r;
    const new_w = this._w * (1 - r);
    return [
      new Rectangle(
        new_x,
        this._y,
        new_w,
        this._h,
        this._xor128,
        this._noise,
        this._bias
      ),
      new Rectangle(
        this._x,
        this._y,
        this._w * r,
        this._h,
        this._xor128,
        this._noise,
        this._bias
      ),
    ];
  }

  _splitHorizontal(r) {
    if (this._h * r < this._min_size) return [this];

    const new_y = this._y + this._h * r;
    const new_h = this._h * (1 - r);

    return [
      new Rectangle(
        this._x,
        new_y,
        this._w,
        new_h,
        this._xor128,
        this._noise,
        this._bias
      ),
      new Rectangle(
        this._x,
        this._y,
        this._w,
        this._h * r,
        this._xor128,
        this._noise,
        this._bias
      ),
    ];
  }

  get ended() {
    return !this._can_split;
  }
}

export { Rectangle };
