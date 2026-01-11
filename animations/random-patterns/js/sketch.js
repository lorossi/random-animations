import { Engine, Color, XOR128 } from "./lib.js";
import { Pattern } from "./pattern.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._pattern_scl = 0.95;
    this._pattern_circle_scl = 0.9;
    this._noise_scl = 0.02;

    this._bg = Color.fromMonochrome(230);
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    const pattern_n = this._xor128.random_int(8, 16);
    const cols = 5; //this._xor128.random_int(4, 10);

    const pattern_size = this.width / cols;
    this._patterns = new Array(cols ** 2).fill().map((_, i) => {
      const x = (i % cols) * pattern_size;
      const y = Math.floor(i / cols) * pattern_size;
      const circle_seed = this._xor128.random_int(2 ** 32);
      return new Pattern(
        x,
        y,
        pattern_n,
        pattern_size,
        this._pattern_scl,
        this._pattern_circle_scl,
        this._noise_scl,
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
