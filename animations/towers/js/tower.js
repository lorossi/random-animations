import { Point, Color, Utils } from "./lib.js";

class Tower {
  constructor(x, y, width, height, slots) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._slots = slots;

    this._slots_size = this._height / this._slots;
    this._fill_c = Color.fromCSS("lightblue");
    this.update([], 0);
  }

  update(values, t) {
    this._values = values;
    this._t = t;
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y - this._height);
    ctx.fillStyle = this._fill_c.rgba;

    for (let i = 0; i < this._slots; i++) {
      const a = Utils.ease_in_out_poly(
        1 - this._values.indexOf(i) / this._slots,
        4,
      );
      const c = this._fill_c.copy();
      c.a *= a;
      ctx.fillStyle = c.rgba;

      ctx.beginPath();
      ctx.rect(0, i * this._slots_size, this._width, this._slots_size);
      ctx.fill();
    }

    ctx.restore();
  }

  get_coords(slot) {
    const x = this._x + this._width / 2;
    const y = this._y - this._height + (slot + 0.5) * this._slots_size;
    return new Point(x, y);
  }

  get slot_height() {
    return this._slots_size;
  }
}

export { Tower };
