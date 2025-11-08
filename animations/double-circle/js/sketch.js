import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(200);
    this._scl = 0.8;
    this._texture_scl = 3;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128);
    this._palette = PaletteFactory.getRandomPalette(this._xor128);
    this._bg = this._palette.getColor(0);

    let circles = this._xor128.random_int(7, 15);
    if (circles % 2 === 0) circles++;
    this._rotation = this._xor128.random_interval(0, Math.PI / 90);

    this._circles = circles;

    document.body.style.backgroundColor = this._bg.rgba;
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg);

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.rotate(this._rotation);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    const lengths = this.width / (this._circles * 2);

    for (let i = 0; i < 2; i++) {
      this.ctx.save();
      this.ctx.translate(this.width / 2, this.height / 2);
      this.ctx.rotate(i * Math.PI);
      this.ctx.translate(-this.width / 2, -this.height / 2);

      for (let j = 0; j < this._circles; j++) {
        const x = (j + 1) * lengths;
        const l = (this.width / this._circles / 2) * (j + 1);
        const c = this._palette.getColor(i + 1).copy();
        const p = 1 - j / this._circles;
        const a = this._easeInExp(p, 3);
        c.a = this._remap(a, 0.1, 0.5);

        this.ctx.save();
        this.ctx.fillStyle = c.rgba;

        this.ctx.beginPath();
        this.ctx.arc(x, this.height / 2, l, 0, Math.PI);
        this.ctx.fill();
        this.ctx.restore();
      }
      this.ctx.restore();
    }
    this.ctx.restore();

    this._addNoise(this._texture_scl);
  }

  click() {
    this.setup();
    this.draw();
  }

  _addNoise(scl = 2) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "overlay";

    for (let i = 0; i < this.width; i += scl) {
      for (let j = 0; j < this.height; j += scl) {
        const ch = this._xor128.random(127);
        const c = Color.fromMonochrome(ch, 0.05);

        this.ctx.fillStyle = c.rgba;
        this.ctx.fillRect(i, j, scl, scl);
      }
    }

    this.ctx.restore();
  }

  _easeInExp(x, t = 1) {
    return Math.pow(2, t * x - t);
  }

  _remap(value, a, b) {
    return a + value * (b - a);
  }
}

export { Sketch };
