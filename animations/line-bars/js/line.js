import { Utils } from "./lib.js";

class Line {
  constructor(slot_width, circle_radius, points, color) {
    this._slot_width = slot_width;
    this._circle_radius = circle_radius;
    this._points = points;
    this._color = color;

    this.update(0);
  }

  update(t) {
    this._t = t;
    const tt = Utils.remap(t, 0, 1, 1, this._points.length);

    this._points_t = Math.floor(tt);
    this._points_progress = Utils.ease_in_out_poly(tt % 1, 2);
  }

  show(ctx) {
    const current_points = this._points.slice(0, this._points_t);
    if (this._points_t < this._points.length) {
      const next_point = this._points[this._points_t];
      const current_point = this._points[this._points_t - 1];
      const interp_point = current_point.lerp(
        next_point,
        this._points_progress,
      );
      current_points.push(interp_point);
    }

    ctx.save();
    ctx.lineWidth = 2;

    ctx.strokeStyle = this._color.rgba;
    ctx.fillStyle = this._color.rgba;

    ctx.beginPath();
    current_points.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    current_points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, this._circle_radius, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.restore();
  }
}

export { Line };
