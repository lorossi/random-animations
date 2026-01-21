import { Color, XOR128 } from "./lib.js";

class Hexagon {
  constructor(x, y, size, size_delta, seed) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._size_delta = size_delta;

    this._fg = Color.fromMonochrome(230);

    this.l = this._size / 2;
    this.f = 1 / (2 * Math.tan(Math.PI / 6)); // fixed number for hexagon
    this.a = (this._size / 2) * this.f;

    this._seed = seed;
    this._setupRandom();

    this._hexagon = this.createChild();
  }

  createChild() {
    if (this._size < this._size_delta * 2) return null;

    return HexagonFactory.createRandomHexagon(
      this._x,
      this._y,
      this._size - this._size_delta,
      this._size_delta,
      this._seed,
      this._xor128,
    );
  }

  _setupRandom() {
    this._xor128 = new XOR128(this._seed);
  }

  update(t) {
    if (this._hexagon) this._hexagon.update(t);
  }

  show(ctx) {
    ctx.save();

    if (this._hexagon) this._hexagon.show(ctx);
    ctx.restore();

    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = this._fg.rgba;
    ctx.fillStyle = this._fg.rgba;
    this._drawHexagon(ctx);
    this.drawShape(ctx);
    ctx.restore();
  }

  _drawHexagon(ctx) {
    ctx.beginPath();

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = this.l * Math.cos(angle);
      const y = this.l * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.stroke();
    ctx.clip();
  }

  drawShape(ctx) {}

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get size() {
    return this._size;
  }
}

class EmptyHexagon extends Hexagon {
  createChild() {
    return null;
  }
}

class LineHexagon extends Hexagon {
  createChild() {
    return null;
  }

  drawShape(ctx) {
    ctx.save();
    ctx.beginPath();
    if (this._xor128.random() < 0.5) {
      const len = this.l;
      ctx.moveTo(0, len);
      ctx.lineTo(0, len);
    } else {
      const len = this.l;
      ctx.moveTo(-len, 0);
      ctx.lineTo(len, 0);
    }
    ctx.stroke();

    ctx.restore();
  }
}

class TriangleHexagon extends Hexagon {
  createChild() {
    return null;
  }

  drawShape(ctx) {
    const rotation = this._xor128.random_int(6) * (Math.PI / 3);
    ctx.save();

    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 + rotation;
      const x = this.l * Math.cos(angle);
      const y = this.l * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.stroke();
    ctx.restore();
  }
}

class GridHexagon extends Hexagon {
  createChild() {
    return null;
  }

  drawShape(ctx) {
    const cols = 3;
    const cl = this.l / cols;

    ctx.save();
    ctx.translate(-this.l, -this.l);
    for (let x = 0; x < cols; x++) {
      const cx = (x + 0.5) * (cl * 2);
      for (let y = 0; y < cols; y++) {
        const cy = (y + 0.5) * (cl * 2);

        ctx.beginPath();
        ctx.rect(cx - cl, cy - cl, cl * 2, cl * 2);
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

class CirclesHexagon extends Hexagon {
  createChild() {
    return null;
  }

  drawShape(ctx) {
    const cols = 3;
    const cr = this.l / cols;

    ctx.save();
    ctx.translate(-this.l, -this.l);
    for (let x = 0; x < cols; x++) {
      const cx = (x + 0.5) * (cr * 2);
      for (let y = 0; y < cols; y++) {
        const cy = (y + 0.5) * (cr * 2);

        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

class HexagonFactory {
  static createRandomHexagon(x, y, size, size_delta, seed, xor128) {
    const classes = [
      Hexagon,
      EmptyHexagon,
      LineHexagon,
      TriangleHexagon,
      GridHexagon,
      CirclesHexagon,
    ];
    const new_class = xor128.pick(classes);
    const new_seed = xor128.random_int(1e16);

    return new new_class(x, y, size, size_delta, new_seed);
  }
}

export { Hexagon };
