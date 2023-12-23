class Cell {
  constructor(x, y, size, show_bias) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._show_bias = show_bias;
  }

  setAttributes(fg) {
    this._fg = fg;
  }

  injectDependencies(xor128) {
    this._xor128 = xor128;
  }

  update() {
    this._rotation = (this._xor128.random_int(0, 4) * Math.PI) / 2;
    this._draw = this._xor128.random() < this._show_bias;
  }

  show(ctx) {
    if (!this._draw) return;

    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.rotate(this._rotation);

    ctx.translate(-this._size / 2, -this._size / 2);

    ctx.fillStyle = this._fg.rgba;
    ctx.strokeStyle = this._fg.rgba;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this._size, this._size);
    ctx.lineTo(0, this._size);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  get draw() {
    return this._draw;
  }

  set draw(value) {
    this._draw = value;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get size() {
    return this._size;
  }
}

export { Cell };
