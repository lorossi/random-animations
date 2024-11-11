import { XOR128 } from "./xor128.js";
import { Layer } from "./layer.js";

class Sin extends Layer {
  constructor(x, y, size, fg_color, seed, cols, omega, scl) {
    super();
    this._x = x;
    this._y = y;
    this._size = size;
    this._fg_color = fg_color;
    this._cols = cols;
    this._omega = omega;
    this._scl = scl;

    // this._font = "Hack-Bold";
    this._xor128 = new XOR128(seed);
    this.theta = 0;
    this.phi = this._xor128.random(Math.PI * 2);
  }

  show(ctx) {
    const scl = this._size / this._cols;

    ctx.save();

    this.setupCtx(ctx, scl);

    for (let x = 0; x < this._cols; x++) {
      const s = Math.sin(x * 0.5 + this.theta);
      const y = (s * this._cols) / 2 + this._cols / 2;

      for (let yy = this._cols; yy > y; yy--) {
        const fx = (x + 0.5) * scl;
        const fy = (yy - 0.5) * scl;
        const character = this._xor128.pick(this.characters_map.slice(-2));

        ctx.fillText(character, fx, fy);
      }
    }

    ctx.restore();
  }
}

export { Sin };
