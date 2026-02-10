class Grid {
  constructor(size, scl) {
    this._size = size;
    this._scl = scl;

    this._slots = this._size / this._scl;
    this._grid = [];
    this._gradient = [];
  }

  update(points) {
    this._grid = new Array(this._slots ** 2).fill().map((_, i) => {
      const x = i % this._slots;
      const y = Math.floor(i / this._slots);

      const d = points.reduce((acc, pp) => {
        const p = pp.get_xy();
        const dist =
          Math.abs(x - p.x / this._scl) + Math.abs(y - p.y / this._scl);
        return Math.min(acc, dist * pp.strength);
      }, Infinity);
      return d;
    });
  }

  _xy_to_i(x, y) {
    return x * this._slots + y;
  }

  _i_to_xy(i) {
    const x = i % this._slots;
    const y = Math.floor(i / this._slots);
    return [x, y];
  }

  _point_to_i(p) {
    return this._xy_to_i(p.x, p.y);
  }

  _i_to_point(i) {
    const [x, y] = this._i_to_xy(i);
    return new Point(x, y);
  }

  show(ctx, scl, palette) {
    ctx.save();
    for (let i = 0; i < this._grid.length; i++) {
      const t = Math.floor(this._grid[i] / 16);
      const c = palette.getColor(t);

      ctx.fillStyle = c.rgba;
      const [x, y] = this._i_to_xy(i);
      ctx.fillRect(x * scl, y * scl, scl, scl);
    }
    ctx.restore();
  }
}

export { Grid };
