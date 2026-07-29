const NEIGHBOR_OFFSETS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

/** A single point of the growing aggregate, colored by the step it stuck on. */
class StuckPoint {
  constructor(x, y, age) {
    this._x = x;
    this._y = y;
    this._age = age;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get age() {
    return this._age;
  }
}

/** Handles the DLA (diffusion limited aggregation) simulation on a grid. */
class Accretion {
  /**
   * @param {number} width canvas width in px
   * @param {number} height canvas height in px
   * @param {number} cell_size size in px of each grid cell
   * @param {XOR128} rand seeded random source
   */
  constructor(width, height, cell_size, rand) {
    this._cell_size = cell_size;
    this._cols = Math.floor(width / cell_size);
    this._rows = Math.floor(height / cell_size);
    this._rand = rand;

    // grid stores null (empty) or a StuckPoint
    this._grid = new Array(this._cols * this._rows).fill(null);
    this._stuck_points = [];
    this._walkers = [];
    this._step_count = 0;

    // seed in the center
    const cx = Math.floor(this._cols / 2);
    const cy = Math.floor(this._rows / 2);
    this._stick(cx, cy);

    // max radius (in cells) any stuck point has reached from the center;
    // walkers spawn just outside this, keeping the walk cheap as the
    // aggregate grows instead of always spawning from the canvas edge
    this._max_radius = 0;
    this._cx = cx;
    this._cy = cy;
  }

  _index(x, y) {
    return y * this._cols + x;
  }

  _inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this._cols && y < this._rows;
  }

  _isStuck(x, y) {
    return this._inBounds(x, y) && this._grid[this._index(x, y)] != null;
  }

  _hasStuckNeighbor(x, y) {
    for (const [dx, dy] of NEIGHBOR_OFFSETS) {
      if (this._isStuck(x + dx, y + dy)) return true;
    }
    return false;
  }

  _stick(x, y) {
    const point = new StuckPoint(x, y, this._step_count);
    this._grid[this._index(x, y)] = point;
    this._stuck_points.push(point);

    const r = Math.hypot(x - this._cx, y - this._cy);
    if (r > this._max_radius) this._max_radius = r;
  }

  /** Spawn a new walker on a circle just outside the current aggregate. */
  _spawnWalker() {
    const spawn_radius = Math.min(
      this._max_radius + 8,
      Math.min(this._cols, this._rows) / 2 - 1,
    );
    const angle = this._rand.random(0, Math.PI * 2);
    const x = Math.round(this._cx + Math.cos(angle) * spawn_radius);
    const y = Math.round(this._cy + Math.sin(angle) * spawn_radius);

    this._walkers.push({ x, y });
  }

  /**
   * Advance the simulation by one step.
   * @param {number} [walkers_per_step=1] how many walkers to spawn this step
   * @param {number} [stick_probability=1] chance a touching walker sticks
   * @returns {boolean} true if a point stuck this step
   */
  step(walkers_per_step = 1, stick_probability = 1) {
    this._step_count++;

    for (let i = 0; i < walkers_per_step; i++) this._spawnWalker();

    // radius past which a wandering walker is considered lost and removed
    const kill_radius = this._max_radius + 24;

    let stuck_this_step = false;

    this._walkers = this._walkers.filter((w) => {
      // random walk step, 4-connected
      const dir = this._rand.random_int(4);
      if (dir === 0) w.x += 1;
      else if (dir === 1) w.x -= 1;
      else if (dir === 2) w.y += 1;
      else w.y -= 1;

      if (!this._inBounds(w.x, w.y)) return false;

      const r = Math.hypot(w.x - this._cx, w.y - this._cy);
      if (r > kill_radius) return false;

      if (this._hasStuckNeighbor(w.x, w.y)) {
        if (this._rand.random(0, 1) < stick_probability) {
          this._stick(w.x, w.y);
          stuck_this_step = true;
          return false;
        }
      }

      return true;
    });

    return stuck_this_step;
  }

  /**
   * Draw all stuck points to a canvas context, colored by age.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Palette} palette
   */
  draw(ctx, palette) {
    const max_age = Math.max(1, this._step_count);

    for (const point of this._stuck_points) {
      const t = point.age / max_age;
      const color = palette.getSmoothColor(t);

      ctx.fillStyle = color.rgba;
      ctx.fillRect(
        point.x * this._cell_size,
        point.y * this._cell_size,
        this._cell_size,
        this._cell_size,
      );
    }
  }

  get cellSize() {
    return this._cell_size;
  }

  get stuckPoints() {
    return this._stuck_points;
  }

  get walkerCount() {
    return this._walkers.length;
  }

  get stepCount() {
    return this._step_count;
  }
}

export { Accretion };
