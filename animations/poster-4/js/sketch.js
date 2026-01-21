import { Engine, XOR128, Color } from "./lib.js";
import { Cell } from "./cell.js";

class Sketch extends Engine {
  preload() {
    this._fg = Color.fromHEX("#353535");
    this._bg = Color.fromHEX("#fcf8f3");
    this._scl = 0.95;
    this._texture_size = 4;
    this._cols = 6;
    this._reserved_cells = 2;
    this._show_bias = 0.8;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._cols = this._xor128.random_int(5, 12);

    const cell_size = this.width / this._cols;
    this._cells = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = (i % this._cols) * cell_size;
      const y = Math.floor(i / this._cols) * cell_size;

      const cell = new Cell(x, y, cell_size, this._show_bias);
      cell.setAttributes(this._fg);
      cell.injectDependencies(this._xor128);
      return cell;
    });

    this._font_loaded = false;
    document.fonts.load("10pt Ronda").then(() => (this._font_loaded = true));

    document.body.style.backgroundColor = this._bg.rgb;
  }

  draw() {
    if (!this._font_loaded) return;
    this.noLoop();

    this._cells.forEach((c) => c.update(this.ctx));

    this.ctx.save();
    this.background(this._bg.rgba);
    this.scaleFromCenter(this._scl);

    // reserve 2 cells for text
    // valid positions: first 2 cells, last 2 cells, first 2 cells of the last row, last 2 cells of the first row
    const left = this._xor128.random_bool();
    const top = this._xor128.random_bool();

    let reserved_cells = [];
    if (left && top) reserved_cells = this._cells.slice(0, 2);
    else if (!left && top) {
      const start = this._cols - 2;
      reserved_cells = this._cells.slice(start, start + 2);
    } else if (left && !top) {
      const start = this._cols * (this._cols - 1);
      reserved_cells = this._cells.slice(start, start + 2);
    } else if (!left && !top) {
      const start = this._cols * this._cols - 2;
      reserved_cells = this._cells.slice(start, start + 2);
    }

    reserved_cells.forEach((c) => (c.draw = false));
    this._cells.forEach((c) => c.show(this.ctx));

    // draw text
    const last_cell = reserved_cells[reserved_cells.length - 1];
    const first_cell = reserved_cells[0];
    const text_h = last_cell.size / 3.2;

    const text_x = left ? first_cell.x : last_cell.x + first_cell.size;

    const text_y = top
      ? first_cell.y + first_cell.size
      : last_cell.y + last_cell.size - text_h * 3;
    const text = ["more", "pretentious", "shit"];

    this.ctx.save();
    this.ctx.fillStyle = this._fg.rgba;
    this.ctx.font = `${text_h}px Ronda`;

    this.ctx.textAlign = left ? "left" : "right";
    this.ctx.textBaseline = top ? "bottom" : "top";

    if (top) {
      text
        .reverse()
        .forEach((t, i) => this.ctx.fillText(t, text_x, text_y - text_h * i));
    } else {
      text.forEach((t, i) => this.ctx.fillText(t, text_x, text_y + text_h * i));
    }

    this.ctx.restore();

    this.ctx.restore();

    this._addTexture();
  }

  _addTexture() {
    this.ctx.save();
    for (let x = 0; x < this.width; x += this._texture_size) {
      for (let y = 0; y < this.height; y += this._texture_size) {
        const n = this._xor128.random(100);
        const c = Color.fromMonochrome(n, 0.04);

        this.ctx.fillStyle = c.rgba;
        this.ctx.fillRect(x, y, this._texture_size, this._texture_size);
      }
    }
    this.ctx.restore();
  }

  _polyEase(x, n = 3) {
    return 1 - (1 - x) ** n;
  }

  click() {
    this.setup();
    this.loop();
  }
}

export { Sketch };
