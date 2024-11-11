import { XOR128 } from "./xor128.js";
import { Layer } from "./layer.js";

class Radar extends Layer {
  constructor(x, y, size, fg_color, seed, cols, omega, scl) {
    super();
    this._x = x;
    this._y = y;
    this._size = size;
    this._fg_color = fg_color;
    this._cols = cols;
    this._omega = omega;
    this._scl = scl;

    this._xor128 = new XOR128(seed);
    this.phi = this._xor128.random(Math.PI * 2);
  }

  show(ctx) {
    const scl = this._size / this._cols;

    ctx.save();
    this.setupCtx(ctx, scl);

    for (let x = 0; x < this._cols; x++) {
      const fx = (x + 0.5) * scl;
      for (let y = 0; y < this._cols; y++) {
        const fy = (y + 0.5) * scl;

        const dist = Math.sqrt(
          Math.pow(fx - this._size / 2, 2) + Math.pow(fy - this._size / 2, 2)
        );
        if (dist > this._size / 2) continue;

        const gamma = Math.atan2(y - this._cols / 2, x - this._cols / 2);
        const phi = this.wrapTheta(gamma + this.theta);
        const i = (phi + Math.PI) / (Math.PI * 2);
        const di = this._xor128.random_interval(0, 0.1);
        const e = this.easeInPoly(i + di, 2);

        let character_i = Math.floor(e * this.characters_map.length);
        if (character_i >= this.characters_map.length)
          character_i = this.characters_map.length - 1;

        ctx.fillText(this.characters_map[character_i], fx, fy);
      }
    }

    ctx.restore();
  }
}

export { Radar };
