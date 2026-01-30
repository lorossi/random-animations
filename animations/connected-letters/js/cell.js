class Cell {
  constructor(x, y, size, letter_index, font, color) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._letter_index = letter_index;
    this._font = font;
    this._color = color.copy();

    this._letter = String.fromCharCode(this._letter_index);
  }

  show(ctx) {
    if (this._letter_index < 65 || this._letter_index > 90) return;

    ctx.save();
    ctx.translate(this._x, this._y);

    // Letter
    ctx.fillStyle = this._color.rgba;
    ctx.font = `${this._size}px ${this._font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this._letter, 0, 0.1 * this._size);

    ctx.restore();
  }

  update(t, current_letter) {
    if (this._letter === current_letter)
      this._color.a = this._trig_ease(this._remap(t, 0.1, 1));
    else this._color.a = 0.1;
  }

  _remap(v, min, max) {
    return (v - min) / (max - min);
  }

  _trig_ease(t) {
    return Math.sin(t * Math.PI);
  }

  get letter_index() {
    return this._letter_index;
  }

  get letter() {
    return this._letter;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get a() {
    return this._color.a;
  }
}

export { Cell };
