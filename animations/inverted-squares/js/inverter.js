class Inverter {
  constructor(width, height, size, xor128) {
    this._width = width;
    this._height = height;
    this._size = size;
    this._xor128 = xor128;

    this._steps = this._width / this._size;

    this._pos_x = this._xor128.random_int(this._steps);
    this._pos_y = this._xor128.random_int(this._steps);

    const on_off = this._xor128.random_int(5, 10) * 2;
    this._on_off_interval = Array(on_off)
      .fill()
      .map(() => this._xor128.random(1))
      .sort();

    this._current_state = this._xor128.random_bool();
    this._states_count = 0;
  }

  update(t) {
    if (t < this._on_off_interval[this._states_count]) return;
    if (this._states_count == 0 && this._on_off_interval.every((i) => t > i))
      return;

    this._current_state = !this._current_state;
    this._states_count =
      (this._states_count + 1) % this._on_off_interval.length;
  }

  show(ctx) {
    const x = this._pos_x * this._size;
    const y = this._pos_y * this._size;

    ctx.save();
    ctx.globalCompositeOperation = "difference";

    if (this._current_state) ctx.fillStyle = "rgba(255, 255, 255, 1)";
    else ctx.fillStyle = "rgba(255, 255, 255, 0)";

    ctx.translate(x, y);
    ctx.fillRect(0, 0, this._size, this._size);

    ctx.restore();
  }
}

export { Inverter };
