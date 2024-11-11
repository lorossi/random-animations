import { Layer } from "./layer.js";
import { XOR128 } from "./xor128.js";
import { SimplexNoise } from "./engine.js";

class TextLines extends Layer {
  constructor(x, y, size, fg_color, seed, cols, omega, scl) {
    super();
    this._x = x;
    this._y = y;
    this._size = size;
    this._fg_color = fg_color;
    this._cols = cols;
    this._omega = omega;
    this._scl = scl;

    this._line_num = this._cols * 3;

    this._xor128 = new XOR128(seed);
    this.phi = this._xor128.random(Math.PI * 2);

    this._lines = new Array(this._line_num).fill().map((_, i) => {
      const r = this._xor128.random(0.2, 1);
      const line_length = Math.floor(this._cols * r * 2);

      return new Array(line_length)
        .fill()
        .map(() => this._xor128.pick(this.characters_map))
        .join("");
    });
  }

  show(ctx) {
    const scl = this._size / this._cols;

    ctx.save();
    this.setupCtx(ctx, scl);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    for (let y = 0; y < this._lines.length; y++) {
      const dy = Math.floor((this.theta / (2 * Math.PI)) * this._lines.length);
      const line_i = this.wrap(y - dy, 0, this._lines.length);
      ctx.fillText(this._lines[line_i], 0, y * scl);
    }
    ctx.restore();
  }
}

export { TextLines };
