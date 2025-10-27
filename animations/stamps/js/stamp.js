import { Color } from "./engine.js";
import { XOR128 } from "./xor128.js";

class Stamp {
  constructor(x, y, size, scl, xor_128) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._scl = scl;
    this._xor128 = xor_128;
  }

  show(ctx, painting, index) {
    // Axis rotation angle
    const theta = this._xor128.random_int(4) * (Math.PI / 2);
    // "Imperfect" rotation offset
    const phi = this._xor128.random_interval(0, Math.PI / 360);

    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.rotate(theta + phi);

    // create clipping square accounting for scaling
    ctx.beginPath();
    ctx.rect(
      (-this._size / 2) * this._scl,
      (-this._size / 2) * this._scl,
      this._size * this._scl,
      this._size * this._scl
    );
    ctx.clip();

    ctx.translate(-this._size / 2, -this._size / 2);

    painting.drawCrop(ctx, index, this._size);

    ctx.restore();
  }
}

export { Stamp };
