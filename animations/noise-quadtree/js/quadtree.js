class QuadTree {
  constructor(size, points, fg, xor128, max_points = 4) {
    this._root = new Cell(0, 0, size, fg, xor128, 0);
    this._points = points;
    this._max_points = max_points;
    this._xor128 = xor128;
  }

  draw(ctx) {
    ctx.save();
    this._root.draw(ctx);
    ctx.restore();
  }

  pointsInCell(cell) {
    return this._points.filter((point) => cell.containsPoint(point));
  }

  split(cell = this._root) {
    const pointsInCell = this.pointsInCell(cell);
    if (pointsInCell.length <= this._max_points) {
      return;
    }
    cell.split();
    cell._children.forEach((child) => this.split(child));
  }
}

class Cell {
  constructor(x, y, size, fg, xor128, depth = 0) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._fg = fg;
    this._xor128 = xor128;
    this._depth = depth;

    this._children = [];
  }

  split() {
    if (this._children.length > 0) {
      throw new Error("Cell already split");
    }

    const half_size = this._size / 2;
    const new_coords = [
      [this._x, this._y], // Top-left
      [this._x + half_size, this._y], // Top-right
      [this._x, this._y + half_size], // Bottom-left
      [this._x + half_size, this._y + half_size], // Bottom-right
    ];

    this._children = new_coords.map(
      (coords) =>
        new Cell(
          coords[0],
          coords[1],
          half_size,
          this._fg,
          this._xor128,
          this._depth + 1
        )
    );
  }

  containsPoint(point) {
    return (
      point.x >= this._x &&
      point.x < this._x + this._size &&
      point.y >= this._y &&
      point.y < this._y + this._size
    );
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this._fg.rgba;

    if (this._children.length === 0) {
      this._clipBorder(ctx);
      this._drawInner(ctx);
    } else {
      this._children.forEach((child) => child.draw(ctx));
    }
    ctx.restore();
  }

  _clipBorder(ctx) {
    const clipSize = this._size - 4;
    const border = (this._size - clipSize) / 2;
    ctx.beginPath();
    ctx.rect(this._x + border, this._y + border, clipSize, clipSize);
    ctx.clip();
  }

  _drawInner(ctx) {
    // small chance to skip drawing to create holes
    if (this._xor128.random() < 1 / (2 * this._depth)) return;

    const r = this._xor128.random();
    if (r < 2 / 3) {
      // filled
      ctx.fillRect(this._x, this._y, this._size, this._size);
    } else {
      // random rotation
      const angle = this._xor128.random_int(0, 4) * (Math.PI / 2);
      ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
      ctx.rotate(angle);
      ctx.translate(-this._x - this._size / 2, -this._y - this._size / 2);

      // diagonal pattern
      ctx.beginPath();
      for (let i = -this._size; i < this._size * 2; i += 15) {
        ctx.moveTo(this._x + i, this._y);
        ctx.lineTo(this._x + i - this._size, this._y + this._size);
      }
      ctx.strokeStyle = this._fg.rgba;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
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

  get hasChildren() {
    return this._children.length > 0;
  }
}

export { QuadTree, Cell };
