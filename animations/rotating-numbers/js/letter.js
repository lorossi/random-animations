class Letter {
  constructor(x, y, size, text_scl, trail_length, letter, fg, xor128) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._text_scl = text_scl;
    this._trail_length = trail_length;
    this._letter = letter;
    this._fg = fg;
    this._xor128 = xor128;

    this._angle = 0;

    this._phases = this._xor128.random_int(4, 9);
    this._angles = this._xor128.shuffle(
      new Array(this._phases)
        .fill(0)
        .map((_, i) => (i * Math.PI * 2) / this._phases)
    );

    this._seed = this._xor128.random(Math.PI * 2);
    this._dx = this._xor128.random_interval(0, 0.1) * this._size;
    this._dy = this._xor128.random_interval(0, 0.1) * this._size;
    this._flips = [this._xor128.pick([1, -1]), this._xor128.pick([1, -1])];

    this._old_angles = new Array(this._trail_length).fill(0);
  }

  setLetter(letter) {
    this._letter = letter;
  }

  update(t) {
    const tt = (t + this._seed) % 1;

    const current_phase = Math.floor(tt * this._phases);
    const current_t = (tt - current_phase / this._phases) * this._phases;
    const eased_t = this._easeInOutPow(current_t, 5);

    const start_angle = this._angles[current_phase % this._phases];
    const end_angle = this._angles[(current_phase + 1) % this._phases];

    this._angle = start_angle + (end_angle - start_angle) * eased_t;

    this._old_angles.pop();
    this._old_angles.unshift(this._angle);
  }

  show(ctx) {
    ctx.save();
    ctx.translate(
      this._x + this._size / 2 + this._dx,
      this._y + this._size / 2 + this._dy
    );
    ctx.scale(this._flips[0], this._flips[1]);

    ctx.fillStyle = this._fg.rgba;
    ctx.font = `${this._size}px Wartext`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = this._trail_length - 1; i >= 0; i--) {
      const alpha = (i + 1) / this._trail_length / 2;
      ctx.fillStyle = `rgba(${this._fg.r}, ${this._fg.g}, ${this._fg.b}, ${alpha})`;
      ctx.save();
      ctx.rotate(this._old_angles[i]);
      ctx.scale(this._text_scl, this._text_scl);
      ctx.fillText(this._letter, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  _easeInOutPow(x, n) {
    if (x < 0.5) return 0.5 * Math.pow(2 * x, n);
    return 1 - 0.5 * Math.pow(2 * (1 - x), n);
  }
}

export { Letter };
