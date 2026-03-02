import { Color } from "./lib.js";

class Line {
  constructor(slot_width, points, palette) {
    this._slot_width = slot_width;
    this._points = points;
    this._palette = palette;
  }

  show(ctx) {
    ctx.save();
    ctx.lineWidth = 1;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";

    ctx.beginPath();
    this._points.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.coords.x, point.coords.y);
      else ctx.lineTo(point.coords.x, point.coords.y);
    });
    ctx.stroke();

    this._points.forEach((point, i) => {
      ctx.beginPath();
      ctx.arc(
        point.coords.x,
        point.coords.y,
        this._slot_width * 0.2,
        0,
        2 * Math.PI,
      );
      ctx.stroke();
      ctx.fill();
    });

    ctx.restore();
  }
}

export { Line };
