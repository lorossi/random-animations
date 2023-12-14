import { Color } from "./engine.js";

class Letter {
  constructor(x, y, letter, size) {
    this._x = x;
    this._y = y;
    this._letter = letter;
    this._size = size;

    this._fg = Color.fromMonochrome(245);
    [this._width, this._height] = this._calculateSize();
  }

  _calculateSize() {
    const ctx = document.createElement("canvas").getContext("2d");

    ctx.font = `${this._size}px RobotoMono`;

    const temp_letter = this._letter == " " ? "a" : this._letter;
    const measure = ctx.measureText(temp_letter);

    const width =
      measure.actualBoundingBoxRight - measure.actualBoundingBoxLeft;
    const height =
      measure.actualBoundingBoxAscent - measure.actualBoundingBoxDescent;

    return [width, height];
  }

  show(ctx) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.translate(this._x, this._y);
    ctx.fillStyle = this._fg.rgba;
    ctx.font = `${this._size}px RobotoMono`;
    ctx.fillText(this._letter, 0, 0);

    ctx.restore();
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }
}

export { Letter };
