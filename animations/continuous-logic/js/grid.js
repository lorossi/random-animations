import { GateFactory } from "./gate.js";
import { Palette } from "./palette-factory.js";
class Grid {
  constructor(rows, cols, gates_num, size, xor128, palette) {
    this._rows = rows;
    this._cols = cols;
    this._gates_num = gates_num;
    this._size = size;
    this._xor128 = xor128;
    this._palette = palette.copy().shuffle(this._xor128);

    this._flip = new Array(2).fill(0).map(() => this._xor128.pick([-1, 1]));

    this._gates = new Array(this._gates_num)
      .fill(0)
      .map(() => GateFactory.randomGate(this._xor128));

    this._current_gate = 0;

    this._states = new Array(this._cols)
      .fill(0)
      .map(() => this._xor128.random());
  }

  _update(states, gates) {
    let new_states = [];
    for (let x = 0; x < this._cols; x++) {
      const gate = gates[this._current_gate];
      this._current_gate = (this._current_gate + 1) % this._gates_num;
      const left = states[x];
      const right = states[(x + 1) % this._cols];
      let new_state = gate.apply(left, right);
      new_states.push(new_state);
    }
    return new_states;
  }

  _easeInOutPoly(t, n = 3) {
    if (t < 0.5) {
      return 0.5 * Math.pow(2 * t, n);
    } else {
      return 1 - 0.5 * Math.pow(2 * (1 - t), n);
    }
  }

  draw(ctx) {
    const bg_size = Math.ceil(this._size);
    const cell_size = this._size / this._cols;
    const w = Math.ceil(cell_size * 0.5);
    const h = Math.ceil(cell_size);
    const dx = (cell_size - w) / 2;
    const dy = (cell_size - h) / 2;

    ctx.save();

    ctx.fillStyle = this._palette.colors[0].rgba;
    ctx.fillRect(0, 0, bg_size, bg_size);

    ctx.translate(this._size / 2, this._size / 2);
    ctx.scale(this._flip[0], this._flip[1]);
    ctx.translate(-this._size / 2, -this._size / 2);

    let r = 0;
    while (r < this._rows) {
      const y = r * cell_size;

      this._states.forEach((state, c) => {
        if (c > 0 && c < this._cols - 1 && r > 0 && r < this._rows - 1) {
          const color_index = Math.floor(state * this._palette.length);
          const current_color = this._palette.getColor(color_index);

          const x = c * cell_size;
          ctx.fillStyle = current_color.rgba;
          ctx.fillRect(x + dx, y + dy, w, h);
        }
      });
      r++;

      this._states = this._update(this._states, this._gates);
    }

    ctx.restore();
  }
}

export { Grid };
