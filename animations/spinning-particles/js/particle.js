import { Color } from "./lib.js";

class Particle {
  constructor(rho, palette, xor128) {
    this._rho = rho;
    this._xor128 = xor128;

    this._phi = this._xor128.random(Math.PI * 2);
    this._gamma = this._xor128.random(Math.PI * 2);

    this._alpha = 0;
    this._beta = 0;

    this._omega_1 = this._xor128.random_int(1, 3);
    this._omega_2 = this._xor128.random_int(2, 10);

    this._r = this._xor128.random(5, 25);

    this._palette = palette;

    this._color = Color.fromHEX(this._palette.getRandomColor(this._xor128));
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this._color.rgb;
    ctx.rotate(this._phi + this._alpha);
    ctx.translate(this._rho, 0);
    ctx.rotate(this._gamma + this._beta);
    ctx.fillRect(-this._r / 2, -this._r / 2, this._r, this._r);
    ctx.restore();
  }

  update(t) {
    this._alpha = Math.PI * 2 * this._omega_1 * t;
    this._beta = Math.PI * 2 * this._omega_2 * t;
  }
}

export { Particle };
