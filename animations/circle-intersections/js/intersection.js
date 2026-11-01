import { Circle } from "./circle.js";

class Intersection {
  constructor(circle_a, circle_b, side, size) {
    // side picks one of the two points where the circles cross
    this._circle_a = circle_a;
    this._circle_b = circle_b;
    this._side = side;
    this._size = size;
    this._position = null;
  }

  update() {
    const points = this._circle_a.get_intersections(this._circle_b);
    this._position = points.length > 0 ? points[this._side] : null;
  }

  overlaps(other) {
    return this.distance(other) < this._size + other.size;
  }

  contains(point) {
    return this.distance(point) < this._size - 1e-6;
  }

  distance(point) {
    return Math.hypot(point.x - this.x, point.y - this.y);
  }

  cut(ctx) {
    ctx.moveTo(this.x + this._size, this.y);
    ctx.arc(this.x, this.y, this._size, 0, 2 * Math.PI, false);
  }

  get hole() {
    return new Circle(this.x, this.y, this._size);
  }

  get active() {
    return this._position != null;
  }

  get x() {
    return this._position.x;
  }

  get y() {
    return this._position.y;
  }

  get size() {
    return this._size;
  }
}

export { Intersection };
