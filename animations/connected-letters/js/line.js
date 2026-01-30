class Line {
  constructor(cell_a, cell_b, color, height, xor128) {
    this._cell_a = cell_a;
    this._cell_b = cell_b;
    this._color = color.copy();
    this._height = height;
    this._xor128 = xor128;

    const y_factor = this._xor128.random(0.1, 0.3);
    const midY = (this._cell_a.y + this._cell_b.y) / 2;

    this._mx = (this._cell_a.x + this._cell_b.x) / 2;
    this._my = midY + y_factor * this._height;
  }

  show(ctx) {
    this._color.a = this._cell_a.a / 2;

    ctx.save();
    ctx.strokeStyle = this._color.rgba;
    ctx.beginPath();

    ctx.moveTo(this._cell_a.x, this._cell_a.y);
    ctx.quadraticCurveTo(this._mx, this._my, this._cell_b.x, this._cell_b.y);
    ctx.stroke();
    ctx.restore();
  }
}

export { Line };
