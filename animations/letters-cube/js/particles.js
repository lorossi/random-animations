import { Color } from "./engine.js";

class Particle {
  constructor(width, height, scl, xor128) {
    this._width = width;
    this._height = height;
    this._scl = scl;
    this._xor128 = xor128;
  }

  update() {
    this._x = this._xor128.random_int(this._width);
    this._y = this._xor128.random_int(this._height);
  }

  show(ctx) {
    ctx.save();

    ctx.translate(this._x, this._y);
    const r = this._xor128.random(127);
    ctx.fillStyle = Color.fromMonochrome(r, 0.05).rgba;

    ctx.beginPath();
    ctx.rect(0, 0, this._scl, this._scl);
    ctx.fill();

    ctx.restore();
  }
}
export { Particle };
