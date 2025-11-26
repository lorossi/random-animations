import { Color, SimplexNoise } from "./engine.js";
import { XOR128 } from "./xor128.js";

class Die {
  constructor(x, y, size, seed, noise_scl) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._seed = seed;
    this._noise_scl = noise_scl;

    this._scl = 0.8;
    this._inner_scl = 0.75;
    this._fg = Color.fromMonochrome(240);
    this._value = 0;
    this._simplex = new SimplexNoise(this._seed);
    this._xor128 = new XOR128(this._seed);

    this._rotated = this._xor128.random_bool();
  }

  update(tx, ty) {
    const n1 = this._simplex.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      tx,
      ty
    );
    this._value = Math.floor(((n1 + 1) / 2) * 6) + 1;

    const n2 = this._simplex.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      tx + 1000,
      ty + 1000
    );
    this._rotated = n2 > 0;
  }

  show(ctx) {
    if (this._value === 0) return;
    const cell_size = this._size / 3;

    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.translate(this._size / 2, this._size / 2);
    ctx.scale(this._scl, this._scl);
    if (this._rotated) ctx.rotate(Math.PI / 2);
    ctx.translate(-this._size / 2, -this._size / 2);

    // draw outline
    ctx.strokeStyle = this._fg.hex;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0, 0, this._size, this._size, this._size * 0.1);
    ctx.stroke();

    // scale again
    ctx.translate(this._size / 2, this._size / 2);
    ctx.scale(this._inner_scl, this._inner_scl);
    ctx.translate(-this._size / 2, -this._size / 2);

    // draw pips
    switch (this._value) {
      case 1:
        this._drawPip(ctx, this._size / 2, this._size / 2);
        break;
      case 2:
        this._drawPip(ctx, cell_size / 2, cell_size / 2);
        this._drawPip(
          ctx,
          this._size - cell_size / 2,
          this._size - cell_size / 2
        );
        break;
      case 3:
        this._drawPip(ctx, cell_size / 2, cell_size / 2);
        this._drawPip(ctx, this._size / 2, this._size / 2);
        this._drawPip(
          ctx,
          this._size - cell_size / 2,
          this._size - cell_size / 2
        );
        break;
      case 4:
        this._drawPip(ctx, cell_size / 2, cell_size / 2);
        this._drawPip(ctx, this._size - cell_size / 2, cell_size / 2);
        this._drawPip(ctx, cell_size / 2, this._size - cell_size / 2);
        this._drawPip(
          ctx,
          this._size - cell_size / 2,
          this._size - cell_size / 2
        );
        break;
      case 5:
        this._drawPip(ctx, cell_size / 2, cell_size / 2);
        this._drawPip(ctx, this._size - cell_size / 2, cell_size / 2);
        this._drawPip(ctx, this._size / 2, this._size / 2);
        this._drawPip(ctx, cell_size / 2, this._size - cell_size / 2);
        this._drawPip(
          ctx,
          this._size - cell_size / 2,
          this._size - cell_size / 2
        );
        break;
      case 6:
        this._drawPip(ctx, cell_size / 2, cell_size / 4);
        this._drawPip(ctx, this._size - cell_size / 2, cell_size / 4);
        this._drawPip(ctx, cell_size / 2, this._size / 2);
        this._drawPip(ctx, this._size - cell_size / 2, this._size / 2);
        this._drawPip(ctx, cell_size / 2, this._size - cell_size / 4);
        this._drawPip(
          ctx,
          this._size - cell_size / 2,
          this._size - cell_size / 4
        );
        break;
    }

    ctx.restore();
  }

  _drawPip(ctx, x, y) {
    const pip_radius = this._size / 12;
    ctx.fillStyle = this._fg.hex;
    ctx.beginPath();
    ctx.arc(x, y, pip_radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export { Die };
