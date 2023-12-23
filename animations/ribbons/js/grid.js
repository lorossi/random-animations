const DIRECTIONS = {
  EAST: 0,
  SOUTH: 1,
  WEST: 2,
  NORTH: 3,
};

class Walker {
  constructor(x, y, heading = null) {
    this._x = x;
    this._y = y;
    this._heading = heading;
    this._seed = 0;

    this._ended = false;
    this._moves = 0;
  }

  injectDependencies(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;

    this._seed = this._xor128.random_int(1e9);
  }

  move() {
    if (this._ended) return;

    const nx = this._x * 0.1;
    const ny = this._y * 0.1;
    const n = this._noise.noise(nx, ny, this._seed);
    this._heading = Object.values(DIRECTIONS)[Math.floor((n + 1) * 2)];

    switch (this._heading) {
      case DIRECTIONS.EAST:
        this._x++;
        break;
      case DIRECTIONS.SOUTH:
        this._y++;
        break;
      case DIRECTIONS.WEST:
        this._x--;
        break;
      case DIRECTIONS.NORTH:
        this._y--;
        break;
    }

    this._moves++;
  }

  get x() {
    return this._x;
  }

  set x(xx) {
    this._x = xx;
  }

  get y() {
    return this._y;
  }

  set y(yy) {
    this._y = yy;
  }

  get ended() {
    return this._ended;
  }

  set ended(e) {
    this._ended = e;
  }
}

class Cell {
  constructor(x, y, size, direction = null, previous = null) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._direction = direction;
    this._previous = previous;

    this._lines = 5;
    this._lines_scl = 0.75;
  }

  _drawLines(ctx) {
    const w = (this._size * this._lines_scl) / this._lines / 2;

    ctx.save();
    ctx.translate(-this._size / 2, -this._size / 2);

    for (let i = 0; i < this._lines; i++) {
      const y =
        (this._size * (1 - this._lines_scl)) / 2 +
        w / 2 +
        (i * this._size * this._lines_scl) / this._lines;
      ctx.beginPath();
      ctx.rect(0, y, this._size, w);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawCurves(ctx) {
    const w = (this._size * this._lines_scl) / this._lines / 2;

    ctx.save();

    for (let i = 0; i < this._lines; i++) {
      const r =
        (this._size * (1 - this._lines_scl)) / 2 +
        w / 2 +
        ((i * this._size) / this._lines) * this._lines_scl;

      ctx.save();

      ctx.beginPath();
      ctx.arc(-this._size / 2, -this._size / 2, r, 0, Math.PI * 2, true);
      ctx.arc(-this._size / 2, -this._size / 2, r + w, 0, Math.PI * 2, false);
      ctx.clip();

      ctx.beginPath();
      ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
      ctx.clip();

      ctx.beginPath();
      ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  _showDirection(ctx, direction) {
    ctx.rotate((direction * Math.PI) / 2);
    this._drawLines(ctx);
  }

  _joinDirections(ctx, previous_direction, current_direction) {
    const rotation_map = [
      {
        a: 0,
        b: 1,
        angle: 3,
      },
      {
        a: 1,
        b: 2,
        angle: 0,
      },
      {
        a: 2,
        b: 3,
        angle: 1,
      },
      {
        a: 3,
        b: 0,
        angle: 0,
      },
    ];

    const rotation = rotation_map.find(
      (r) =>
        (r.a == previous_direction && r.b == current_direction) ||
        (r.a == current_direction && r.b == previous_direction)
    );

    if (rotation == null) {
      console.log("rotation is null");
      return;
    }

    if (current_direction < previous_direction) ctx.scale(-1, -1);

    ctx.rotate((rotation.angle * Math.PI) / 2);
    this._drawCurves(ctx, -this._size / 2, this._size);
  }

  show(ctx) {
    if (this._direction == null) return;

    ctx.save();
    ctx.translate(this._size * (this._x + 0.5), this._size * (this._y + 0.5));

    if (
      this._previous == null ||
      this._previous.direction == null ||
      this._previous.direction == this._direction
    )
      this._showDirection(ctx, this._direction);
    else this._joinDirections(ctx, this._previous.direction, this._direction);

    ctx.restore();
  }

  get direction() {
    return this._direction;
  }

  set direction(d) {
    this._direction = d;
  }

  get previous() {
    return this._previous;
  }

  set previous(p) {
    this._previous = p;
  }
}

class Grid {
  constructor(cols, size) {
    this._cols = cols;
    this._size = size;
    this._fg = null;

    const cell_size = size / cols;
    this._grid = new Array(cols * cols).fill(null).map((_, i) => {
      const x = i % cols;
      const y = Math.floor(i / cols);
      return new Cell(x, y, cell_size);
    });
    this._walkers = [];
  }

  setColor(fg) {
    this._fg = fg;
  }

  injectDependencies(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;
  }

  addRandomWalker() {
    const x = this._xor128.random_int(this._cols);
    const y = this._xor128.random_int(this._cols);

    const walker = new Walker(x, y);
    walker.injectDependencies(this._xor128, this._noise);

    this._walkers.push(walker);
  }

  update() {
    this._walkers.forEach((w) => {
      const start_x = w.x;
      const start_y = w.y;

      w.move();

      const end_x = w.x;
      const end_y = w.y;

      let current = this._grid[end_x + end_y * this._cols];
      let previous = this._grid[start_x + start_y * this._cols];

      if (
        end_x < 0 ||
        end_x > this._cols - 1 ||
        end_y < 0 ||
        end_y > this._cols - 1
      ) {
        w.ended = true;
      }

      if (current == undefined && previous != undefined) current = previous;

      if (current != undefined && current.direction == null) {
        current.previous = previous;

        if (start_x == end_x) {
          // moved vertically
          if (end_y < start_y) previous.direction = DIRECTIONS.NORTH;
          else previous.direction = DIRECTIONS.SOUTH;
        } else if (start_y == end_y) {
          // moved horizontally
          if (end_x < start_x) previous.direction = DIRECTIONS.WEST;
          else previous.direction = DIRECTIONS.EAST;
        }
      }
    });

    this._walkers = this._walkers.filter((w) => !w.ended);
  }

  show(ctx) {
    ctx.save();

    ctx.fillStyle = this._fg.rgba;
    ctx.strokeStyle = this._fg.rgba;
    this._grid.forEach((g) => g.show(ctx));

    ctx.restore();
  }
}

export { Grid };
