class Shape {
  constructor(x, y, r) {
    this._x = x;
    this._y = y;
    this._r = r;

    this._border = 1;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get r() {
    return this._r;
  }

  get left() {
    return { x: this._x - this._r, y: this._y - this._r };
  }

  get right() {
    return { x: this._x + this._r, y: this._y + this._r };
  }

  _dist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  overlap() {}
  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    this._showShape(ctx);
    ctx.restore();
  }
  _showShape() {}
}

class Circle extends Shape {
  _showShape(ctx) {
    ctx.beginPath();
    ctx.arc(0, 0, this._r, 0, 2 * Math.PI);
    ctx.fill();
  }

  overlap(other) {
    if (other instanceof Square)
      return (
        this._dist(this._x, this._y, other.x, other.y) <
        this._r + other.r * Math.SQRT2 + this._border
      );

    return (
      this._dist(this._x, this._y, other.x, other.y) <
      this._r + other.r + this._border
    );
  }
}

class Square extends Shape {
  _showShape(ctx) {
    ctx.fillRect(-this._r, -this._r, this._r * 2, this._r * 2);
  }

  overlap(other) {
    if (other instanceof Circle) {
      return (
        this._dist(this._x, this._y, other.x, other.y) <
        this._r * Math.SQRT2 + other.r + this._border
      );
    }

    if (
      this.left.x > other.right.x + this._border ||
      other.left.x > this.right.x + this._border
    )
      return false;

    if (
      this.left.y > other.right.y + this._border ||
      other.left.y > this.right.y + this._border
    )
      return false;

    return true;
  }
}

export { Circle, Square };
