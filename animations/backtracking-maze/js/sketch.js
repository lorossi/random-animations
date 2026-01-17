import { Engine, XOR128, Color } from "./lib.js";

const CellType = {
  PATH: 0,
  WALL: 1,
};

class Sketch extends Engine {
  preload() {
    this._recording = false;

    this._cols = 101;
    this._path_color = Color.fromHEX("#ffecd1");
    this._bg_color = Color.fromHEX("#001524");

    this._current_color = Color.fromHEX("#d81159");
    this._solution_color = Color.fromHEX("#218380");
    this._visited_color = Color.fromHEX("#ffbc42");
    this._start = [1, 1];
    this._end = [this._cols - 2, this._cols - 2];

    this._single_frame_generation = false;
    this._single_frame_solution = false;
  }

  setup() {
    this._seed = Date.now();
    this._maze = [];
    this._visited = [];
    this._solution_visited = [];
    this._came_from = [];
    this._g_score = []; // cheapest path from start to node
    this._f_score = []; // cheapest path from start to node through node
    this._generation_stack = []; // stack for maze generation
    this._solution_stack = []; // set of nodes to be evaluated
    this._solution = []; // solution path

    this._xor128 = new XOR128(this._seed);

    this._generation_first_step = true;
    this._solution_first_step = true;
    this._generation_ended = false;
    this._solution_ended = false;

    this._correctCanvasSize(1000);

    if (this._recording) this.startRecording();
  }

  draw() {
    // draw grid
    this.ctx.save();
    this.background(this._bg_color.rgb);
    this._drawMaze();
    this.ctx.restore();

    if (this._generation_ended && this._solution_ended) {
      if (this._recording) {
        this._recording = false;
        this.stopRecording();
        this.saveRecording();
      }
      return;
    }

    if (this._single_frame_generation)
      this._generation_ended = this._mazeGenerationAlgorithm();
    else this._generation_ended = this._generateStep();

    if (this._generation_ended) {
      if (this._single_frame_solution)
        this._solution_ended = this._solutionAlgorithm();
      else this._solution_ended = this._solutionStep();
    }
  }

  click() {
    if (!this._generation_ended)
      this._generation_ended = this._mazeGenerationAlgorithm();
    else if (!this._solution_ended)
      this._solution_ended = this._solutionAlgorithm();
    else this.setup();
  }

  _mazeGenerationAlgorithm() {
    while (!this._generateStep()) {}
    return true;
  }

  _solutionAlgorithm() {
    while (!this._solutionStep()) {}
    return true;
  }

  _solutionStep() {
    // proceed to next step
    if (this._solution_first_step) this._solutionFirstStep();
    else {
      const ended = this._solutionNextStep();
      if (ended) {
        this._reconstructPath(this._xy_to_i(...this._end));
        return true;
      }
    }

    // reset the first step flag
    if (this._solution_first_step) this._solution_first_step = false;

    return false;
  }

  _solutionFirstStep() {
    this._came_from = new Array(this._cols * this._cols).fill(null);
    this._g_score = new Array(this._cols * this._cols).fill(Infinity);
    this._f_score = new Array(this._cols * this._cols).fill(Infinity);

    const start = this._xy_to_i(...this._start);
    this._g_score[start] = 0;
    this._f_score[start] = this._heuristic(start);
    this._solution_stack = [start];
    // reset the visited array
    this._visited = new Array(this._cols * this._cols).fill(false);
  }

  _solutionNextStep() {
    // find the node with the lowest f score
    const current = this._lowestFScore();
    const [cx, cy] = this._i_to_xy(current);
    // add the current node to the visited set for visualization
    this._solution_visited[current] = true;
    this._reconstructPath(current);
    // reconstruct the path for the current node
    if (cx == this._end[0] && cy == this._end[1]) return true;

    // remove the current node from the open set
    this._solution_stack = this._solution_stack.filter((i) => i !== current);
    // get the neighbors of the current node
    const neighbors = this._getPathNeighbors(current);
    // iterate over the neighbors
    for (const n of neighbors) {
      const [ni, _] = n;
      // calculate the tentative g score
      const tentative_g_score = this._g_score[current] + 1;
      // update the path if the new path is better
      if (tentative_g_score < this._g_score[ni]) {
        this._came_from[ni] = current;
        this._g_score[ni] = tentative_g_score;
        this._f_score[ni] = tentative_g_score + this._heuristic(ni);
        if (!this._solution_stack.includes(ni)) this._solution_stack.push(ni);
      }
    }
    return false;
  }

  _heuristic(i) {
    const [x, y] = this._i_to_xy(i);
    const [ex, ey] = this._end;
    return Math.abs(ex - x) + Math.abs(ey - y);
  }

  _lowestFScore() {
    let lowest = Infinity;
    let i = null;

    for (let j = 0; j < this._solution_stack.length; j++) {
      const f = this._f_score[this._solution_stack[j]];
      if (f < lowest) {
        lowest = f;
        i = this._solution_stack[j];
      }
    }

    return i;
  }

  _reconstructPath(current) {
    this._solution = [current];

    while (current != null) {
      current = this._came_from[current];
      if (current != null) this._solution.unshift(current);
    }
  }

  _generateStep() {
    // proceed to next step
    if (this._generation_first_step) this._generationFirstStep();
    else this._generationNextStep();

    // stop the loop if the stack is empty
    if (this._generation_stack.length === 0 && !this._generation_first_step) {
      this._generation_stack = [];
      return true;
    }

    // reset the first step flag
    if (this._generation_first_step) this._generation_first_step = false;

    return false;
  }

  _generationFirstStep() {
    const i = this._xy_to_i(...this._start);
    this._visited = new Array(this._cols * this._cols).fill(false);
    this._solution_visited = new Array(this._cols * this._cols).fill(false);
    this._maze = new Array(this._cols * this._cols).fill(CellType.WALL);
    this._visited[i] = true;
    this._maze[i] = CellType.PATH;
    this._generation_stack = [i];
  }

  _generationNextStep() {
    // find neighbors
    const i = this._generation_stack[this._generation_stack.length - 1];
    const neighbors = this._getWallNeighbors(i);

    // backtrack
    if (neighbors.length === 0) {
      this._generation_stack.pop();
      return;
    }

    // pick a random neighbour
    const [p, w] = this._xor128.random_from_array(neighbors);
    // carve walls between the current cell and the chosen cell
    this._maze[p] = CellType.PATH;
    if (w != null) this._maze[w] = CellType.PATH;

    // mark the chosen cell as visited
    this._visited[p] = true;
    this._generation_stack.push(p);
  }

  _drawMaze() {
    const scl = this.width / this._cols;

    this.ctx.save();

    // draw path
    for (let i = 0; i < this._maze.length; i++) {
      const [x, y] = this._i_to_xy(i);

      if (this._solution_visited[i]) {
        this.ctx.fillStyle = this._visited_color.rgba;
        this._fillCell(x * scl, y * scl, scl);
      } else if (this._maze[i] === CellType.PATH) {
        this.ctx.fillStyle = this._path_color.rgba;
        this._fillCell(x * scl, y * scl, scl);
      }
    }

    // draw the current path
    this.ctx.fillStyle = this._current_color.rgba;
    for (let i = 0; i < this._generation_stack.length; i++) {
      const [x, y] = this._i_to_xy(this._generation_stack[i]);
      this._fillCell(x * scl, y * scl, scl);
      if (i < this._generation_stack.length - 1) {
        // next cell
        const [nx, ny] = this._i_to_xy(this._generation_stack[i + 1]);
        // calculate the intermediate point
        const px = (x + nx) / 2;
        const py = (y + ny) / 2;
        this._fillCell(px * scl, py * scl, scl);
      }
    }

    // draw the solution path
    this.ctx.fillStyle = this._solution_color.rgba;
    for (let i = 0; i < this._solution.length; i++) {
      const [x, y] = this._i_to_xy(this._solution[i]);
      this._fillCell(x * scl, y * scl, scl);
    }

    this.ctx.restore();
  }

  _fillCell(x, y, scl) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.beginPath();
    this.ctx.rect(0, 0, scl, scl);
    this.ctx.fill();
    this.ctx.restore();
  }

  _getWallNeighbors(i) {
    const neighbors = [];
    const [x, y] = this._i_to_xy(i);
    // iterate over the neighbouring cells
    for (const [dx, dy] of [
      [0, 2],
      [0, -2],
      [2, 0],
      [-2, 0],
    ]) {
      // skip the case in which dx == dy == 0
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;

      // skip the case in which the cell is outside the grid
      if (nx < 0 || nx >= this._cols || ny < 0 || ny >= this._cols) continue;

      const ni = this._xy_to_i(nx, ny);
      if (this._maze[ni] != CellType.WALL) continue;
      if (this._visited[ni]) continue;

      const wx = x + dx / 2;
      const wy = y + dy / 2;
      if (wx >= 0 && wx < this._cols && wy >= 0 && wy < this._cols) {
        neighbors.push([ni, this._xy_to_i(wx, wy)]);
      } else {
        neighbors.push([ni, null]);
      }
    }

    return neighbors;
  }

  _getPathNeighbors(i) {
    const neighbors = [];
    const [x, y] = this._i_to_xy(i);
    // iterate over the neighbouring cells
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const nx = x + dx;
      const ny = y + dy;

      // skip the case in which the cell is outside the grid
      if (nx < 0 || nx >= this._cols || ny < 0 || ny >= this._cols) continue;

      const ni = this._xy_to_i(nx, ny);
      if (this._maze[ni] != CellType.PATH) continue;

      neighbors.push([ni, nx, ny]);
    }

    return neighbors;
  }

  _correctCanvasSize(size = 1000) {
    const remainder = size - Math.floor(size / this._cols) * this._cols;
    this.canvas.width = size - remainder;
    this.canvas.height = size - remainder;
  }

  _i_to_xy(i) {
    const x = i % this._cols;
    const y = Math.floor(i / this._cols);
    return [x, y];
  }

  _xy_to_i(x, y) {
    return y * this._cols + x;
  }
}

export { Sketch };
