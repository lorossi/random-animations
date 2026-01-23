import { Engine, XOR128, Color } from "./lib.js";
import { SudokuLoader } from "./sudokuloader.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.9;
    this._bg = Color.fromMonochrome(245);
    this._text_color = Color.fromMonochrome(30);
    this._tentative_color = Color.fromRGB(139, 0, 0);
    this._tentative_background = Color.fromRGB(255, 0, 0, 0.25);
    this._solution_background = Color.fromRGB(0, 128, 0, 0.25);
    this._font = "RobotoMono";

    this._instant_solve = false; // set to true to instantly solve the sudoku without animation
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._sudoku = SudokuLoader.loadSudoku(this._xor128);
    this._original_sudoku = this._sudoku.map((row) => row.slice());
    this._solved = false;
    this._tries = 0;
    this._stack = [];

    this._font_loaded = false;
    document.fonts
      .load(`12px ${this._font}`)
      .then(() => (this._font_loaded = true));
  }

  draw() {
    if (!this._font_loaded) return;

    this.ctx.save();
    this.background(this._bg);

    this.ctx.save();
    this.scaleFromCenter(this._scl);
    this._drawSudoku();
    this.ctx.restore();

    this._writeStats();
    this.ctx.restore();

    if (this._solved) return;

    if (this._instant_solve) this._solved = this._sudokuSolve();
    else this._solved = this._sudokuStep();
  }

  click() {
    this.setup();
  }

  _sudokuSolve() {
    while (!this._sudokuStep()) {}
    return true;
  }

  _sudokuStep() {
    this._tries++;
    if (this._countMissing() == 0) return true;

    if (this._stack.length == 0) {
      // place the first number
      const [nx, ny] = this._placeNextNumber();
      this._stack.push([nx, ny]);
      return false;
    }

    // check if the last placed number is valid
    const [lx, ly] = this._stack[this._stack.length - 1];
    if (this._checkValid(lx, ly)) {
      const [nx, ny] = this._placeNextNumber();
      if (nx == null) return true;
      this._stack.push([nx, ny]);
      return false;
    }

    // if the last placed number is not valid, check its value
    if (this._sudoku[ly][lx] < 9) {
      this._sudoku[ly][lx]++;
      return false;
    }

    // if the last placed number is 9, backtrack
    this._sudoku[ly][lx] = 0;
    // we're taking for granted that the sudoku is solvable => the stack is not empty at this point

    this._stack.pop();
    // increment the last number
    const [px, py] = this._stack[this._stack.length - 1];
    this._sudoku[py][px]++;

    return false;
  }

  _drawSudoku() {
    const box_scl = this.width / 9;
    const num_scl = box_scl * 0.75;
    this.ctx.save();

    // write numbers
    this.ctx.save();
    this.ctx.font = `${num_scl}px RobotoMono`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const n = this._sudoku[y][x];
        // the number 0 represents an empty cell
        // the number 10 represents a number that was placed by the algorithm and has to be decremented in the next iteration
        if (n == 0 || n == 10) continue;

        const in_stack =
          !this._solved && this._stack.some(([sx, sy]) => sx == x && sy == y);
        // if the number is in the stack, color it differently
        if (in_stack) {
          this.ctx.fillStyle = this._tentative_color.rgba;
        } else {
          this.ctx.fillStyle = this._text_color.rgba;
        }

        this.ctx.fillText(n, (x + 0.5) * box_scl, (y + 0.525) * box_scl);

        // if the number is in the stack, or the sudoku is solved and the cell is part of the missing numbers,
        // color the cell differently
        if (this._solved && this._original_sudoku[y][x] == 0) {
          this.ctx.fillStyle = this._solution_background.rgba;
          this.ctx.fillRect(x * box_scl, y * box_scl, box_scl, box_scl);
        } else if (in_stack) {
          this.ctx.fillStyle = this._tentative_background.rgba;
          this.ctx.fillRect(x * box_scl, y * box_scl, box_scl, box_scl);
        }
      }
    }

    // draw grid
    this.ctx.save();
    this.ctx.strokeStyle = this._text_color.rgba;

    for (let i = 0; i < 10; i++) {
      if (i % 3 == 0) this.ctx.lineWidth = 4;
      else this.ctx.lineWidth = 1;

      const x = i * box_scl;
      const y = i * box_scl;

      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    this.ctx.restore();

    this.ctx.restore();
  }

  _writeStats() {
    // write stats
    this.ctx.save();
    const height = (this.height * (1 - this._scl)) / 2;
    const stats_size = height * 0.5;
    const stats = `tries: ${this._tries} - missing: ${this._countMissing()}`;

    this.ctx.fillStyle = this._text_color.rgba;
    this.ctx.font = `${stats_size}px RobotoMono`;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "bottom";

    this.ctx.fillText(stats, 0, -stats_size / 2);
    this.ctx.restore();
  }

  _countMissing() {
    return 81 - this._sudoku.flat().filter((n) => n != 0).length;
  }

  _findFirstFree() {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (this._sudoku[y][x] == 0) return [x, y];
      }
    }

    return null;
  }

  _placeNextNumber() {
    const [x, y] = this._findFirstFree();
    if (x == null) return [];

    this._sudoku[y][x] = 1;
    return [x, y];
  }

  _allUnique(slice) {
    const digits = new Array(10).fill(false);
    for (let i = 0; i < 9; i++) {
      const n = slice[i];
      if (n == 0) continue;

      if (digits[n]) return false;
      digits[n] = true;
    }

    return true;
  }

  _checkValid(x, y) {
    if (this._sudoku[y][x] > 9) return false;
    return this._checkRow(y) && this._checkCol(x) && this._checkSquare(x, y);
  }

  _checkRow(y) {
    return this._allUnique(this._sudoku[y]);
  }

  _checkCol(x) {
    const col = [];
    for (let y = 0; y < 9; y++) col.push(this._sudoku[y][x]);
    return this._allUnique(col);
  }

  _checkSquare(x, y) {
    const sx = x - (x % 3); // square top left x
    const sy = y - (y % 3); // square top left y

    const square = [];
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        square.push(this._sudoku[sy + dy][sx + dx]);
      }
    }

    return this._allUnique(square);
  }
}

export { Sketch };
