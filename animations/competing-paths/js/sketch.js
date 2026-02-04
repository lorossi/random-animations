import { Color, Engine, Point, XOR128 } from "./lib.js";
import { Grid } from "./grid.js";
import { AlgorithmFactory } from "./algorithm-factory.js";
import { Maze } from "./maze.js";

class Sketch extends Engine {
  preload() {
    this._slots = 101;
    this._grid_cols = 2;
    this._min_room_size = 5;

    this._bg = Color.fromHex("#edf2f4");
    this._visited_color = Color.fromHex("#f4a261");
    this._path_color = Color.fromHex("#ef233c");
    this._wall_color = Color.fromHex("#264653");
    this._goal_color = Color.fromHex("#ef233c");

    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._rotation = this._xor128.random_int(0, 4) * (Math.PI / 2);
    this._scl = new Array(2).fill(0).map(() => this._xor128.pick([-1, 1]));
    // adjust canvas size
    const current_col_size = this.width / this._grid_cols / this._slots;
    const new_size =
      Math.ceil(current_col_size) * this._slots * this._grid_cols;

    this.canvas.width = new_size;
    this.canvas.height = new_size;

    this._start = new Point(1, 1);
    this._goal = new Point(this._slots - 2, this._slots - 2);
    this._grid_size = this.width / this._grid_cols;

    this._maze = new Maze(
      this._slots,
      this._min_room_size,
      this._xor128.random_int(1e16),
      this._start,
      this._goal,
    );

    this._grids = new Array(this._grid_cols ** 2).fill(null).map((_, i) => {
      const algorithm_cls = AlgorithmFactory.get_algorithm_i(i);
      const grid = new Grid(
        this._slots,
        this._grid_size,
        this._seed,
        this._start,
        this._goal,
        algorithm_cls,
        this._maze,
      );
      grid.set_colors(
        this._wall_color,
        this._visited_color,
        this._path_color,
        this._goal_color,
      );
      return grid;
    });

    document.body.style.backgroundColor = this._bg.rgba;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;

    this.ctx.save();
    this.background(this._bg);

    this._grids.forEach((grid, i) => {
      grid.step();

      const x = (i % this._grid_cols) * this._grid_size;
      const y = Math.floor(i / this._grid_cols) * this._grid_size;
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.translate(this._grid_size / 2, this._grid_size / 2);
      this.ctx.rotate(this._rotation);
      this.ctx.scale(this._scl[0], this._scl[1]);
      this.ctx.translate(-this._grid_size / 2, -this._grid_size / 2);

      grid.draw(this.ctx, dt, delta_frame);
      this.ctx.restore();
    });

    this.ctx.restore();

    if (delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    this.setup();
  }
}

export { Sketch };
