import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(240);
    this._fg = Color.fromMonochrome(20);

    this._cols = 20;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._grid = new Grid(this._cols, this.width);
    this._grid.injectDependencies(this._xor128, this._noise);
    this._grid.setColor(this._fg);

    this._grid.addRandomWalker();
  }

  draw() {
    this.ctx.save();
    this.background(this._bg.rgba);
    this._grid.update();
    this._grid.show(this.ctx);
    this.ctx.restore();
  }

  click() {
    this.setup();
  }
}

export { Sketch };
