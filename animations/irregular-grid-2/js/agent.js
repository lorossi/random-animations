import { XOR128 } from "./lib.js";

class Agent {
  constructor(grid, seed, color) {
    this._grid = grid;
    this._seed = seed;
    this._ended = false;

    this._coords = [];

    this._xor128 = new XOR128(seed);

    this._max_size = 9;
    this._color = color;

    while (true) {
      const x = this._xor128.random_int(this._grid.size);
      const y = this._xor128.random_int(this._grid.size);

      if (!this._grid.isXYFilled(x, y)) {
        this._coords.push({ x, y });
        this._grid.fillXY(x, y, this);
        break;
      }
    }
  }

  expand() {
    if (this._ended) return;

    // Get all available coordinates
    let available_coords = this._coords
      .map(({ x, y }) => {
        return this._grid.getFreeNeighbours(x, y);
      })
      .filter((coords) => coords.length > 0)
      .flat();

    if (available_coords.length == 0) {
      this._ended = true;
      return;
    }

    // pick a random available coordinate
    const next_coord = this._xor128.pick(available_coords);
    this._coords.push(next_coord);
    this._grid.fillXY(next_coord.x, next_coord.y, this);

    // check the size of the agent
    if (this._coords.length >= this._max_size) {
      this._ended = true;
    }
  }

  equals(other) {
    return other.color.toString() == this.color.toString();
  }

  get color() {
    return this._color;
  }

  get ended() {
    return this._ended;
  }

  get size() {
    return this._coords.length;
  }

  get coords() {
    return this._coords;
  }
}

export { Agent };
