import { Color, Engine, Point, XOR128, PaletteFactory } from "./lib.js";
import { Grid } from "./grid.js";
import { PathfindingAlgorithmFactory } from "./pathfinding-algorithm-factory.js";
import { MazeAlgorithmFactory } from "./maze-algorithm-factory.js";

class Sketch extends Engine {
  preload() {
    this._grid_cols = 2;

    this._hex_palettes = [
      // bg, wall, visited, path
      ["#EDF2F4", "#264653", "#F4A261", "#EF233C"],
      ["#FDFFFC", "#011627", "#FF9F1C", "#E71D36"],
      ["#E0FBFC", "#293241", "#98C1D9", "#EE6C4D"],
      ["#f2e8cf", "#274c77", "#a7c957", "#386649"],
      ["#f6fff8", "#05668d", "#02c39a", "#bc4749"],
    ];

    this._bg = Color.fromHex("#edf2f4");

    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._slots = this._xor128.random_int(80, 120);
    if (this._slots % 2 === 0) this._slots += 1; // Ensure odd number of slots for maze generation

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, false);

    this._rotation = this._xor128.random_int(0, 4) * (Math.PI / 2);
    this._scl = new Array(2).fill(0).map(() => this._xor128.pick([-1, 1]));
    // adjust canvas size
    const current_col_size = this.width / this._grid_cols / this._slots;
    const new_size =
      Math.ceil(current_col_size) * this._slots * this._grid_cols;

    this.canvas.width = new_size;
    this.canvas.height = new_size;

    this._start = new Point(1, 1);
    this._goal = this._xor128.random_bool()
      ? new Point(this._slots - 2, this._slots - 2)
      : new Point(1, this._slots - 2);

    this._grid_size = this.width / this._grid_cols;

    const maze_algorithm_cls = MazeAlgorithmFactory.get_random_algorithm(
      this._xor128,
    );
    this._maze = new maze_algorithm_cls(
      this._slots,
      this._seed,
      this._start,
      this._goal,
    );

    const [bg, wall, visited, path] = this._palette.colors;

    this._grids = new Array(this._grid_cols ** 2).fill(null).map((_, i) => {
      const algorithm_cls = PathfindingAlgorithmFactory.get_algorithm_i(i);
      const grid = new Grid(
        this._slots,
        this._grid_size,
        this._seed,
        this._start,
        this._goal,
        algorithm_cls,
        this._maze,
      );
      grid.set_colors(wall, visited, path);
      return grid;
    });

    this._bg = bg;
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
