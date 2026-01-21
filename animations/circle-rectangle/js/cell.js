import { XOR128 } from "./lib.js";

class Cell {
  constructor(x, y, width, height, palette, seed, scl = 0.9) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._palette = palette;
    this._seed = seed;
    this._scl = scl;

    this._xor128 = new XOR128(this._seed);
  }

  update() {}

  show(ctx) {
    const shuffled = this._palette.copy().shuffle(this._xor128);
    ctx.save();
    ctx.translate(this._x + this._width / 2, this._y + this._height / 2);
    ctx.scale(this._scl, this._scl);

    this._drawBottom(ctx, shuffled);
    this._drawTop(ctx, shuffled);

    ctx.restore();
  }

  _drawBottom(ctx, palette) {
    this._drawSide(ctx, palette, 0);
  }

  _drawTop(ctx, palette) {
    ctx.save();
    ctx.rotate(Math.PI);
    this._drawSide(ctx, palette, 3);
    ctx.restore();
  }

  _drawSide(ctx, palette, color_start) {
    ctx.save();
    // draw bottom rectangle
    ctx.fillStyle = palette.getColor(color_start).rgba;
    ctx.beginPath();
    ctx.roundRect(-this._width / 2, 0, this._width, this._height / 2, 2);
    ctx.fill();

    // draw bottom half circle
    ctx.beginPath();
    ctx.fillStyle = palette.getColor(color_start + 1).rgba;
    ctx.arc(0, 0, this._width / 2, 0, Math.PI);
    ctx.fill();
    ctx.clip();

    // draw line
    const line_angle = this._xor128.pick([Math.PI / 4, (Math.PI / 4) * 3]);
    ctx.save();
    ctx.rotate(line_angle);
    ctx.beginPath();
    ctx.lineCap = "square";
    ctx.strokeStyle = palette.getColor(color_start + 2).rgba;
    ctx.lineWidth = 8;
    ctx.moveTo(0, 0);
    ctx.lineTo(this._width / 2, 0);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }
}

export { Cell };
