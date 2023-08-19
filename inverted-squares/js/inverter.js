class Inverter {
  constructor(width, height, size, xor128) {
    this._width = width;
    this._height = height;
    this._size = size;
    this._xor128 = xor128;

    this._steps = this._width / this._size;
  }

  update() {
    this._pos_x = this._xor128.random_int(0, this._steps);
    this._pos_y = this._xor128.random_int(0, this._steps);
  }

  show(ctx) {
    const x = this._pos_x * this._size;
    const y = this._pos_y * this._size;

    ctx.save();
    ctx.globalCompositeOperation = "difference";
    ctx.fillStyle = "rgba(255, 255, 255, 1)";

    ctx.translate(x, y);
    ctx.fillRect(0, 0, this._size, this._size);

    ctx.restore();
  }
}

export { Inverter };
