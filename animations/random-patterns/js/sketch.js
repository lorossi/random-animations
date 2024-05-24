import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Pattern } from "./pattern.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._cols = 5;
    this._pattern_scl = 0.9;
    this._pattern_n = 10;
    this._pattern_circle_scl = 0.9;

    this._bg = Color.fromMonochrome(245);
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const pattern_size = this.width / this._cols;
    this._patterns = new Array(this._cols ** 2).fill().map((_, i) => {
      const x = (i % this._cols) * pattern_size;
      const y = Math.floor(i / this._cols) * pattern_size;
      const circle_seed = this._xor128.random_int(2 ** 32);
      return new Pattern(
        x,
        y,
        this._pattern_n,
        pattern_size,
        this._pattern_scl,
        this._pattern_circle_scl,
        circle_seed
      );
    });
  }

  draw() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this._bg.rgb;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._patterns.forEach((p) => p.show(this.ctx));

    this.ctx.restore();

    this.noLoop();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
