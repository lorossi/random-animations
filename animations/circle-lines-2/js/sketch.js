import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Circle } from "./circle.js";
import { PaletteFactory } from "./palette-factory.js";

class Sketch extends Engine {
  preload() {
    this._cols = 3;
    this._scl = 0.85;
    this._texture_scl = 3;
    this._noise_scl = 0.01;
    this._circle_scl = 0.9;
    this._segments_num = 200;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._palette = PaletteFactory.getRandomPalette(this._xor128);

    const circle_scl = this.width / this._cols;
    this._circles = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = (0.5 + (i % this._cols)) * circle_scl;
      const y = (0.5 + Math.floor(i / this._cols)) * circle_scl;
      const c = new Circle(x, y, circle_scl * this._circle_scl);
      c.setAttributes(
        this._palette.colors,
        this._noise_scl,
        this._segments_num
      );
      c.initDependencies(this._xor128, this._noise);
      return c;
    });

    this._texture = this._createTexture();

    this.background(this._palette.background.rgba);
    this._ctx.drawImage(this._texture, 0, 0);
    document.body.style.backgroundColor = this._palette.background.rgba;
    console.log(this._palette.background.hex);
  }

  draw() {
    this._ctx.save();
    // this._ctx.globalCompositeOperation = "multiply";
    this._ctx.translate(this.width / 2, this.height / 2);
    this._ctx.scale(this._scl, this._scl);
    this._ctx.translate(-this.width / 2, -this.height / 2);

    this._circles.forEach((circle) => {
      circle.update();
      circle.show(this._ctx);
    });
    this._ctx.restore();
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const r = this._xor128.random(127);
        const c = Color.fromMonochrome(r, 0.05);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return canvas;
  }

  click() {
    this.setup();
  }
}

export { Sketch };
