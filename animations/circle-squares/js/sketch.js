import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._circles_scl = 0.95;
    this._bg = Color.fromMonochrome(230);
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._cols = this._xor128.random_int(6, 12);

    const palette = PaletteFactory.getRandomPalette(this._xor128, true);
    const circle_size = this.width / this._cols;

    this._circles = new Array(this._cols ** 2).fill(null).map((_, i) => {
      const x = (i % this._cols) * circle_size;
      const y = Math.floor(i / this._cols) * circle_size;
      const seed = this._xor128.random_int(1e6);
      return new Circle(x, y, circle_size, seed, this._circles_scl, palette);
    });

    document.body.style.background = this._bg.hex;

    this._frame_offset = this.frameCount;
  }

  draw() {
    this.ctx.save();

    this.background(this._bg);

    this.ctx.save();
    this.scaleFromCenter(this._scl);

    this._circles.forEach((circle) => circle.draw(this.ctx));

    this.ctx.restore();

    this._applyTexture();

    this.ctx.restore();
    this.noLoop();
  }

  click() {
    this.setup();
    this.draw();
  }

  _createTexture(texture_scl = 4) {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < this.width; x += texture_scl) {
      for (let y = 0; y < this.height; y += texture_scl) {
        const ch = this._xor128.random_int(0, 127);
        const c = Color.fromMonochrome(ch, 0.05);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, texture_scl, texture_scl);
      }
    }

    return canvas;
  }

  _applyTexture() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "dodge";
    const texture = this._createTexture(4);
    this.ctx.drawImage(texture, 0, 0);
    this.ctx.restore();
  }
}

export { Sketch };
