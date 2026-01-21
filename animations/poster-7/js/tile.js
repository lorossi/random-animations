import { Color, Point } from "./lib.js";

class Tile {
  constructor(x, y, size, xor128, scale = 0.9, empty_probability = 0.1) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._xor128 = xor128;
    this._scale = scale;

    this._empty = this._xor128.random() < empty_probability;
    this._count = this._xor128.random_int(2, 6);
    this._rotation = (this._xor128.random_int(4) * Math.PI) / 2;

    this._draw = this._selectDrawFunction();
    this._colors = [
      new Color(0, 255, 255),
      new Color(255, 0, 255),
      new Color(255, 255, 0),
    ];
    this._d_pos = [
      new Point(1 * Math.SQRT2, 1 * Math.SQRT2),
      new Point(-1 * Math.SQRT2, 1 * Math.SQRT2),
      new Point(0, -1),
    ];
  }

  _selectDrawFunction() {
    const functions = [
      this._drawLines,
      this._drawGrid,
      this._drawCircle,
      this._drawTriangle,
      this._drawX,
      this._drawTarget,
    ];
    return this._xor128.pick(functions).bind(this);
  }

  _drawLines(ctx) {
    const line_scl = this._size / this._count / 2;

    ctx.save();
    for (let i = 0; i < this._count; i++) {
      ctx.fillRect(
        -this._size / 2 + line_scl * 2 * i,
        -this._size / 2,
        line_scl,
        this._size,
      );
    }
    ctx.restore();
  }

  _drawGrid(ctx) {
    const grid_scl = this._size / this._count;
    ctx.save();

    for (let i = 0; i < this._count; i += 2) {
      for (let j = 0; j < this._count; j += 2) {
        ctx.fillRect(
          -this._size / 2 + grid_scl * i,
          -this._size / 2 + grid_scl * j,
          grid_scl,
          grid_scl,
        );
      }
    }

    ctx.restore();
  }

  _drawCircle(ctx) {
    const radius = this._size * 0.425;

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawTriangle(ctx) {
    const radius = this._size * 0.425;
    const angle = (Math.PI * 2) / 3;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    for (let i = 1; i < 3; i++) {
      ctx.lineTo(Math.sin(angle * i) * radius, -Math.cos(angle * i) * radius);
    }
    ctx.fill();
    ctx.restore();
  }

  _drawX(ctx) {
    const radius = this._size * 0.425;
    const line_scl = radius / 10;
    ctx.save();
    ctx.lineWidth = line_scl;
    ctx.beginPath();
    ctx.moveTo(-radius, -radius);
    ctx.lineTo(radius, radius);
    ctx.moveTo(radius, -radius);
    ctx.lineTo(-radius, radius);
    ctx.stroke();

    ctx.restore();
  }

  _drawTarget(ctx) {
    const max_radius = this._size * 0.425;
    const line_scl = max_radius / this._count / 2;

    ctx.save();
    ctx.lineWidth = line_scl;
    for (let i = 0; i < this._count; i++) {
      const radius = (max_radius / this._count) * (i + 1);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);

      ctx.stroke();
    }

    ctx.restore();
  }

  draw(ctx) {
    if (this._empty) return;

    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scale, this._scale);
    ctx.rotate(this._rotation);

    ctx.globalCompositeOperation = "screen";

    this._colors.forEach((color, i) => {
      const rho = 1;
      ctx.save();
      ctx.translate(this._d_pos[i].x * rho, this._d_pos[i].y * rho);
      ctx.fillStyle = color.rgb;
      ctx.strokeStyle = color.rgb;
      this._draw(ctx);
      ctx.restore();
    });

    ctx.restore();
  }
}

export { Tile };
