import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette } from "./palette.js";

class Sketch extends Engine {
  preload() {
    this._n_scl = 0.0025;
    this._t_scl = 0.5;
    this._noises_count = 3;
    this._scl = 5;
    this._duration = 600;
  }

  setup() {
    this._xor128 = new XOR128();
    this._offset = this._xor128.random();
    this._noises = new Array(this._noises_count + 1)
      .fill(0)
      .map(() => new SimplexNoise(this._xor128.random_int(1e9)));
    this._noises.forEach((n) => n.setDetail(2, 0.75));
    this._palette = new Palette(this._offset);
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;
    const a = t * Math.PI * 2;
    const tx = (1 + Math.cos(a)) * this._t_scl;
    const ty = (1 + Math.sin(a)) * this._t_scl;

    this.ctx.save();
    this.background("white");

    for (let x = 0; x < this.width; x += this._scl) {
      for (let y = 0; y < this.height; y += this._scl) {
        const h = this._warpNoise(x, y, tx, ty);
        const c = this._palette.interpolate(h);
        this.ctx.fillStyle = c.rgb;
        this.ctx.fillRect(x, y, this._scl, this._scl);
      }
    }

    this.ctx.restore();
  }

  _wrap(n) {
    while (n < 0) n += 1;
    while (n > 1) n -= 1;
    return n;
  }

  _warpNoise(x, y, tx, ty) {
    const [hx, hy] = this._warpedNoise(x, y, tx, ty);
    let n = this._noises[0].noise(
      hx * this._n_scl,
      hy * this._n_scl,
      tx * this._t_scl,
      ty * this._t_scl
    );

    return (n + 1) / 2;
  }

  _warpedNoise(x, y, tx, ty, level = 1) {
    if (level >= this._noises.length) return [x, y];

    const n = this._noises[level];
    const dx = n.noise(x * this._n_scl, y * this._n_scl, 10000 + tx);
    const dy = n.noise(x * this._n_scl, y * this._n_scl, 20000 + ty);

    return this._warpedNoise(x + dx, y + dy, tx, ty, level + 1);
  }

  click() {
    this.setup();
  }
}

export { Sketch };
