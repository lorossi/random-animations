import { Color, XOR128 } from "./lib.js";

class Texture {
  constructor(size, scale, seed) {
    this._size = size;
    this._scale = scale;
    this._seed = seed;

    const xor128 = new XOR128(this._seed);
    this._canvas = this._generateCanvas(xor128);
  }

  _generateCanvas(xor128) {
    const canvas = document.createElement("canvas");
    canvas.width = this._size;
    canvas.height = this._size;
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < this._size; x += this._scale) {
      for (let y = 0; y < this._size; y += this._scale) {
        const ch = xor128.random_int(127);
        const c = Color.fromMonochrome(ch, 0.05);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._scale, this._scale);
      }
    }

    return canvas;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = "dodge";
    ctx.drawImage(this._canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }
}

export { Texture };
