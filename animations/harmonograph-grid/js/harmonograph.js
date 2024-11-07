import { Point } from "./engine.js";

class Harmonic {
  constructor(A, omega, phi) {
    this._A = A;
    this._omega = omega;
    this._phi = phi;
  }

  calculate(t) {
    return this._A * Math.sin(this._omega * t * Math.PI * 2 + this._phi);
  }

  copy() {
    return new Harmonic(this._A, this._omega, this._phi);
  }
}

class Harmonograph {
  constructor(x, y, size, phi = 0) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._phi = phi;
    this._ended = false;

    this._points = [];
    this._harmonics = [];
    this._history = new Set();
  }

  setFgColor(fg_color) {
    this._fg_color = fg_color;
  }

  setArmonics(harmonics) {
    this._harmonics = harmonics.map((h) => h.copy());
  }

  _calculate(t) {
    const tt = t * Math.PI * 2 + this._phi;

    const [px, py] = this._harmonics.reduce(
      ([px, py], h, i) => {
        if (i % 2 === 0) {
          const x = h.calculate(tt);
          return [px + x, py];
        }
        const y = h.calculate(tt);
        return [px, py + y];
      },
      [0, 0]
    );

    const p = new Point(px, py);

    if (this._checkEnded(p)) this._ended = true;
    else this._history.add(p);

    return p;
  }

  _checkEnded(p) {
    let intersection_count = 0;
    for (const h of this._history) {
      if (h.distance(p) < 1) intersection_count++;
      if (intersection_count > 2) return true;
    }
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
    ctx.strokeStyle = this._fg_color.rgba;
    ctx.beginPath();
    ctx.moveTo(this._points[0].x, this._points[0].y);
    ctx.lineTo(this._points[1].x, this._points[1].y);
    ctx.stroke();
    ctx.restore();
  }

  get ended() {
    return this._ended;
  }
}

export { Harmonograph, Harmonic };
