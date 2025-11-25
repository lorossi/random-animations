class Cell {
  constructor(
    x,
    y,
    size,
    direction,
    line_color,
    fill_color,
    noise,
    noise_scl,
    scl
  ) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._direction = direction;
    this._line_color = line_color;
    this._fill_color = fill_color;
    this._noise = noise;
    this._noise_scl = noise_scl;
    this._scl = scl;

    this._rotation = 0;
    this._dy = 0;
    this._radius = this._size * 0.35;
  }

  update(tx, ty) {
    const n1 = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      tx + 1000,
      ty + 1000
    );
    this._rotation = (n1 * Math.PI) / 2;

    const n2 = this._noise.noise(
      this._x * this._noise_scl,
      this._y * this._noise_scl,
      tx + 2000,
      ty + 2000
    );
    this._dy = (n2 * this._size) / 4;
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.rotate(this._rotation + (Math.PI / 4) * this._direction);
    ctx.scale(this._scl, this._scl);

    // Clip all the space below the line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-this._size / 2, this._dy);
    ctx.lineTo(this._size / 2, this._dy);
    ctx.lineTo(this._size / 2, this._size / 2);
    ctx.lineTo(-this._size / 2, this._size / 2);
    ctx.closePath();
    ctx.clip();

    ctx.beginPath();
    ctx.arc(0, 0, this._radius - 1, 0, Math.PI * 2);
    ctx.clip();

    // Draw the filled square (lower part of the circle)

    ctx.fillStyle = this._fill_color.rgba;
    ctx.fillRect(-this._size / 2, -this._size / 2, this._size, this._size);

    ctx.restore();

    // Draw the outlines of the circle and the cutting line

    ctx.strokeStyle = this._line_color.rgba;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, this._radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-this._size / 2, this._dy);
    ctx.lineTo(this._size / 2, this._dy);
    ctx.stroke();

    ctx.restore();
  }
}

export { Cell };
