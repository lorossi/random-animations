import { Color } from "./lib.js";

class Letter {
  constructor(x, y, size, font) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._font = font;

    this._letters = [];

    this._frozen = false;
    this._scl = 0.9;
  }

  setAttributes(duration) {
    this._duration = duration;
  }

  injectDependencies(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;
    this._init();
  }

  _drawLetter(ctx) {
    const letter = this._letters[0];
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${this._size * 1.3}px ${this._font}`;
    ctx.fillText(letter, 0, this._size * 0.05);
    ctx.restore();
  }

  show(ctx) {
    if (!this._frozen) {
      this._life--;
      if (this._life <= 0) {
        this._life = this._letter_duration;
        const last = this._letters.shift();
        this._letters.push(last);
      }
    }

    const x = this._size * (this._x + 0.5);
    const y = this._size * (this._y + 0.5);

    ctx.save();
    ctx.translate(x, y);

    ctx.beginPath();
    ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
    ctx.clip();

    ctx.scale(this._scl, this._scl);

    ctx.fillStyle = this._fg.rgba;
    this._drawLetter(ctx);

    ctx.restore();
  }

  _init() {
    this._letters = new Array(10)
      .fill(0)
      .map((_) => String.fromCharCode(this._xor128.random_int(65, 91)));
    this._letter_duration = this._duration / this._letters.length;

    this._fg = Color.fromMonochrome(this._xor128.random_int(0, 100));
    this._life = this._xor128.random_int(this._letter_duration);
  }

  setLetter(l) {
    this._letters = [l];
  }

  setColor(c) {
    this._fg = c;
  }

  freeze() {
    this._frozen = true;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }
}

export { Letter };
