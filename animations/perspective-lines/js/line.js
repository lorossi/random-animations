import { Color } from "./engine.js";

class Line {
  constructor(y, h, width) {
    this._y = y;
    this._h = h;
    this._end = width;
  }

  setAttributes(
    scramble_start,
    scramble_end,
    scrambled_slope,
    scrambled_y,
    color
  ) {
    this._scramble_start = scramble_start;
    this._scramble_end = scramble_end;
    this._scrambled_slope = scrambled_slope;
    this._scrambled_y = scrambled_y;
    this._color = color;
  }

  show(ctx) {
    // bezier control points
    const c1 = this._scramble_start + this._scrambled_slope / 2;
    const c2 = this._scramble_end - this._scrambled_slope / 2;

    ctx.save();
    ctx.strokeStyle = this._color.rgba;
    ctx.lineWidth = this._h * 0.8;

    ctx.beginPath();
    ctx.moveTo(0, this._y);
    ctx.lineTo(this._scramble_start, this._y);

    // left slope
    ctx.bezierCurveTo(
      c1,
      this._y,
      c1,
      this._scrambled_y,
      this._scramble_start + this._scrambled_slope,
      this._scrambled_y
    );

    ctx.lineTo(this._scramble_end - this._scrambled_slope, this._scrambled_y);

    // right slope
    ctx.bezierCurveTo(
      c2,
      this._scrambled_y,
      c2,
      this._y,
      this._scramble_end,
      this._y
    );

    ctx.lineTo(this._end, this._y);
    ctx.stroke();

    ctx.restore();
  }
}

export { Line };
