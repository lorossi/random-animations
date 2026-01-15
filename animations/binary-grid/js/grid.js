class MemoizedEase {
  constructor() {
    this._cache = new Map();
  }

  reset() {
    this._cache.clear();
  }

  easeInOutPoly(t) {
    if (this._cache.has(t)) {
      return this._cache.get(t);
    }

    let result;
    const n = 3;
    if (t < 0.5) result = 0.5 * Math.pow(2 * t, n);
    else result = 1 - 0.5 * Math.pow(2 * (1 - t), n);

    this._cache.set(t, result);
    return result;
  }
}

const memoized_ease = new MemoizedEase();

const wrap = (x, min, max) => {
  while (x < min) x += max - min;
  while (x >= max) x -= max - min;
  return x;
};

class Cell {
  constructor(
    x,
    y,
    size,
    scl,
    slots,
    min,
    max,
    step = 1,
    value = 0,
    queue = 0,
    overflown = 0
  ) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._scl = scl;
    this._slots = slots;
    this._min = min;
    this._max = max;
    this._step = step;
    this._value = value;
    this._queue = queue;
    this._overflown = overflown;

    this._slot_size = this._size / this._slots;
  }

  copy() {
    return new Cell(
      this._x,
      this._y,
      this._size,
      this._scl,
      this._slots,
      this._min,
      this._max,
      this._step,
      this._value,
      this._queue,
      this._overflown
    );
  }

  tick() {
    this._value += this._step;
    this._value += this._queue;
    this._queue = 0;

    if (this._value >= this._max) {
      this._value = wrap(this._value, this._min, this._max);
      this._overflown = 1;
    } else if (this._value < this._min) {
      this._value = wrap(this._value, this._min, this._max);
      this._overflown = -1;
    } else {
      this._overflown = 0;
    }
  }

  show(ctx, palette) {
    const t = this._value / this._max;
    const smooth_t = memoized_ease.easeInOutPoly(t);
    const color = palette.getSmoothColor(smooth_t);

    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl[0], this._scl[1]);
    ctx.translate(-this._size / 2, -this._size / 2);
    ctx.fillStyle = color.rgba;

    for (let i = 0; i < this._slots ** 2; i++) {
      const col = i % this._slots;
      const row = Math.floor(i / this._slots);
      const bit = (Math.floor(this._value) >> i) & 1;
      if (bit === 1) {
        ctx.fillRect(
          col * this._slot_size,
          row * this._slot_size,
          this._slot_size,
          this._slot_size
        );
      }
    }

    ctx.restore();
  }

  get value() {
    return this._value;
  }

  get overflown() {
    return this._overflown;
  }

  increaseQueue(amount) {
    this._queue += amount;
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

class Grid {
  constructor(size, cell_scl, palette, xor128) {
    this._size = size;
    this._cell_scl = cell_scl;
    this._palette = palette;
    this._xor128 = xor128;

    this._slots = this._xor128.random_int(15, 35);
    this._grid_slots = 3;
    memoized_ease.reset();

    const cell_size = Math.ceil(this._size / this._slots);
    const max_value = 2 ** (this._grid_slots ** 2) - 1;

    this._cells = new Array(this._slots ** 2).fill(0).map((_, i) => {
      const x = (i % this._slots) * cell_size;
      const y = Math.floor(i / this._slots) * cell_size;
      const scl = new Array(2)
        .fill(this._cell_scl)
        .map((s) => s * this._xor128.pick([-1, 1]));
      const min = this._xor128.random_int(0, max_value / 2);
      const max = this._xor128.random_int(min + 2, max_value);
      const step = this._xor128.random(0.1, 0.2) * this._xor128.pick([-1, 1]);
      const value = this._xor128.random_int(min, max);
      return new Cell(
        x,
        y,
        cell_size,
        scl,
        this._grid_slots,
        min,
        max,
        step,
        value
      );
    });
  }

  _getNeighborsIndices(index) {
    const neighbors = [];
    const row = Math.floor(index / this._slots);
    const col = index % this._slots;

    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const xx = wrap(col + dx, 0, this._slots);
        const yy = wrap(row + dy, 0, this._slots);
        if (xx === col && yy === row) continue;

        const neighbor_index = yy * this._slots + xx;

        neighbors.push(neighbor_index);
      }
    }

    return neighbors;
  }

  update() {
    this._cells.forEach((cell) => cell.tick());

    const new_cells = this._cells.map((cell) => cell.copy());
    this._cells.forEach((cell, index) => {
      const neighbors = this._getNeighborsIndices(index);
      if (cell.overflown !== 0) {
        neighbors.forEach((neighbor_index) => {
          new_cells[neighbor_index].increaseQueue(cell.overflown);
        });
      }
    });

    this._cells = new_cells;
  }

  show(ctx) {
    const cell_size = this._size / this._slots;
    ctx.save();
    this._cells.forEach((cell) => {
      cell.show(ctx, this._palette);
    });
    ctx.restore();
  }
}

export { Grid };
