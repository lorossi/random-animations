import { Point } from "./engine.js";

class Line {
  constructor(length, range, seed, noise, xor128) {
    this._length = length;
    this._range = range;
    this._seed = seed;
    this._noise = noise;
    this._xor128 = xor128;

    this._noise_scl = 5;
    this._time_scl = 4;

    this._states_num = this._xor128.random_int(2, 5) * 2;
    this._visible = this._xor128.random_bool();
    this._current_state = 0;
    this._states = Array(this._states_num)
      .fill()
      .map(() => this._xor128.random())
      .sort();
  }

  _generate(nx, ny) {
    this._line = [new Point(0, 0), new Point(this._length, 0)];

    let range = this._range;
    while (range > 1) {
      // make one step of the displacement algorithm
      const new_line = [];
      for (let i = 0; i < this._line.length - 1; i++) {
        const p1 = this._line[i];
        const p2 = this._line[i + 1];

        const n = this._noise.noise(
          p1.x * this._noise_scl,
          p2.x * this._noise_scl,
          nx + this._seed,
          ny + this._seed
        );

        const mid_x = (p1.x + p2.x) / 2;
        const mid_y = (p1.y + p2.y) / 2 + n * range;

        new_line.push(new Point(mid_x, mid_y));
      }
      this._line = [...this._line, ...new_line].sort((a, b) => a.x - b.x);
      range /= 2;
    }
  }

  _setState(t) {
    if (this._states.every((s) => t > s)) return;

    if (t > this._states[this._current_state]) {
      this._current_state = (this._current_state + 1) % this._states.length;
      this._visible = !this._visible;
    }
  }

  _setAlpha(nx, ny) {
    const n = this._noise.noise(
      this._line[0].x * this._noise_scl,
      this._line[this._line.length - 1].x * this._noise_scl,
      nx + this._seed,
      ny + this._seed
    );

    this._alpha = (n + 1) / 4 + 0.25;
  }

  update(t) {
    const theta = t * Math.PI * 2;
    const nx = (1 + Math.cos(theta)) * this._time_scl;
    const ny = (1 + Math.sin(theta)) * this._time_scl;

    this._setState(t);
    this._generate(nx, ny);
    this._setAlpha(nx, ny);
  }

  show(ctx) {
    if (!this._visible) return;

    ctx.save();

    ctx.strokeStyle = `rgba(240, 240, 240, ${this._alpha})`;
    ctx.beginPath();
    ctx.moveTo(this._line[0].x, this._line[0].y);
    this._line.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // draw  a circle at the end
    ctx.fillStyle = "rgba(200, 200, 200, 0.75)";
    ctx.beginPath();
    ctx.arc(this._length, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export { Line };
