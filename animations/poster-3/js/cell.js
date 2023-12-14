import { Color } from "./engine.js";

class Letter {
  constructor(x, y, size, xor128, level = 1) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._xor128 = xor128;
    this._level = level;

    this._scl = 0.9;
    this._fg = [
      new Color(255, 255, 0),
      new Color(255, 0, 255),
      new Color(0, 255, 255),
    ];

    this._can_split = false;
    this._inner_thickness = 0.1;

    this._can_split =
      this._level == 1 ? true : this._level < 3 && this._xor128.random() < 0.75;

    this._draw = this._level == 1 ? true : this._xor128.random() < 0.85;
  }

  _drawCircle(ctx) {
    const r2 = this._size / 2;
    const r1 = r2 * (1 - this._inner_thickness);

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r2, 0, Math.PI * 2, false);
    ctx.arc(0, 0, r1, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  }

  _drawTriangle(ctx) {
    const r2 = this._size / 2;
    const r1 = r2 * (1 - this._inner_thickness * 2);

    ctx.save();
    ctx.beginPath();

    for (let i = 0; i < 3; i++) {
      const theta = (i * Math.PI * 2) / 3;
      const x = r2 * Math.cos(theta);
      const y = r2 * Math.sin(theta);
      if (i == 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = 0; i < 3; i++) {
      const theta = -((i * Math.PI * 2) / 3);
      const x = r1 * Math.cos(theta);
      const y = r1 * Math.sin(theta);
      if (i == 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.fill();
    ctx.restore();
  }

  _drawLines(ctx) {
    const n = 4;
    const w = this._size / (2 * n);
    ctx.save();
    ctx.translate(-this._size / 2, 0);

    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.rect(w * (2 * i + 0.5), -this._size / 2, w, this._size);
      ctx.stroke();
      ctx.fill();
    }
    ctx.restore();
  }

  _drawGrid(ctx) {
    const cols = 4;
    const w = this._size / cols;

    ctx.save();
    ctx.translate(-this._size / 2, -this._size / 2);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < cols; j++) {
        if ((i + j) % 2 == 0) continue;
        ctx.beginPath();
        ctx.rect(i * w, j * w, w, w);
        ctx.stroke();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  _drawX(ctx) {
    const w = this._size / 8;
    ctx.save();
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    for (let i = 0; i < 2; i++) {
      ctx.rotate((i * Math.PI) / 2);
      ctx.rect(-w / 2, -this._size / 2, w, this._size);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawRectTriangle(ctx) {
    ctx.save();
    ctx.translate(-this._size / 2, -this._size / 2);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this._size, 0);
    ctx.lineTo(this._size, this._size);
    ctx.lineTo(0, 0);

    ctx.fill();
    ctx.restore();
  }

  _drawBox(ctx) {
    const outer = (this._size / 2) * 0.95;
    const inner = outer * (1 - this._inner_thickness);
    ctx.save();

    // clockwise
    ctx.beginPath();
    ctx.moveTo(-outer, -outer);
    ctx.lineTo(outer, -outer);
    ctx.lineTo(outer, outer);
    ctx.lineTo(-outer, outer);
    ctx.lineTo(-outer, -outer);

    // counter-clockwise
    ctx.moveTo(-inner, -inner);
    ctx.lineTo(-inner, inner);
    ctx.lineTo(inner, inner);
    ctx.lineTo(inner, -inner);
    ctx.lineTo(-inner, -inner);

    ctx.fill();
    ctx.restore();
  }

  _drawSaw(ctx) {
    const n = 7;

    ctx.save();
    ctx.translate(-this._size / 2, -this._size / 2);
    ctx.lineWidth = this._size / 20;

    ctx.beginPath();

    ctx.moveTo(0, 0);
    for (let i = 0; i < n; i++) {
      const x = (i / n) * this._size;
      const y = i % 2 == 1 ? this._size : 0;
      ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.restore();
  }

  _drawTarget(ctx) {
    const r = this._size / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2, false);
    ctx.arc(0, 0, r / 2, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.restore();
  }

  _drawCircles(ctx) {
    const cols = 4;
    const w = this._size / (cols + 1);

    ctx.save();
    ctx.translate(-this._size / 2, -this._size / 2);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < cols; j++) {
        const x = i * w + w / 2;
        const y = j * w + w / 2;
        const dx = j % 2 == 0 ? 0 : w / 4;
        ctx.beginPath();
        ctx.arc(x + dx, y, (w / 2) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  show(ctx) {
    if (!this._draw) return;

    const draw_functions = [
      this._drawCircle,
      this._drawTriangle,
      this._drawLines,
      this._drawGrid,
      this._drawX,
      this._drawRectTriangle,
      this._drawBox,
      this._drawSaw,
      this._drawTarget,
      this._drawCircles,
    ];

    const rotation = this._xor128.random_int(4) * (Math.PI / 2);

    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);

    ctx.beginPath();
    ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
    ctx.clip();

    ctx.scale(this._scl, this._scl);

    ctx.rotate(rotation);
    ctx.globalCompositeOperation = "screen";

    const draw = this._xor128.pick(draw_functions);

    for (let i = 0; i < 3; i++) {
      const theta = (i / 3) * Math.PI * 2;
      ctx.save();
      ctx.strokeStyle = this._fg[i].rgba;
      ctx.fillStyle = this._fg[i].rgba;
      ctx.rotate(theta);
      ctx.translate(2, 0);
      ctx.rotate(-theta);
      draw.bind(this)(ctx);
      ctx.restore();
    }

    ctx.restore();
  }

  split() {
    if (!this._can_split) return [this];

    const cells = [];
    const cols = this._xor128.random_int(2, 5);
    const scl = this._size / cols;

    for (let i = 0; i < cols ** 2; i++) {
      const x = (i % cols) * scl;
      const y = Math.floor(i / cols) * scl;

      cells.push(
        new Letter(this._x + x, this._y + y, scl, this._xor128, this._level + 1)
      );
    }

    this._can_split = false;
    return cells;
  }

  get can_split() {
    return this._can_split;
  }

  get distance() {
    return Math.hypot(this._x, this._y);
  }
}

export { Letter };
