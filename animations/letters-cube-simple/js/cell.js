import { Color } from "./lib.js";

class Cube {
  constructor(y, scl, max_length, xor128) {
    this._y = y;
    this._scl = scl;
    this._max_length = max_length;
    this._xor128 = xor128;

    this._current_side = 0;
    this._current_width = 0;
    this._border = 0;
    this._fg = Color.fromMonochrome(15);
    this._bg = Color.fromMonochrome(240);

    this._sides = Array(4)
      .fill()
      .map(() => {
        const length = this._xor128.random_int(1, this._max_length);
        const letter = String.fromCharCode(this._xor128.random_int(65, 91));
        return Array(length).fill(letter);
      });

    this._offset = this._xor128.random(1);
    this._rotation = this._xor128.random_interval(0, Math.PI / 270);
  }

  update(t) {
    const current_t = (t + this._offset) % 1;
    this._current_side = Math.floor(current_t * 4);

    const width_t = (current_t % 0.25) * 4;
    this._current_width = Math.floor(
      this._sinEasing(width_t) * this._sides[this._current_side].length,
    );
  }

  show(ctx) {
    const current_word = this._sides[this._current_side].join("");

    let start_char = current_word.length / 2 - this._current_width / 2;
    let end_char = current_word.length / 2 + this._current_width / 2;

    if (end_char - start_char == 0) {
      start_char = current_word.length / 2;
      end_char = start_char + 1;
    }

    const sliced_word = current_word.slice(start_char, end_char);

    if (sliced_word.length == 0) return;

    ctx.save();
    ctx.translate(0, this._y);
    ctx.rotate(this._rotation);
    ctx.scale(1 - this._border, 1 - this._border);

    ctx.font = `${this._scl}px Hack`;

    const text_metrics = ctx.measureText(sliced_word);
    const text_width = text_metrics.width * 1.05;

    ctx.fillStyle = this._fg.rgba;
    ctx.fillRect(-text_width / 2, 0, text_width, this._scl);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = this._bg.rgba;
    ctx.fillText(sliced_word, 0, this._scl / 10);

    ctx.restore();
  }

  _sinEasing(t, n = 1.25) {
    return Math.sin(t * Math.PI) ** n;
  }

  get fg() {
    return this._fg;
  }

  set fg(fg) {
    this._fg = fg;
  }

  get bg() {
    return this._bg;
  }

  set bg(bg) {
    this._bg = bg;
  }
}

class Cell {
  constructor(letter_scl, cubes_num, max_length, xor128) {
    this._letter_scl = letter_scl;
    this._cubes_num = cubes_num;
    this._max_length = max_length;
    this._xor128 = xor128;

    this._cubes = Array(this._cubes_num)
      .fill()
      .map(
        (_, i) =>
          new Cube(
            i * this._letter_scl,
            this._letter_scl * 1.2,
            this._max_length,
            this._xor128,
          ),
      );
  }

  setColor(fg, bg) {
    this._cubes.forEach((c) => {
      c.fg = fg;
      c.bg = bg;
    });
  }

  update(t) {
    this._cubes.forEach((c) => c.update(t));
  }

  show(ctx) {
    ctx.save();
    this._cubes.forEach((c) => c.show(ctx));
    ctx.restore();
  }
}

export { Cell };
