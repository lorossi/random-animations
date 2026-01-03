import { Color } from "./engine.js";
import { XOR128 } from "./xor128.js";

class Cell {
  constructor(x, y, size, max_depth, split_chance, xor128, palette, level = 0) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._split_chance = split_chance;
    this._max_depth = max_depth;
    this._xor128 = xor128;
    this._palette = palette;
    this._level = level;

    this._cols = xor128.random_int(4, 8);

    const color_i = this._xor128.random_int(this._palette.length);
    this._colors = [
      this._palette.getColor(color_i),
      this._palette.getColor(color_i + 1),
    ];

    this._children = [];
  }

  getBiggestCell() {
    if (this._children.length === 0) return this;

    return this._children
      .map((child) => child.getBiggestCell())
      .reduce((biggest, current) =>
        current.size > biggest.size ? current : biggest
      );
  }

  _getCellColorIndex(x, y) {
    return (x + y) % 2;
  }

  _getCellColor(x, y) {
    const color_index = this._getCellColorIndex(x, y);
    return this._colors[color_index];
  }

  draw(ctx, palette) {
    if (this._children.length > 0) {
      this._children.forEach((child) => child.draw(ctx, palette));
      return;
    }

    const cols_width = Math.ceil(this._size / this._cols);

    ctx.save();
    ctx.translate(this._x, this._y);

    for (let x = 0; x < this._cols; x++) {
      for (let y = 0; y < this._cols; y++) {
        const px = x * cols_width;
        const py = y * cols_width;

        ctx.fillStyle = this._getCellColor(x, y).rgba;
        ctx.fillRect(px, py, cols_width, cols_width);
      }
    }
    ctx.restore();
  }

  drawQuestionMark(ctx) {
    const cell_size = this._size / this._cols;

    // prevent failure when cols is 2 (should not happen at all)
    const max_cell = this._cols == 2 ? 1 : this._cols - 1;
    const min_cell = this._cols == 2 ? 0 : 1;
    const cell_x = this._xor128.random_int(min_cell, max_cell);
    const cell_y = this._xor128.random_int(min_cell, max_cell);

    // font color is opposite to background color
    const color_index = (this._getCellColorIndex(cell_x, cell_y) + 1) % 2;
    const bg_color = this._colors[color_index];
    const rotation = this._xor128.random_int(4) * (Math.PI / 2);

    ctx.save();
    ctx.translate(
      this._x + cell_size * (cell_x + 0.5),
      this._y + cell_size * (cell_y + 0.5)
    );
    ctx.rotate(rotation);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = bg_color.rgba;
    ctx.font = `${cell_size}px RobotoBold`;
    ctx.fillText("?", 0, 0.1 * cell_size);
    ctx.restore();
  }

  split() {
    if (this._level >= this._max_depth) return;
    if (this._children.length > 0) return;
    if (this._xor128.random() > this._split_chance && this._level > 0) return;

    const half_size = this._size / 2;
    const params = [
      [this._x, this._y],
      [this._x + half_size, this._y],
      [this._x, this._y + half_size],
      [this._x + half_size, this._y + half_size],
    ];

    this._children = params.map(
      (param) =>
        new Cell(
          param[0],
          param[1],
          half_size,
          this._max_depth,
          this._split_chance,
          this._xor128,
          this._palette,
          this._level + 1
        )
    );

    this._children.forEach((child) => child.split());
  }

  reset() {
    this._children = [];
  }

  get size() {
    return this._size;
  }
}

class Grid {
  constructor(size, seed, max_depth, split_chance, palette) {
    this._size = size;
    this._max_depth = max_depth;
    this._split_chance = split_chance;
    this._palette = palette;

    this._xor128 = new XOR128(seed);

    this._root = new Cell(
      0,
      0,
      size,
      max_depth,
      split_chance,
      this._xor128,
      this._palette
    );
  }

  split() {
    this._root.split(this._split_chance);
  }

  draw(ctx) {
    this._root.draw(ctx, this._palette);
  }

  getBiggestCell() {
    return this._root.getBiggestCell();
  }

  reset() {
    this._root.reset();
  }
}

export { Grid };
