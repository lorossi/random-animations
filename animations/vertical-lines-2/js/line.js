class Section {
  constructor(length, color) {
    this._length = length;
    this._color = color;
  }

  get length() {
    return this._length;
  }

  set length(length) {
    this._length = length;
  }

  get color() {
    return this._color;
  }

  set color(color) {
    this._color = color;
  }
}

class Line {
  constructor(x, height, width, sections_num) {
    this._x = x;
    this._height = height;
    this._width = width;
    this._sections_num = sections_num;

    this._sections = [];
    this._dy = 0.02 * this._height;
    this._dx = 0.01 * this._height;
  }

  injectDependencies(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;

    this._seed = this._xor128.random_int(1e9);
  }

  setPalette(palette) {
    this._palette = palette.copy();
  }

  setAttributes(noise_scl, time_scl) {
    this._noise_scl = noise_scl;
    this._time_scl = time_scl;
  }

  update(t) {
    if (this._sections.length == 0) this._createSections();

    const theta = Math.PI * 2 * t;
    const nx = (1 + Math.cos(theta)) * this._time_scl;
    const ny = (1 + Math.sin(theta)) * this._time_scl;

    const heights = new Array(this._sections_num).fill(null).map((_, i) => {
      const n = this._noise.noise(nx, ny, i * this._noise_scl, this._seed);
      return Math.max(Math.abs(n), 0.1);
    });
    const heights_sum = heights.reduce((a, b) => a + b, 0);

    this._sections.forEach(
      (s, i) =>
        (s.length =
          (heights[i] / heights_sum) *
          (this._height - this._sections_num * this._dy))
    );
  }

  show(ctx) {
    const w = this._width - 2 * this._dx;

    ctx.save();
    ctx.translate(this._x, 0);

    this._sections.forEach((s) => {
      ctx.fillStyle = s.color.rgba;

      ctx.beginPath();
      ctx.rect(this._dx, 0, w, s.length);
      ctx.fill();

      ctx.translate(0, s.length + this._dy);
    });

    ctx.restore();
  }

  _createSections() {
    this._palette.shuffle(this._xor128);

    this._sections = new Array(this._sections_num)
      .fill(null)
      .map(
        (_, i) => new Section(0, this._palette.colors[i % this._palette.length])
      );
  }
}

export { Line };
