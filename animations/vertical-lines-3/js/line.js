class Line {
  constructor(x, length) {
    this._x = x;
    this._length = length;

    this._color = "black";
    this._points = [];
    this._has_break = false;
  }

  setNoise(noise, noise_scl, noise_dx) {
    this._noise = noise;
    this._noise_scl = noise_scl;
    this._noise_dx = noise_dx;
  }

  setColor(color) {
    this._color = color;
  }

  setBreak(break_y, break_length) {
    this._break_y = break_y;
    this._break_length = break_length;
    this._has_break = true;
  }

  update() {
    this._generatePoints();
  }

  _generatePoints() {
    this._points = [];
    for (let y = 0; y < this._length; y++) {
      let x = this._x;
      if (
        this._has_break &&
        y >= this._break_y &&
        y < this._break_y + this._break_length
      ) {
        const n = this._noise.noise(x * this._noise_scl, y * this._noise_scl);
        const dx = n * this._noise_dx;
        const a = (y - this._break_y) / this._break_length;
        const eased = this._ease(a);
        x += dx * eased;
      }
      this._points.push({ x, y });
    }
  }

  _ease(x, n = 0.8) {
    const theta = x * Math.PI;
    return Math.pow(Math.sin(theta), n);
  }

  draw(ctx) {
    ctx.strokeStyle = this._color.rgba;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this._points[0].x, this._points[0].y);
    for (let i = 1; i < this._points.length; i++) {
      ctx.lineTo(this._points[i].x, this._points[i].y);
    }
    ctx.stroke();
  }
}

export { Line };
