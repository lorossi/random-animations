import { Point, Color } from "./lib.js";

class Star {
  constructor(r, size, cols) {
    this._r = r;
    this._size = size;
    this._cols = cols;

    this._col_w = this._size / this._cols;
    this._seed = 0;
    this._star_color = Color.fromCSS("red");
    this._line_color = Color.fromCSS("red");
    this._noise = null;
    this._position = new Point(0, 0);
    this._old_position = null;

    this._update_ticks = 0;
    this._line_decay = 15;
  }

  update(nx, ny, tx, ty) {
    if (!this._noise) return;

    const n1 = this._noise.noise(nx + this._seed, ny + this._seed, tx, ty);
    const n2 = this._noise.noise(
      nx + this._seed,
      ny + this._seed,
      tx + 10000,
      ty + 10000,
    );
    const x = this._noiseToF(n1);
    const y = this._noiseToF(n2);

    this._position = new Point(x, y);

    if (this._old_position == null) this._old_position = this._position;

    if (this._old_position.equals(this._position)) {
      this._update_ticks++;
    } else {
      this._update_ticks = 0;
      this._old_position = this._position.copy();
    }
  }

  _noiseToF(n) {
    const x = (n + 1) / 2;
    const xx = this._remapInt(x, 0, 1, 0, this._cols - 1);

    return this._col_w * xx + this._col_w / 2;
  }

  _remap(x, old_min, old_max, new_min, new_max) {
    return Math.floor(
      ((x - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min,
    );
  }

  _remapInt(x, old_min, old_max, new_min, new_max) {
    return Math.floor(this._remap(x, old_min, old_max, new_min, new_max));
  }

  setSeed(seed) {
    this._seed = seed;
  }

  setNoise(noise) {
    this._noise = noise;
  }

  setStarColor(color) {
    this._star_color = color;
  }

  setLineColor(color) {
    this._line_color = color;
  }

  show(ctx) {
    const c = Math.exp(-this._update_ticks / this._line_decay) / Math.E;
    const s = this._line_color.copy();
    s.a = c;

    ctx.strokeStyle = s.rgba;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, this._position.y);
    ctx.lineTo(this._size, this._position.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this._position.x, 0);
    ctx.lineTo(this._position.x, this._size);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = this._star_color.rgba;
    ctx.arc(this._position.x, this._position.y, this._r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export { Star };
