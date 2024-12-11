import { XOR128 } from "./xor128.js";
import { Color } from "./engine.js";

class Grid {
  constructor(size, min_cell_size, seed) {
    this._size = size;
    this._min_cell_size = min_cell_size;
    this._seed = seed;

    this.xor128 = new XOR128(seed);
    this._cells = [new Cell(0, 0, size, size, seed)];

    for (let i = 0; i < 10; i++) this.split((i + 1) * 1000);
  }

  split() {
    const new_cells = [];

    this._cells.forEach((cell) => {
      if (cell._w < this._min_cell_size || cell._h < this._min_cell_size)
        new_cells.push(cell);
      else new_cells.push(...cell.split());
    });

    this._cells = new_cells;
  }

  show(ctx) {
    ctx.save();
    this._cells.forEach((cell) => cell.draw(ctx));
    ctx.restore();
  }

  setCells(cells) {
    this._cells = cells;
  }

  copy() {
    const grid = new Grid(this._x, this._y, this._size, this._seed);
    grid.setCells(this._cells.map((cell) => cell.copy()));

    return grid;
  }

  getCells() {
    return this._cells;
  }

  getSize() {
    return this._size;
  }

  getSeed() {
    return this._seed;
  }

  setPalette(palette) {
    this._cells.forEach((cell) =>
      cell.setFill(palette.getRandomColor(this.xor128))
    );
  }
}

class CircleGrid extends Grid {
  constructor(size, min_cell_size, seed) {
    super(size, min_cell_size, seed);

    this._r = this.xor128.random_interval(0.25, 0.1) * this._size;
    this._x = this.xor128.random_interval(0.5, 0.1) * this._size;
    this._y = this.xor128.random_interval(0.5, 0.1) * this._size;

    // filter cells outside the circle
    const container_cell = new Cell(
      this._x - this._r,
      this._y - this._r,
      2 * this._r,
      2 * this._r,
      seed
    );
    this._cells = this._cells.filter((cell) => container_cell.intersects(cell));
  }

  show(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
    ctx.clip();

    this._cells.forEach((cell) => cell.draw(ctx));

    ctx.restore();
  }
}

class Cell {
  constructor(x, y, w, h, seed) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
    this._seed = seed;

    this._xor128 = new XOR128(seed);
    this._fill_c = Color.fromMonochrome(this._xor128.random(255), 1);
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this._fill_c.rgba;
    ctx.strokeStyle = this._fill_c.rgb;

    ctx.beginPath();
    ctx.rect(this._x, this._y, this._w, this._h);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  splitHorizontal(i) {
    const split = this._xor128.random_interval(0.5, 0.25);
    const w1 = this._w * split;
    const w2 = this._w - w1;

    return [
      new Cell(this._x, this._y, w1, this._h, this._seed + 1000 + i),
      new Cell(this._x + w1, this._y, w2, this._h, this._seed + 2000 + i),
    ];
  }

  splitVertical(i) {
    const split = this._xor128.random_interval(0.5, 0.25);
    const h1 = this._h * split;
    const h2 = this._h - h1;

    return [
      new Cell(this._x, this._y, this._w, h1, this._seed + 1000 + i),
      new Cell(this._x, this._y + h1, this._w, h2, this._seed + 2000 + i),
    ];
  }

  split(i = 0) {
    if (this._xor128.random_bool()) return this.splitHorizontal(i);
    return this.splitVertical(i);
  }

  copy() {
    return new Cell(this._x, this._y, this._w, this._h, this._seed);
  }

  getFill() {
    return this._fill_c;
  }

  setFill(color) {
    this._fill_c = color.copy();
  }

  intersects(other) {
    return (
      this._x < other.x + other.w &&
      this._x + this._w > other.x &&
      this._y < other.y + other.h &&
      this._y + this._h > other.y
    );
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

export { Grid, CircleGrid };
