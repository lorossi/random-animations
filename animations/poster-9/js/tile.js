import { Color, Point } from "./engine.js";

class Tile {
  constructor(x, y, size, noise, scale = 0.9, noise_scl = 0.1) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._noise = noise;
    this._scale = scale;
    this._noise_scl = noise_scl;

    this._fg = this._selectFg();
    this._draw = this._selectDrawFunction();
  }

  _selectDrawFunction() {
    const functions = [
      this._drawCircle,
      this._drawCutCircle,
      this._drawTriangle,
      this._drawSquare,
    ];
    const n = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      1000
    );
    const index = Math.floor(((n + 1) / 2) * functions.length);
    return functions[index];
  }

  _selectFg() {
    const colors = ["#ef476f", "#fb5607", "#ff006e", "#3a86ff", "#8338ec"];

    const n = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      2000
    );
    const index = Math.floor(((n + 1) / 2) * colors.length);
    return Color.fromHEX(colors[index]);
  }

  _drawCircle(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, this._size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawTriangle(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-this._size / 2, 0);
    ctx.lineTo(this._size / 2, -this._size / 2);
    ctx.lineTo(this._size / 2, this._size / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawCutCircle(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(-this._size / 2, 0, this._size / 2, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this._size / 2, 0, this._size / 2, Math.PI / 2, (Math.PI * 3) / 2);
    ctx.fill();
    ctx.restore();
  }

  _drawSquare(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
    ctx.fill();
    ctx.restore();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scale, this._scale);
    ctx.fillStyle = this._fg.rgba;

    this._draw(ctx);

    ctx.restore();
  }
}

export { Tile };
