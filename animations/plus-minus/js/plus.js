import { Color } from "./engine.js";

class Plus {
  constructor(x, y, size, fill, direction = 1) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._fill = fill;
    this._direction = direction;

    this._rotation = 0;
    this._t = 0;
  }

  update(t) {
    this._t = this._easeInOutPoly(t, 3);
    this._rotation = (Math.PI / 2) * this._t * this._direction;
  }

  draw(ctx) {
    const points = [
      [0, 1],
      [0, 2],
      [1, 2],
      [1, 3],
      [2, 3],
      [2, 2],
      [3, 2],
      [3, 1],
      [2, 1],
      [2, 0],
      [1, 0],
      [1, 1],
    ];
    const side = this._size / 3;
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.rotate(this._rotation);
    ctx.translate(-this._size / 2, -this._size / 2);

    ctx.fillStyle = this._fill.rgba;

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = p[0] * side;
      const y = p[1] * side;

      if (i == 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  _easeInOutPoly(t, p) {
    if (t < 0.5) return 0.5 * Math.pow(2 * t, p);
    else return 1 - 0.5 * Math.pow(2 * (1 - t), p);
  }
}

export { Plus };
