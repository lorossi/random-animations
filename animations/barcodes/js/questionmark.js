import { XOR128 } from "./xor128.js";

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
    ctx.strokeStyle = "white";

    ctx.translate(this._x, this._y);
    ctx.rotate(this._rotation);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${this._size}px Hack`;

    const text_metrics = ctx.measureText(text);
    const actual_height =
      text_metrics.actualBoundingBoxAscent +
      text_metrics.actualBoundingBoxDescent;

    ctx.fillText(text, 0, 0);

    // draw a box around the question mark
    ctx.lineWidth = 2;
    ctx.strokeRect(
      -text_metrics.width / 2 - this._size / 10,
      -actual_height / 2 - this._size / 10,
      text_metrics.width + this._size / 5,
      actual_height + this._size / 5
    );
    ctx.restore();
  }
}

export { QuestionMark };
