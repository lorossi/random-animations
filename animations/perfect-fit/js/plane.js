class Plane {
  constructor(
    canvas_width,
    canvas_height,
    height,
    slots_num,
    index,
    planes_num,
    color
  ) {
    this._canvas_width = canvas_width;
    this._canvas_height = canvas_height;
    this._height = height;
    this._slots_num = slots_num;
    this._index = index;
    this._planes_num = planes_num;
    this._color = color;

    this._y = 0;

    this._noises = new Array(this._slots_num).fill(0);
    this._phi = (index / planes_num) * Math.PI * 2;

    this._lower_bound = index / planes_num;
    this._upper_bound = (index + 1) / planes_num;
    this._slot_width = this._canvas_width / this._slots_num;
  }

  update(t, noises) {
    const theta = t * Math.PI * 2;

    this._y = Math.floor(
      this._canvas_height / 2 +
        Math.cos(theta + this._phi) *
          (this._canvas_height / 2 - this._height / 2)
    );

    this._noises = noises.slice();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(0, this._y);

    ctx.fillStyle = this._color.rgba;

    this._noises.forEach((n, i) => {
      if (n >= this._lower_bound && n < this._upper_bound) {
        const x = i * this._slot_width;
        ctx.fillRect(x, -this._height / 2, this._slot_width, this._height);
      }
    });

    ctx.restore();
  }
}

export { Plane };
