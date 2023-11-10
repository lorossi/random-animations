class Line {
  constructor(angle, start, length) {
    this._angle = angle;
    this._start = start;
    this._length = length;
  }

  setAttributes(points_num, displacement, noise_scl, seed_scl) {
    this._points_num = points_num;
    this._displacement = displacement;
    this._noise_scl = noise_scl;
    this._seed_scl = seed_scl;

    this._seed_x = 10 * this._seed_scl * Math.cos(this._angle);
    this._seed_y = 10 * this._seed_scl * Math.sin(this._angle);
  }
  initDependencies(xor128, noise) {
    this._noise = noise;
    this._xor128 = xor128;
  }

  update(t) {
    const dl = this._length / this._points_num;
    this._points = new Array(this._points_num).fill(0).map((_, i) => {
      const x = i * dl;
      const y = 0;

      const nx = this._noise.noise(
        x * this._noise_scl,
        y * this._noise_scl,
        this._seed_x + t * 10,
        this._seed_y
      );
      const dx = nx * this._displacement;

      const ny = this._noise.noise(
        x * this._noise_scl,
        y * this._noise_scl,
        this._seed_x,
        this._seed_y + t * 10
      );
      const dy = ny * this._displacement;

      return { x: x + dx, y: y + dy };
    });
  }

  draw(ctx) {
    ctx.save();
    ctx.rotate(this._angle);
    ctx.translate(0, this._start);
    ctx.rotate(Math.PI / 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.01)";

    ctx.beginPath();
    this._points.forEach((p, i) => {
      if (i == 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.restore();
  }
}

export { Line };
