import { Color } from "./engine.js";

class Square {
  constructor(x, y, scl) {
    this._x = x;
    this._y = y;
    this._scl = scl;
  }

  setRandom(xor128) {
    this._xor128 = xor128;
  }

  setPalette(palette) {
    this._palette = palette;
  }

  show(ctx) {
    const [bg_color, fg_color] = this._xor128.shuffle(this._palette.colors);
    const draw_functions = [
      this._drawDiagonalLine,
      this._drawQuarterCircle,
      this._drawCircle,
      this._drawTriangle,
      this._drawFourCircles,
    ];
    const rotation = this._xor128.random_int(0, 4) * (Math.PI / 2);

    ctx.save();
    ctx.beginPath();
    ctx.rect(this._x, this._y, this._scl, this._scl);
    ctx.clip();

    // draw bg
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.fillStyle = bg_color.rgb;
    ctx.fillRect(0, 0, this._scl, this._scl);
    ctx.restore();

    ctx.save();
    ctx.translate(this._x + this._scl / 2, this._y + this._scl / 2);
    ctx.rotate(rotation);

    // draw fg
    ctx.fillStyle = fg_color.rgb;
    ctx.strokeStyle = fg_color.rgb;
    // select random draw function
    const draw_function = this._xor128.pick(draw_functions);
    ctx.save();
    draw_function.bind(this)(ctx);
    ctx.restore();

    ctx.restore();

    ctx.restore();
  }

  _drawDiagonalLine(ctx) {
    ctx.lineWidth = this._scl / 3;
    ctx.beginPath();
    ctx.moveTo(-this._scl / 2, -this._scl / 2);
    ctx.lineTo(this._scl / 2, this._scl / 2);
    ctx.stroke();
  }

  _drawQuarterCircle(ctx) {
    ctx.beginPath();
    ctx.arc(0, 0, (this._scl / 2) * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawCircle(ctx) {
    ctx.beginPath();
    ctx.arc(
      this._scl / 2,
      this._scl / 2,
      this._scl,
      Math.PI / 2,
      (Math.PI / 2) * 3
    );
    ctx.fill();
  }

  _drawTriangle(ctx) {
    ctx.beginPath();
    ctx.moveTo(-this._scl / 2, this._scl / 2);
    ctx.lineTo(this._scl / 2, this._scl / 2);
    ctx.lineTo(this._scl / 2, -this._scl / 2);
    ctx.fill();
  }

  _drawFourCircles(ctx) {
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate(((Math.PI * 2) / 4) * i);
      ctx.translate(0, this._scl * (1 / 2 - 1 / 4));
      ctx.beginPath();
      ctx.arc(0, 0, this._scl / 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

export { Square };
