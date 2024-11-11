import { Color } from "./engine.js";
import { Book } from "./book.js";

class Shelf {
  constructor(x, y, max_w, h, max_book_height, xor128, palette) {
    this._x = x;
    this._y = y;
    this._max_w = max_w;
    this._h = h;
    this._max_book_height = max_book_height;
    this._xor128 = xor128;
    this._palette = palette;

    this._w = this._xor128.random(0.5, 1) * this._max_w;
    this._dx = (this._max_w - this._w) / 2;

    this._color = Color.fromMonochrome(15);

    this._books = [];
    this._generateBooks();
  }

  _generateBooks() {
    let xx = this._xor128.random(8);
    while (true) {
      const w = this._xor128.random(8, 16);
      const h = this._xor128.random(32, this._max_book_height);
      if (xx + w > this._w) break;

      const b = new Book(xx, 0, w, h, this._xor128, this._palette);
      this._books.push(b);
      xx += b.getActualWidth() + this._xor128.random(2);
      // leave a large gap
      if (this._xor128.random() > 0.9) {
        xx += this._xor128.random(8, 16);
      }
    }
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x + this._dx, this._y);

    this._books.forEach((book) => book.show(ctx));

    ctx.save();
    ctx.lineWidth = this._h;
    ctx.strokeStyle = this._color.rgba;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this._w, 0);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get w() {
    return this._w;
  }

  get h() {
    return this._h;
  }
}

export { Shelf };
