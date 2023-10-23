import { Point } from "./engine.js";

class CirclePoint extends Point {
  constructor(x, y) {
    super(x, y);
    this._toPolar();
  }

  static fromPolar(rho, theta) {
    const x = Math.cos(theta) * rho;
    const y = Math.sin(theta) * rho;
    return new CirclePoint(x, y);
  }

  _toXY() {
    this._x = Math.cos(this._theta) * this._rho;
    this._y = Math.sin(this._theta) * this._rho;
  }

  _toPolar() {
    this._rho = Math.sqrt(this._x ** 2 + this._y ** 2);
    this._theta = Math.atan2(this._y, this._x);
  }

  get rho() {
    return this._rho;
  }

  get theta() {
    return this._theta;
  }

  add(p) {
    this._x += p.x;
    this._y += p.y;
    this._toPolar();
    return this;
  }
}

export { CirclePoint };
