import { Color } from "./engine.js";
import { Walker } from "./walker.js";
import { XOR128 } from "./xor128.js";
import { Palette } from "./palette-factory.js";

class Grid {
  constructor(cols, size) {
    this._cols = cols;
    this._size = size;
    this._scl = size / cols;
    this._walkers = [];

    this._walkers_line_num = 4;
    this._palette = new Palette([Color.fromMonochrome(245)]);
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._grid = new Array(cols)
      .fill(null)
      .map(() => new Array(cols).fill(false));
  }

  setRandomSeed(seed) {
    this._seed = seed;
    this._xor128 = new XOR128(seed);
  }

  setPalette(color) {
    this._palette = color;
  }

  setNoiseScl(scl) {
    this._noise_scl = scl;
  }

  setWalkerLineNum(num) {
    this._walkers_line_num = num;
  }

  addWalker() {
    let x, y;
    while (true) {
      x = this._xor128.random_int(this._cols);
      y = this._xor128.random_int(this._cols);

      if (!this._grid[x][y]) {
        this._grid[x][y] = true;
        break;
      }
    }
    const walker = new Walker(
      x,
      y,
      this._cols,
      this._cols,
      this._walkers_line_num
    );

    const seed = this._xor128.random_int(1e16);

    walker.setSeed(seed);
    walker.setGrid(this._grid);
    walker.setPalette(this._palette);
    walker.setNoiseScl(this._noise_scl);

    this._walkers.push(walker);
  }

  update() {
    const new_walkers = [];
    this._walkers.forEach((w) => {
      w.update();
      if (w.getCanSplit()) new_walkers.push(w.split());
      new_walkers.push(w);
    });
    this._walkers = new_walkers;
    return this._walkers.every((w) => w.getHasEnded());
  }

  show(ctx) {
    ctx.save();
    this._walkers.forEach((w) => w.show(ctx, this._scl));
    ctx.restore();
  }
}

export { Grid };
