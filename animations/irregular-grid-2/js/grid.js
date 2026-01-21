import { XOR128 } from "./lib.js";

class Grid {
  constructor(size, cols, seed) {
    this._size = size;
    this._cols = cols;
    this._xor128 = new XOR128(seed);

    this._agents = [];
    this._empty_ratio = 0.2;
    this._min_agent_size = 3;

    this._grid = new Array(cols * cols).fill(null);
    this._empty_grid = new Array(cols * cols).fill(false);

    const empty_num = Math.floor(this._grid.length * this._empty_ratio);
    let i = 0;
    while (i < empty_num) {
      const index = this._xor128.random_int(this._grid.length);
      if (this._empty_grid[index]) continue;

      this._empty_grid[index] = true;
      i++;
    }
  }

  addAgent(agent) {
    this._agents.push(agent);
  }

  generate() {
    while (this._agents.some((agent) => !agent.ended)) {
      this._agents.forEach((agent) => {
        agent.expand();
      });
    }
  }

  clean() {}

  xyToIndex(x, y) {
    return y * this._cols + x;
  }

  indexToXY(index) {
    return {
      x: index % this._cols,
      y: Math.floor(index / this._cols),
    };
  }

  isXYFilled(x, y) {
    if (x < 0 || x >= this._cols || y < 0 || y >= this._cols) {
      return false;
    }

    if (this._empty_grid[this.xyToIndex(x, y)]) {
      return true;
    }

    return this._grid[this.xyToIndex(x, y)] !== null;
  }

  fillXY(x, y, agent) {
    if (x < 0 || x >= this._cols || y < 0 || y >= this._cols) return;

    this._grid[this.xyToIndex(x, y)] = agent;
  }

  clearXY(x, y) {
    this._grid[this.xyToIndex(x, y)] = null;
  }

  getXYagent(x, y) {
    const i = this.xyToIndex(x, y);
    if (i < 0 || i >= this._grid.length) return null;

    return this._grid[this.xyToIndex(x, y)];
  }

  getFreeNeighbours(x, y) {
    const neighbours = [];

    for (let theta = 0; theta < 2 * Math.PI; theta += Math.PI / 2) {
      const dx = Math.round(Math.cos(theta));
      const dy = Math.round(Math.sin(theta));

      if (
        x + dx >= this._cols ||
        x + dx < 0 ||
        y + dy >= this._cols ||
        y + dy < 0
      )
        continue;

      const i = this.xyToIndex(x + dx, y + dy);
      if (this._grid[i] === null && !this._empty_grid[i])
        neighbours.push({ x: x + dx, y: y + dy });
    }

    return neighbours;
  }

  _drawAgent(ctx, agent) {
    const scl = this._size / this._cols;
    const coords = agent.coords;

    const fill_vertical = this._xor128.random() > 0.75;
    const fill_horizontal = this._xor128.random() > 0.75;
    const fill_diagonal =
      this._xor128.random() > 0.75 && !(fill_vertical && fill_horizontal);
    const fill_circles =
      (fill_vertical || fill_horizontal || fill_diagonal) &&
      this._xor128.random() > 0.75;

    ctx.save();
    ctx.fillStyle = agent.color.rgb;
    ctx.strokeStyle = agent.color.darken(0.8).rgb;
    ctx.lineWidth = 2;

    coords.forEach(({ x, y }) => {
      ctx.fillRect(x * scl, y * scl, scl, scl);

      if (fill_vertical) {
        ctx.beginPath();
        ctx.moveTo((x + 0.5) * scl, y * scl);
        ctx.lineTo((x + 0.5) * scl, (y + 1) * scl);
        ctx.stroke();
      }

      if (fill_horizontal) {
        ctx.beginPath();
        ctx.moveTo(x * scl, (y + 0.5) * scl);
        ctx.lineTo((x + 1) * scl, (y + 0.5) * scl);
        ctx.stroke();
      }

      if (fill_diagonal) {
        ctx.beginPath();
        ctx.moveTo(x * scl, y * scl);
        ctx.lineTo((x + 1) * scl, (y + 1) * scl);
        ctx.stroke();
      }

      if (fill_circles) {
        ctx.beginPath();
        ctx.arc((x + 0.5) * scl, (y + 0.5) * scl, scl / 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // ATTENTION: very ugly code incoming
    for (let i = 0; i < coords.length; i++) {
      // check if the cell on the left is of another agent or empty
      const [cx, cy] = [coords[i].x, coords[i].y];

      for (const dpos of [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ]) {
        const [dx, dy] = dpos;

        // check if the cell on the left is of another agent or empty
        if (cx == 0 || cx + dx > 0) {
          const other = this._grid[this.xyToIndex(cx - 1, cy)];
          if (cx + dx == 0 || other == null || !other.equals(agent)) {
            ctx.beginPath();
            ctx.moveTo(cx * scl, cy * scl);
            ctx.lineTo(cx * scl, (cy + 1) * scl);
            ctx.stroke();
          }
        }

        // check if the cell on the right is of another agent or empty
        if (cx == this._cols - 1 || cx + dx < this._cols - 1) {
          const other = this._grid[this.xyToIndex(cx + 1, cy)];
          if (
            cx + dx == this._cols - 1 ||
            other == null ||
            !other.equals(agent)
          ) {
            ctx.beginPath();
            ctx.moveTo((cx + 1) * scl, cy * scl);
            ctx.lineTo((cx + 1) * scl, (cy + 1) * scl);
            ctx.stroke();
          }
        }

        // check if the cell on the top is of another agent or empty
        if (cy == 0 || cy + dy > 0) {
          const other = this._grid[this.xyToIndex(cx, cy - 1)];
          if (
            cy + dy == 0 ||
            other == null ||
            !other.color.equals(agent.color)
          ) {
            ctx.beginPath();
            ctx.moveTo(cx * scl, cy * scl);
            ctx.lineTo((cx + 1) * scl, cy * scl);
            ctx.stroke();
          }
        }

        // check if the cell on the bottom is of another agent or empty
        if (cy == this._cols - 1 || cy + dy < this._cols - 1) {
          const other = this._grid[this.xyToIndex(cx, cy + 1)];
          if (
            cy + dy == this._cols - 1 ||
            other == null ||
            !other.equals(agent)
          ) {
            ctx.beginPath();
            ctx.moveTo(cx * scl, (cy + 1) * scl);
            ctx.lineTo((cx + 1) * scl, (cy + 1) * scl);
            ctx.stroke();
          }
        }
      }
    }

    ctx.restore();
  }

  // find the outer
  show(ctx) {
    ctx.save();
    this._agents.forEach((agent) => {
      this._drawAgent(ctx, agent);
    });
    ctx.restore();
  }

  get size() {
    return this._cols;
  }
}

export { Grid };
