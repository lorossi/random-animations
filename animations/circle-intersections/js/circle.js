import { Point, Utils, Color, XOR128 } from "./lib.js";

class Circle {
  constructor(x, y, radius, stroke_color, seed) {
    this._x = x;
    this._y = y;
    this._radius = radius;
    this._max_radius = radius;
    this._stroke_color = stroke_color;

    this._et = 0;
    this._alpha_fill = 0;



    this._xor128 = new XOR128(seed);
    this._alpha_base = this._xor128.random( 0.25);
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get radius() {
    return this._radius;
  }

  get_intersections(other_circle) {
    const d = Math.sqrt(
      Math.pow(other_circle.x - this._x, 2) +
        Math.pow(other_circle.y - this._y, 2),
    );
    if (d > this._radius + other_circle.radius) {
      return [];
    }
    if (d < Math.abs(this._radius - other_circle.radius)) {
      return [];
    }

    const a =
      (Math.pow(this._radius, 2) -
        Math.pow(other_circle.radius, 2) +
        Math.pow(d, 2)) /
      (2 * d);

    const h = Math.sqrt(Math.pow(this._radius, 2) - Math.pow(a, 2));
    const x0 = this._x + (a * (other_circle.x - this._x)) / d;
    const y0 = this._y + (a * (other_circle.y - this._y)) / d;
    const intersection1 = new Point(
      x0 + (h * (other_circle.y - this._y)) / d,
      y0 - (h * (other_circle.x - this._x)) / d,
    );
    const intersection2 = new Point(
      x0 - (h * (other_circle.y - this._y)) / d,
      y0 + (h * (other_circle.x - this._x)) / d,
    );
    return [intersection1, intersection2];
  }

  update(t) {
    this._et = Utils.ease_out_poly(t, 3);
    this._radius = this._max_radius * this._et;
  }

  get center() {
    return new Point(this._x, this._y);
  }

  show(ctx) {
    const fill_style = Color.fromCSS("white");
    fill_style.a = this._et * 0.06;

    ctx.save();
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(this._x, this._y, this._radius, 0, 2 * Math.PI);
    ctx.strokeStyle = this._stroke_color.rgba;
    ctx.stroke();
    ctx.fillStyle = fill_style.rgba;
    ctx.fill();

    ctx.restore();
  }
}

export { Circle };
