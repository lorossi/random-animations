class Circle {
  constructor(radius, bars_ratio, bars_num) {
    this._radius = radius;
    this._bars_ratio = bars_ratio;
    this._bars_num = bars_num;

    this._angle_dist = (Math.PI * 2) / this._bars_num;
    this._bar_width =
      (this._radius * (1 - this._bars_ratio) * 2 * Math.PI) /
      (2 * this._bars_num);
  }

  setAttributes(angle_offset, noise_scl, time_scl) {
    this._angle_offset = angle_offset;
    this._noise_scl = noise_scl;
    this._time_scl = time_scl;
  }

  setColors(color, outline) {
    this._color = color;
    this._outline = outline;
  }

  initDependencies(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;

    this._seed = this._xor128.random_int(1e9);
  }

  update(t) {
    const theta = Math.PI * 2 * t;
    const tx = (1 + Math.cos(theta)) * this._time_scl;
    const ty = (1 + Math.sin(theta)) * this._time_scl;

    this._bars = new Array(this._bars_num).fill(0).map((_, i) => {
      const phi = i * this._angle_dist + this._angle_offset;
      const nx = (1 + Math.cos(phi)) * this._noise_scl;
      const ny = (1 + Math.sin(phi)) * this._noise_scl;
      const n = this._noise.noise(tx, ty, nx + this._seed, ny + this._seed);
      return ((n + 1) / 2) * this._radius * this._bars_ratio;
    });
  }

  draw(ctx) {
    ctx.save();
    ctx.lineWidth = 1;
    ctx.fillStyle = this._color.rgba;
    ctx.strokeStyle = this._outline.rgba;

    ctx.rotate(this._angle_offset);
    this._bars.forEach((b, i) => {
      ctx.save();
      ctx.rotate(this._angle_dist * i);
      ctx.translate(this._radius * (1 - this._bars_ratio), 0);
      ctx.rotate(-Math.PI / 2);
      ctx.beginPath();
      ctx.rect(-this._bar_width / 2, 0, this._bar_width / 2, b);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();
  }
}

export { Circle };
