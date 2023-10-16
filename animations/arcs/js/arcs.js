import { Color } from "./engine.js";

class Arc {
  constructor(scl, noise, random) {
    this._noise = noise;
    this._random = random;

    this._r = this._random.random(scl / 4, scl / 2);
    this._seed = this._random.random(1e9);

    this._grey = this._random.random_int(80, 170);
    this._black = this._random.random_int(20, 60);
    this._alpha = this._random.random(0.05, 0.1);
  }

  move(tx, ty) {
    const n1 = this._noise.noise(tx, ty, this._seed, 0);
    const n2 = this._noise.noise(tx, ty, 0, this._seed);

    this._theta = n1 * Math.PI * 2;
    this._phi = ((n2 + 1) / 2) * Math.PI * 2;
  }

  show(ctx) {
    ctx.save();
    ctx.fillStyle = Color.fromMonochrome(this._grey, this._alpha).rgba;
    ctx.strokeStyle = Color.fromMonochrome(this._black, this._alpha).rgba;
    ctx.rotate(this._theta);
    ctx.beginPath();
    ctx.arc(0, 0, this._r, 0, this._phi);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

class Line {
  constructor(scl, noise, random) {
    this._noise = noise;
    this._random = random;

    this._r = (this._random.random(0.4, 1) * scl) / 2;
    this._alpha = this._random.random(0.4, 0.6);
    this._red = this._random.random_int(230, 255);

    this._seed = random.random(1e9);
  }

  move(tx, ty) {
    const n = this._noise.noise(tx, ty, this._seed, 0);
    this._theta = ((n + 1) / 2) * Math.PI * 6;
  }

  show(ctx) {
    ctx.save();
    ctx.strokeStyle = new Color(this._red, 0, 0, this._alpha).rgba;
    ctx.rotate(this._theta);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this._r, 0);
    ctx.stroke();
    ctx.restore();
  }
}

class Shape {
  constructor(x, y, scl, noise, random) {
    this._x = x;
    this._y = y;
    this._scl = scl;
    this._zoom = 0.9;

    this._arcs_num = 5;
    this._lines_num = 10;

    this._arcs = Array(this._arcs_num)
      .fill(null)
      .map(() => new Arc(this._scl, noise, random));
    this._lines = Array(this._lines_num)
      .fill(null)
      .map(() => new Line(this._scl, noise, random));
  }

  move(tx, ty) {
    this._arcs.forEach((a) => a.move(tx, ty));
    this._lines.forEach((l) => l.move(tx, ty));
  }

  show(ctx) {
    ctx.save();
    ctx.translate((this._x + 0.5) * this._scl, (this._y + 0.5) * this._scl);
    ctx.scale(this._zoom, this._zoom);
    this._arcs.forEach((a) => a.show(ctx));
    this._lines.forEach((l) => l.show(ctx));
    ctx.restore();
  }
}

export { Shape };
