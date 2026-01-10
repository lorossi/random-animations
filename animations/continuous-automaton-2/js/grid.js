import { Color, XOR128 } from "./lib.js";

class HexagonGrid {
  constructor(slots, grid_size, hexagon_scl, seed, palette) {
    this._slots = slots;
    this._grid_size = grid_size;
    this._hexagon_scl = hexagon_scl;
    this._seed = seed;
    this._palette = palette;

    this._init();
  }

  _init() {
    this._cols = this._slots + 1;
    this._hex_size = (this._grid_size / this._slots / Math.sqrt(3)) * 2;
    this._hex_width = Math.sqrt(3) * (this._hex_size / 2);
    this._hex_height = this._hex_size * (3 / 4);
    this._rows = Math.floor(this._grid_size / this._hex_height) + 1;

    this._current_i = this._cols * 2 + 2;

    this._xor128 = new XOR128(this._seed);
    this._states = new Array(this._cols * this._rows)
      .fill(0)
      .map(() => this._xor128.random());

    this._k = this._xor128.random(0.005, 0.025);
  }

  _indexToXY(index) {
    const x = index % this._cols;
    const y = Math.floor(index / this._cols);
    return [x, y];
  }

  _xyToIndex(x, y) {
    return y * this._cols + x;
  }

  _easeInOutPoly(t, n = 3) {
    if (t < 0.5) return 0.5 * Math.pow(2 * t, n);
    return 1 - 0.5 * Math.pow(2 * (1 - t), n);
  }

  _drawHexagon(index, ctx) {
    const [row, col] = this._indexToXY(index);

    const x = this._hex_width * row;
    const dx = col % 2 === 0 ? 0 : this._hex_width / 2;
    const y = this._hex_height * col;

    const t = this._states[index];
    const color = this._palette.getSmoothColor(t, this._easeInOutPoly);

    ctx.save();
    ctx.translate(x + dx, y);

    ctx.fillStyle = color.rgba;
    ctx.strokeStyle = color.rgba;

    ctx.beginPath();
    const angle = (2 * Math.PI) / 6;
    const size = (this._hex_size / 2) * this._hexagon_scl;

    for (let i = 0; i < 6; i++) {
      const x = size * Math.cos(i * angle - Math.PI / 2);
      const y = size * Math.sin(i * angle - Math.PI / 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  _getNeighboursIndices(index) {
    const [x, y] = this._indexToXY(index);

    // It's correct for odd
    const directions = [
      [0, -1], // top-left
      [1, -1], // top-right
      [-1, 0], // left
      [1, 0], // right
      [0, 1], // bottom-left
      [1, 1], // bottom-right
    ];

    const neighbours = [];

    directions.forEach(([dx, dy]) => {
      let nx = x + dx;
      let ny = y + dy;

      // Adjust for even/odd rows
      if (y % 2 === 0 && (dy == -1 || dy == 1)) {
        nx -= 1;
      }

      if (nx >= 0 && nx < this._cols && ny >= 0 && ny < this._rows) {
        neighbours.push(this._xyToIndex(nx, ny));
      }
    });
    return neighbours;
  }

  _stateFunction(neighbours) {
    const avg =
      (neighbours
        .map((index) => this._states[index])
        .reduce((sum, val) => sum + val, 0) /
        neighbours.length) %
      1;

    return (avg + this._k) % 1;
  }

  update() {
    this._current_i = (this._current_i + 1) % this._states.length;
    const new_states = [...this._states];

    this._states.forEach((_, index) => {
      const neighbours_indices = this._getNeighboursIndices(index);
      new_states[index] = this._stateFunction(neighbours_indices);
    });

    this._states = new_states;
  }

  show(ctx) {
    ctx.save();
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";

    this._states.forEach((_, index) => {
      ctx.save();
      this._drawHexagon(index, ctx);
      ctx.restore();
    });

    ctx.restore();
  }
}

export { HexagonGrid };
