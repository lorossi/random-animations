class Cube {
  constructor(y, scl, max_length, xor128) {
    this._y = y;
    this._scl = scl;
    this._max_length = max_length;
    this._xor128 = xor128;

    this._current_side = 0;
    this._current_width = 0;
    this._border = 0;

    this._sides = Array(4)
      .fill()
      .map(() => {
        const len = this._xor128.random_int(5, this._max_length);
        const letter = String.fromCharCode(
          this._xor128.random_int(33, 126)
        ).toUpperCase();
        return Array(len).fill(letter);
      });

    this._offset = this._xor128.random(1);
  }

  update(t) {
    const current_t = (t + this._offset) % 1;
    this._current_side = Math.floor(current_t * 4);

    const width_t = (current_t % 0.25) * 4;
    this._current_width = Math.floor(
      this._sinEasing(width_t) * this._sides[this._current_side].length
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
    ctx.scale(1 - this._border, 1 - this._border);

    ctx.font = `${this._scl}px Hack`;

    const text_metrics = ctx.measureText(sliced_word);
    const text_width = text_metrics.width * 1.05;

    ctx.fillStyle = "rgb(15, 15, 15)";
    ctx.fillRect(-text_width / 2, 0, text_width, this._scl);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgb(240, 240, 240)";
    ctx.fillText(sliced_word, 0, this._scl / 10);

    ctx.restore();
  }

  _sinEasing(t) {
    return Math.sin(t * Math.PI);
  }
}

class Cell {
  constructor(x, y, letter_scl, cubes_num, max_length, xor128) {
    this._x = x;
    this._y = y;
    this._letter_scl = letter_scl;
    this._cubes_num = cubes_num;
    this._max_length = max_length;
    this._xor128 = xor128;

    this._scl = 0.9;

    this._cubes = Array(this._cubes_num)
      .fill()
      .map((_, i) => {
        return new Cube(
          i * this._letter_scl,
          this._letter_scl,
          this._max_length,
          this._xor128
        );
      });
  }

  update(t) {
    this._cubes.forEach((c) => c.update(t));
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.scale(this._scl, this._scl);
    this._cubes.forEach((c) => c.show(ctx));
    ctx.restore();
  }
}

export { Cell };
