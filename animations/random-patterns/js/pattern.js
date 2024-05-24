import { XOR128 } from "./xor128.js";
import { Color } from "./engine.js";

class Pattern {
  constructor(x, y, n, size, scl, circle_scl, seed) {
    this._x = x;
    this._y = y;
    this._n = n;
    this._size = size;
    this._scl = scl;
    this._circle_scl = circle_scl;
    this._seed = seed;

    this._xor128 = new XOR128(seed);
    this._probability = this._xor128.random(0.15, 0.4);
  }

  _easeIn(t, n = 2) {
    return t ** n;
  }

  _easeOut(t, n = 2) {
    return 1 - (1 - t) ** n;
  }

  _drawCanvas() {
    // create a canvas that is a quarter of the size of the pattern
    const quarter_canvas = document.createElement("canvas");
    quarter_canvas.width = this._size / 2;
    quarter_canvas.height = this._size / 2;
    const quarter_ctx = quarter_canvas.getContext("2d");

    const fill_c = Color.fromHSL(this._xor128.random(0, 360), 40, 40);
    const shape = this._xor128.random_int(0, 2);

    // draw the pattern on the canvas
    quarter_ctx.save();
    const circle_r = this._size / (this._n + 1) / 4;
    for (let x = 0; x < this._n; x++) {
      for (let y = 0; y < this._n; y++) {
        if (this._xor128.random() >= this._probability) continue;

        const a = this._xor128.random(0.5, 1);
        const xx = (x + 0.5) * (this._size / this._n / 2);
        const yy = (y + 0.5) * (this._size / this._n / 2);

        quarter_ctx.save();
        quarter_ctx.translate(xx, yy);
        quarter_ctx.scale(this._circle_scl, this._circle_scl);

        quarter_ctx.beginPath();
        switch (shape) {
          case 0: // circle
            quarter_ctx.arc(0, 0, circle_r, 0, Math.PI * 2);
            break;
          case 1: // square
            quarter_ctx.rect(-circle_r, -circle_r, circle_r * 2, circle_r * 2);
            break;
        }

        quarter_ctx.closePath();

        fill_c.a = a;
        quarter_ctx.fillStyle = fill_c.rgba;
        quarter_ctx.fill();
        quarter_ctx.restore();
      }
    }
    quarter_ctx.restore();

    // create a new canvas
    // the top left quarter is the same as the original canvas
    // the top right quarter is the original canvas flipped horizontally
    // the bottom left quarter is the original canvas flipped vertically
    // the bottom right quarter is the original canvas flipped horizontally and vertically
    this._canvas = document.createElement("canvas");
    this._canvas.width = this._size;
    this._canvas.height = this._size;

    const ctx = this._canvas.getContext("2d");
    ctx.save();

    ctx.drawImage(quarter_canvas, 0, 0);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(quarter_canvas, -this._size, 0);
    ctx.restore();

    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(quarter_canvas, 0, -this._size);
    ctx.restore();

    ctx.save();
    ctx.scale(-1, -1);
    ctx.drawImage(quarter_canvas, -this._size, -this._size);
    ctx.restore();

    ctx.restore();
  }

  show(ctx) {
    // paste the pre-drawn canvas on the main canvas
    this._drawCanvas();

    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl, this._scl);
    ctx.translate(-this._size / 2, -this._size / 2);

    ctx.drawImage(this._canvas, 0, 0);

    ctx.restore();
  }
}

export { Pattern };
