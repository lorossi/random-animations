class Bar {
  constructor(x, width, height, seed) {
    this._x = x;
    this._max_height = height;
    this._width = width;
    this._seed = seed;
    this._palette = ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"];
    this._heights = Array(this._palette.length)
      .fill(0)
      .map((_) => 0);
    this._generateHeights();
  }

  _easeInOut(x, n = 4) {
    return x < 0.5
      ? Math.pow(2, n - 1) * Math.pow(x, n)
      : 1 - Math.pow(-2 * x + 2, n) / 2;
  }

  _generateHeights(theta = 0) {
    const temp_heights = Array(this._palette.length)
      .fill(null)
      .map((_, i) => {
        const h = Math.abs(Math.cos(theta + this._seed + (i / Math.PI) * 3));
        return this._easeInOut(h);
      });

    const sum = temp_heights.reduce((a, b) => b + a, 0);
    this._heights = temp_heights.map((h) => (h / sum) * this._max_height);
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, 0);
    this._palette.forEach((c, i) => {
      const dy = i == 0 ? 0 : this._heights[i - 1];
      const height = this._heights[i];

      ctx.translate(0, dy);
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, this._width, height);
    });
    ctx.restore();
  }

  move(theta) {
    this._generateHeights(theta);
  }

  get seed() {
    return this._seed;
  }

  set seed(s) {
    this._seed = s;
    this._generateHeights();
  }
}
