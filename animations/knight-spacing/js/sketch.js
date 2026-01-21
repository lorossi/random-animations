import { Engine, XOR128, Color } from "./lib.js";
class Sketch extends Engine {
  preload() {
    this._cols = 201; // must be odd
    this._bg = Color.fromMonochrome(15);
    this._knight_color = Color.fromHEX("#8B0000");
    this._final_color = Color.fromMonochrome(245);

    this._initial_knights = 3;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._grid = new Array(this._cols * this._cols).fill(-1);
    this._ended = false;
    this._current_step = 0;

    this._knights = [];

    let placed = 0;
    while (placed < this._initial_knights) {
      const x = this._xor128.random_int(this._cols);
      const y = this._xor128.random_int(this._cols);

      const idx = this._xyToI(x, y);
      if (this._knights.includes(idx)) continue;

      this._knights.push(idx);
      this._grid[idx] = 0;
      placed++;
    }

    this._correctCanvasSize(1000);
  }

  draw() {
    if (this._ended) return;
    this._ended = this._step();

    this.ctx.save();
    this.background(this._bg);
    this._drawGrid(this.ctx);
    this.ctx.restore();
  }

  click() {
    this.setup();
  }

  _step() {
    if (this._knights.length == 0 && this._grid.every((i) => i >= 0))
      return true;

    const d_pos = [
      [-2, -1],
      [-2, 1],
      [2, -1],
      [2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
    ];

    let new_knights = [];
    for (let i = 0; i < this._knights.length; i++) {
      const k = this._knights[i];
      const [x, y] = this._iToXY(k);

      for (let j = 0; j < d_pos.length; j++) {
        const [dx, dy] = d_pos[j];
        const nx = x + dx;
        const ny = y + dy;

        if (nx < 0 || nx >= this._cols || ny < 0 || ny >= this._cols) continue;

        const idx = this._xyToI(nx, ny);
        if (this._grid[idx] >= 0) continue;

        this._grid[idx] = this._current_step;
        new_knights.push(idx);
      }
    }

    this._knights = new_knights;
    this._current_step++;

    return false;
  }

  _drawGrid(ctx) {
    const scl = this.width / this._cols;
    const max_step = Math.max(...this._grid);
    if (max_step === -1) return;

    ctx.save();

    this._grid.forEach((i, idx) => {
      if (i === -1) return;

      const [x, y] = this._iToXY(idx);
      const ch = this._easeOut(i / max_step) * 255;
      ctx.fillStyle = Color.fromMonochrome(ch).rgba;

      ctx.fillRect(x * scl, y * scl, scl, scl);
    });

    this._knights.forEach((i) => {
      const [x, y] = this._iToXY(i);
      ctx.fillStyle = this._knight_color.rgba;
      ctx.fillRect(x * scl, y * scl, scl, scl);
    });

    ctx.restore();
  }

  _iToXY(i) {
    const x = i % this._cols;
    const y = Math.floor(i / this._cols);
    return [x, y];
  }

  _xyToI(x, y) {
    return x + y * this._cols;
  }

  _correctCanvasSize(size = 1000) {
    const remainder = size - Math.floor(size / this._cols) * this._cols;
    this.canvas.width = size - remainder;
    this.canvas.height = size - remainder;
  }

  _easeOut(t, n = 1.5) {
    return 1 - Math.pow(1 - t, n);
  }
}

export { Sketch };
