import { Point } from "./engine.js";

class Harmonic {
  constructor(A, omega, phi, d) {
    this._A = A;
    this._omega = omega;
    this._phi = phi;
    this._d = d;
  }

  calculate(t, damping = true) {
    const c = this._A * Math.sin(this._omega * t * Math.PI * 2 + this._phi);

    return damping ? c * Math.exp(-this._d * t) : c;
  }

  static random(xor128, max_a, max_omega, max_d) {
    const a = xor128.random(max_a);
    const f = xor128.random_int(2, max_omega);
    const phi = xor128.random(Math.PI * 2);
    const d = xor128.random(max_d);

    return new Harmonic(a, f, phi, d);
  }
}

class Harmonograph {
  constructor(x, y, scl) {
    this._x = x;
    this._y = y;
    this._scl = scl;

    this._max_a = this._scl / 2;
    this._max_omega = 6;
    this._max_d = 1;

    this._points = [];
  }

  setDependences(xor128) {
    this._xor128 = xor128;

    this._harmonics = new Array(2)
      .fill(null)
      .map(() =>
        new Array(4)
          .fill(null)
          .map(() =>
            Harmonic.random(
              this._xor128,
              this._max_a,
              this._max_omega,
              this._max_d
            )
          )
      );
  }

  setAttributes(color) {
    this._color = color;
  }

  _calculate(t) {
    const [px, py] = this._harmonics.map((hs) =>
      hs.reduce((p, h) => p + h.calculate(t), 0)
    );
    return new Point(px, py);
  }

  update(t) {
    const p = this._calculate(t);
    if (this._points.length < 2) {
      this._points.push(p);
      return;
    }

    this._points.shift();
    this._points.push(p);

    return;
  }

  draw(ctx) {
    if (this._points.length < 2) return;

    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.strokeStyle = this._color.rgba;
    ctx.beginPath();
    ctx.moveTo(this._points[0].x, this._points[0].y);
    ctx.lineTo(this._points[1].x, this._points[1].y);
    ctx.stroke();
    ctx.restore();
  }
}

export { Harmonograph };
