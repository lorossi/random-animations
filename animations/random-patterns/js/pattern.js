import { XOR128, Color, SimplexNoise } from "./lib.js";

class Pattern {
  constructor(x, y, n, size, scl, circle_scl, noise_scl, seed) {
    this._x = x;
    this._y = y;
    this._n = n;
    this._size = size;
    this._scl = scl;
    this._circle_scl = circle_scl;
    this._noise_scl = noise_scl;
    this._seed = seed;

    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._probability = this._xor128.random(0.3, 0.7);
  }

  _drawCircle(ctx, r) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  _drawRect(ctx, r) {
    ctx.beginPath();
    ctx.rect(-r, -r, r * 2, r * 2);
    ctx.closePath();
    ctx.fill();
  }

  _drawCanvas() {
    // create a canvas that is a quarter of the size of the pattern
    const quarter_canvas = document.createElement("canvas");
    quarter_canvas.width = this._size / 2;
    quarter_canvas.height = this._size / 2;
    const quarter_ctx = quarter_canvas.getContext("2d");

    const fill_c = Color.fromHSL(this._xor128.random(0, 360), 40, 50);
    const draw_f = this._xor128.pick([this._drawCircle, this._drawRect]);

    // draw the pattern on the canvas
    quarter_ctx.save();
    const circle_r = this._size / (this._n + 1) / 4;
    for (let x = 0; x < this._n; x++) {
      for (let y = 0; y < this._n; y++) {
        // const a = this._xor128.random(0.5, 1);
        const n1 = this._noise.noise(
          (((x + 0.5) * this._size) / this._n) * this._noise_scl,
          (((y + 0.5) * this._size) / this._n) * this._noise_scl,
          1000,
        );
        if ((n1 + 1) / 2 > this._probability) continue;

        const n2 = this._noise.noise(
          (((x + 0.5) * this._size) / this._n) * this._noise_scl,
          (((y + 0.5) * this._size) / this._n) * this._noise_scl,
          2000,
        );
        const a = ((n2 + 1) / 2) * 0.8 + 0.2;

        const xx = (x + 0.5) * (this._size / this._n / 2);
        const yy = (y + 0.5) * (this._size / this._n / 2);

        quarter_ctx.save();
        quarter_ctx.translate(xx, yy);
        quarter_ctx.scale(this._circle_scl, this._circle_scl);
        fill_c.a = a;
        quarter_ctx.fillStyle = fill_c.rgba;

        draw_f.call(this, quarter_ctx, circle_r);

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
