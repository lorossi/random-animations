import { Color } from "./lib.js";

class Box {
  constructor(x, y, scl, box_scl) {
    this._x = x;
    this._y = y;
    this._scl = scl;
    this._box_scl = box_scl;

    this._fg_color = Color.fromMonochrome(245);
    this._start_angle = 0;
    this._end_angle = Math.PI / 2;

    this._phi = 0;
    this._rotation = 0;
  }

  setFgColor(fg) {
    this._fg_color = fg;
  }

  setNoise(noise, noise_scl) {
    this._noise = noise;
    this._noise_scl = noise_scl;

    const n1 = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      1000,
    );
    const n2 = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      2000,
    );

    this._phi = this._remap(n1, -1, 1, 0, 1);
    this._rotation = Math.floor(this._remap(n2, -1, 1, 0, 4));
  }

  setXor128(xor128) {
    this._xor128 = xor128;
    this._phi = this._xor128.random();
    this._rotation = this._xor128.random_int(4);
  }

  update(t) {
    const tt = this._wrap(t + this._phi, 0, 1);
    const eased = this._easeInOutPoly(tt, 2);
    this._updateAngles(eased);
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x + this._scl / 2, this._y + this._scl / 2);
    ctx.rotate((this._rotation * Math.PI) / 2);
    ctx.translate(-this._scl / 2, -this._scl / 2);
    ctx.scale(this._box_scl, this._box_scl);
    ctx.fillStyle = this._fg_color.rgb;
    ctx.strokeStyle = "red";

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, this._scl, this._start_angle, this._end_angle);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  _updateAngles(t) {
    if (t < 0.5) {
      this._start_angle = 0;
      this._end_angle = this._remap(t, 0, 0.5, 0, Math.PI / 2);
    } else {
      this._end_angle = Math.PI / 2;
      this._start_angle = this._remap(t, 0.5, 1, 0, Math.PI / 2);
    }
  }

  _remap(x, old_min = 0, old_max = 1, new_min = 0, new_max = 1) {
    return (
      ((x - old_min) * (new_max - new_min)) / (old_max - old_min) + new_min
    );
  }

  _wrap(x, min = 0, max = 1) {
    while (x < min) x += max - min;
    while (x >= max) x -= max - min;
    return x;
  }

  _easeInOutPoly(x, n = 2) {
    return x < 0.5
      ? 0.5 * Math.pow(2 * x, n)
      : 1 - 0.5 * Math.pow(2 * (1 - x), n);
  }
}

export { Box };
