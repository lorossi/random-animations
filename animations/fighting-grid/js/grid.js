class GridPoint {
  constructor(x, y, r) {
    this._x = x;
    this._y = y;
    this._r = r;

    this._neighbors = [];
    this._picked = false;
  }

  addNeighbors(neighbors) {
    this._neighbors = neighbors;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get picked() {
    return this._picked;
  }

  set picked(value) {
    this._picked = value;
  }

  get neighbors() {
    return this._neighbors;
  }
}

class GridGroup {
  constructor(start_point, color) {
    start_point.picked = true;

    this._points = [start_point];
    this._color = color;
  }

  availableNeighbors() {
    return this._points.map((p) => p.neighbors.filter((n) => !n.picked)).flat();
  }

  grow(point) {
    point.picked = true;
    this._points.push(point);
  }

  show(ctx) {
    ctx.save();
    ctx.strokeStyle = this._color.rgb;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    let drawn = [];
    this._points.forEach((p) => {
      p.neighbors
        .filter((n) => !drawn.includes(n))
        .filter((n) => this._points.includes(n))
        .forEach((n) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
          drawn.push(n);
        });
    });
    ctx.restore();
  }
}

export { GridPoint, GridGroup };
