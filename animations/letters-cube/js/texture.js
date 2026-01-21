import { Color, XOR128 } from "./lib.js";

class Texture {
  constructor(size, scale, seed) {
    this._size = size;
    this._scale = scale;
    this._seed = seed;

    this._xor128 = new XOR128(this._seed);
    this._canvas = this._generateCanvas();
  }

  _generateCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = this._size;
    canvas.height = this._size;
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < this._size; x += this._scale) {
      for (let y = 0; y < this._size; y += this._scale) {
        const ch = this._xor128.random_int(127);
        const c = Color.fromMonochrome(ch, 0.1);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._scale, this._scale);
      }
    }

    return canvas;
  }

  draw(ctx) {
    const dx = Math.floor(
      (this._size - ctx.canvas.width) * this._xor128.random(),
    );
    const dy = Math.floor(
      (this._size - ctx.canvas.height) * this._xor128.random(),
    );

    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(
      this._canvas,
      dx,
      dy,
      this._size,
      this._size,
      0,
      0,
      this._size,
      this._size,
    );
    ctx.restore();
  }
}

export { Texture };
