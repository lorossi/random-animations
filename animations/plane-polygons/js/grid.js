class Line {
  constructor(theta, rho, speed) {
    this._theta = theta;
    this._rho = rho;
    this._speed = speed;

    this._t = 0;
    this._calculateEndPoint(0);
  }

  _calculateEndPoint(gamma) {
    this._x = this._rho * Math.cos(this._theta + gamma);
    this._y = this._rho * Math.sin(this._theta + gamma);
  }

  update(t) {
    this._t = t;
    const gamma = this._t * Math.PI * 2 * this._speed;
    this._calculateEndPoint(gamma);
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }
}

class Rect {
  constructor(x, y, w, h, depth, palette, xor128) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
    this._depth = depth;
    this._palette = palette;
    this._xor128 = xor128;

    this._children = [];
    this._min_size = 100;
    this._gamma = 0;

    this._generateLines();
    this._extractColors();
    this._generateCenter();
  }

  _generateLines() {
    const lines_num = this._xor128.random_int(3, 5);
    const thetas = new Array(lines_num)
      .fill(0)
      .map(() => this._xor128.random(Math.PI * 2));
    const directions = new Array(lines_num)
      .fill(0)
      .map(() => (this._xor128.random_bool() ? 1 : -1));

    const rho = Math.hypot(this._w, this._h) * Math.SQRT2;
    this._lines = thetas.map(
      (theta, i) => new Line(theta, rho, directions[i] * i),
    );
  }

  _extractColors() {
    const all_colors = this._palette.copy().colors;
    this._bg = all_colors.shift();
    this._line_colors = this._xor128.shuffle(all_colors);
  }

  _generateCenter() {
    const rho = Math.hypot(this._w, this._h) / 10;
    const theta = this._xor128.random(Math.PI * 2);
    this._center_x = rho * Math.cos(theta);
    this._center_y = rho * Math.sin(theta);
  }

  split() {
    if (Math.min(this._w, this._h) < this._min_size) return;

    if (this._w > this._h) this._splitVertically();
    else this._splitHorizontally();

    this._children.forEach((child) => child.split());
  }

  show(ctx) {
    if (this._children.length > 0) {
      this._children.forEach((child) => child.show(ctx));
      return;
    }

    ctx.save();
    ctx.fillStyle = this._bg.rgba;
    // clip rectangle
    ctx.beginPath();
    ctx.rect(this._x, this._y, this._w, this._h);
    ctx.fill();
    ctx.clip();

    // translate to center
    ctx.translate(
      this._x + this._w / 2 + this._center_x,
      this._y + this._h / 2 + this._center_y,
    );
    ctx.rotate(this._gamma);

    // fill triangles between lines
    for (let i = 0; i < this._lines.length; i++) {
      const line1 = this._lines[i];
      const line2 =
        i == this._lines.length - 1 ? this._lines[0] : this._lines[i + 1];

      const color = this._line_colors[i % this._line_colors.length];
      ctx.fillStyle = color.rgba;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(line1.x, line1.y);
      ctx.lineTo(line2.x, line2.y);
      ctx.closePath();
      ctx.fill();
    }

    // Draw circle at the center
    ctx.beginPath();
    // ctx.arc(0, 0, this._rho / 10, 0, Math.PI * 2, false);
    ctx.stroke();

    ctx.restore();
  }

  update(t) {
    if (this._children.length > 0) {
      this._children.forEach((child) => child.update(t));
      return;
    }

    this._gamma = t * Math.PI * 2;
    this._lines.forEach((line) => line.update(t));
  }

  _splitHorizontally() {
    const split_pos = this._xor128.random_interval(0.5, 0.25);
    const h1 = this._h * split_pos;
    const h2 = this._h * (1 - split_pos);

    const r1 = new Rect(
      this._x,
      this._y,
      this._w,
      h1,
      this._depth + 1,
      this._palette,
      this._xor128,
    );
    const r2 = new Rect(
      this._x,
      this._y + h1,
      this._w,
      h2,
      this._depth + 1,
      this._palette,
      this._xor128,
    );

    this._children.push(r1);
    this._children.push(r2);
  }

  _splitVertically() {
    const split_pos = 0.3 + this._xor128.random() * 0.4;
    const w1 = this._w * split_pos;
    const w2 = this._w * (1 - split_pos);

    const r1 = new Rect(
      this._x,
      this._y,
      w1,
      this._h,
      this._depth + 1,
      this._palette,
      this._xor128,
    );
    const r2 = new Rect(
      this._x + w1,
      this._y,
      w2,
      this._h,
      this._depth + 1,
      this._palette,
      this._xor128,
    );

    this._children.push(r1);
    this._children.push(r2);
  }
}

class Grid {
  constructor(w, h, palette, xor128) {
    this._w = w;
    this._h = h;
    this._palette = palette;
    this._xor128 = xor128;

    this._root = new Rect(0, 0, w, h, 0, palette, xor128);
  }

  get root() {
    return this._root;
  }

  split() {
    this._root.split();
  }

  update(t) {
    this._root.update(t);
  }

  show(ctx) {
    this._root.show(ctx);
  }
}

export { Grid };
