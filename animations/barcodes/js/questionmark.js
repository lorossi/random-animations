import { XOR128 } from "./lib.js";

class QuestionMark {
  constructor(x, y, size, seed) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._seed = seed;

    this._xor128 = new XOR128(this._seed);
    this._rotation = this._xor128.random_interval(0, Math.PI / 180);
  }

  draw(ctx) {
    const text = "?";
    ctx.save();
    ctx.globalCompositeOperation = "difference";
    ctx.fillStyle = "white";

    ctx.translate(this._x, this._y);
    ctx.rotate(this._rotation);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${this._size}px Hack`;
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }
}

export { QuestionMark };
