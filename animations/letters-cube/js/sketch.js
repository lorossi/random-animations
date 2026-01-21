import { Engine, XOR128, Color } from "./lib.js";
import { Cell } from "./cell.js";
import { Square } from "./squares.js";
import { Texture } from "./texture.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._cells_num = 4;
    this._cubes_num = 20;
    this._scl = 0.9;

    this._squares_num = 15;
    this._squares_scl = this.width / 10;

    this._bg = Color.fromMonochrome(240);

    this._texture_scl = 2;
    this._texture_oversize = 1.05;
  }

  setup() {
    const xor128 = new XOR128();

    const cols = Math.sqrt(this._cells_num);
    const letter_scl = this.height / cols / this._cubes_num;
    const max_length = this.width / letter_scl / cols;

    this._cells = Array(this._cells_num)
      .fill()
      .map((_, i) => {
        const x = i % cols;
        const y = Math.floor(i / cols);

        const xx = ((x + 1) / (cols + 1)) * this.width;
        const yy = (y / cols) * this.height;

        return new Cell(
          xx,
          yy,
          letter_scl,
          this._cubes_num,
          max_length,
          xor128,
        );
      });

    this._squares = Array(this._squares_num)
      .fill()
      .map(
        () =>
          new Square(
            this.width,
            this.height,
            this._squares_scl,
            this._duration,
            xor128,
          ),
      );

    this._texture = new Texture(
      this.width * this._texture_oversize,
      this._texture_scl,
      xor128.random_int(1e9),
    );

    document.body.style.background = this._bg.rgba;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frames = this.frameCount - this._frame_offset;
    const t = (delta_frames / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg);

    this.ctx.save();
    this.scaleFromCenter(this._scl);

    this._cells.forEach((c) => c.update(t));
    this._cells.forEach((c) => c.show(this.ctx));
    this.ctx.restore();

    this._squares.forEach((s) => s.update(this.frameCount));
    this._squares.forEach((s) => s.show(this.ctx));

    this.ctx.restore();

    this._texture.draw(this.ctx);
    this.ctx.restore();

    if (t == 0 && delta_frames > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }
}

export { Sketch };
