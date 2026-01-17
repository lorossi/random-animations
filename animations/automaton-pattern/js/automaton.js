class Automaton {
  constructor(wolfram_code, width, height, cols, radix, palette) {
    // convert wolfram code from base64
    this._wolfram_code = parseInt(atob(wolfram_code));
    this._width = width;
    this._height = height;
    this._cols = cols;
    this._radix = radix;
    this._palette = palette;

    this._col_size = this._width / this._cols;
    this._rows = Math.floor(this._height / this._col_size);
    this.reset();

    this._decodeRules();
  }

  reset() {
    this._state = new Array(this._cols * 2).fill(new Cell(0));
    this._next = new Array(this._cols * 2).fill(new Cell(0));
    this._current_row = 0;
  }

  randomInitialState(rng, iterations = 10) {
    this._state = this._state.map(() => new Cell(rng.random_int(this._radix)));

    for (let i = 0; i < iterations; i++) this._step();
  }

  setFGColor(color) {
    this._fg_color = color;
  }

  setPalette(palette) {
    this._palette = palette;
  }

  _decodeRules() {
    this._ruleset = {};
    const rules_length = Math.pow(this._radix, 3);

    const wolfram_bin = this._wolfram_code
      .toString(this._radix)
      .padStart(rules_length, "0");

    for (let i = 0; i < rules_length; i++) {
      const rule_bin = i.toString(this._radix).padStart(3, "0");
      this._ruleset[rule_bin] = parseInt(wolfram_bin[i]);
    }
  }

  _step() {
    for (let i = 0; i < this._state.length; i++) {
      const left = this._state[i - 1] ?? new Cell();
      const me = this._state[i];
      const right = this._state[i + 1] ?? new Cell();
      const rule =
        this._ruleset[left.toString() + me.toString() + right.toString()];
      this._next[i] = new Cell(rule);
    }

    this._next[0] = new Cell();
    this._next[this._rows - 1] = new Cell();

    this._state = this._next.slice();
  }

  computeNext() {
    if (this.ended) return;

    this._step();
    this._current_row++;
  }

  show(ctx) {
    ctx.save();
    ctx.translate(0, (this._current_row - 1) * this._col_size);

    for (let i = 0; i < this._cols; i++) {
      const state = this._state[i + 1].value;
      const color = this._palette.getColor(state);
      const x = i * this._col_size;
      ctx.fillStyle = color.rgba;

      ctx.fillRect(x, 0, this._col_size, this._col_size);
    }

    ctx.restore();
  }

  get ended() {
    return (
      this._current_row >= this._rows ||
      (this._state.every((cell) => cell.value === 0) && this._current_row > 0)
    );
  }

  get rules() {
    return this._ruleset;
  }
}

class Cell {
  constructor(value = 0) {
    this._value = value;
  }

  get value() {
    return this._value;
  }

  set value(v) {
    this._value = v;
  }

  toString() {
    return this._value.toString();
  }
}

export { Automaton };
