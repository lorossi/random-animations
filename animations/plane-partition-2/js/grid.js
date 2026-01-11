import { Point } from "./lib.js";

class Rect {
  constructor(x, y, w, h) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
  }

  copy() {
    return new Rect(this._x, this._y, this._w, this._h);
  }

  splitVertical(r) {
    const new_x = this._x + this._w * r;
    const new_w = this._w * (1 - r);

    return [
      new Rect(new_x, this._y, new_w, this._h),
      new Rect(this._x, this._y, this._w * r, this._h),
    ];
  }

  splitHorizontal(r) {
    const new_y = this._y + this._h * r;
    const new_h = this._h * (1 - r);

    return [
      new Rect(this._x, new_y, this._w, new_h),
      new Rect(this._x, this._y, this._w, this._h * r),
    ];
  }

  get center() {
    return new Point(this._x + this._w / 2, this._y + this._h / 2);
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get w() {
    return this._w;
  }

  get h() {
    return this._h;
  }
}

class Cell {
  constructor(rect, params) {
    this._rect = rect;
    this._params = params;

    const n = this._params.noise.noise(
      this._rect.x * this._params.noise_scl,
      this._rect.y * this._params.noise_scl
    );
    const ch = (n + 1) / 2;
    this._fill_color = this._params.palette.getSmoothColor(
      ch,
      this._easeInOutPoly
    );

    this._can_split =
      Math.min(this._rect.w, this._rect.h) > this._params.min_size;
  }

  _easeInOutPoly(x, n = 7) {
    if (x < 0.5) return 0.5 * Math.pow(2 * x, n);
    else return 1 - 0.5 * Math.pow(2 * (1 - x), n);
  }

  show(ctx) {
    ctx.save();
    ctx.fillStyle = this._fill_color.rgba;
    ctx.strokeStyle = this._fill_color.rgba;
    ctx.translate(this._rect.x, this._rect.y);
    ctx.beginPath();
    ctx.rect(0, 0, this._rect.w, this._rect.h);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  split() {
    if (!this._can_split) return [this];
    this._can_split = false;

    const r = this._params.xor128.random();
    const new_rects =
      r < this._params.bias
        ? this._rect.splitVertical(r)
        : this._rect.splitHorizontal(r);

    return [
      new Cell(new_rects[0], this._params),
      new Cell(new_rects[1], this._params),
    ];
  }

  get ended() {
    return !this._can_split;
  }

  get area() {
    return Math.min(this._rect.w, this._rect.h);
  }
}

class Grid {
  constructor(rect, params) {
    this._rect = rect;
    this._params = params;
    this._cells = [new Cell(this._rect.copy(), this._params)];
    this._ended = false;
    this._rotation = this._params.xor128.random_int(4) * (Math.PI / 2);
  }

  update() {
    if (!this._ended) {
      const old_length = this._cells.length;
      // split the top n cells
      let split = 0;
      let new_cells = [];
      while (this._cells.length > 0) {
        const cell = this._cells.shift();

        let current_split;
        if (split < this._params.splits_per_frame) current_split = cell.split();
        else current_split = [cell];

        new_cells = new_cells.concat(current_split);

        if (current_split.length > 1) split++;
      }
      const new_length = this._cells.length;
      this._ended = old_length == new_length;
      this._cells = new_cells;
    }

    // shuffle
    this._cells = this._cells
      .map((cell) => ({ cell: cell, order: this._params.xor128.random() }))
      .sort((a, b) => a.order - b.order)
      .map((obj) => obj.cell);
  }

  show(ctx) {
    ctx.save();
    this._cells.forEach((cell) => cell.show(ctx));
    ctx.restore();
  }

  get ended() {
    return this._ended;
  }
}

export { Rect, Grid };
