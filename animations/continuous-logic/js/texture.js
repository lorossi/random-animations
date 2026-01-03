import { Color } from "../../rotations-deformations/js/engine.js";

class Texture {
  constructor(size, scale, xor128) {
    this._size = size;
    this._scale = scale;
    this._xor128 = xor128;

    this._canvas = null;
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

  update() {
    this._canvas = this._generateCanvas(this._xor128);
  }

  draw(ctx) {
    if (this._canvas === null)
      throw new Error("Texture not generated. Call update() before draw().");

    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(this._canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }
}

export { Texture };
