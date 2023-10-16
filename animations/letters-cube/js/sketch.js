import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Cell } from "./cell.js";
import { Particle } from "./particles.js";
import { Square } from "./squares.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._cells_num = 4;
    this._cubes_num = 20;
    this._scl = 0.9;

    this._particles_num = 5000;
    this._particles_scl = 2;

    this._squares_num = 15;
    this._squares_scl = this.width / 10;
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
          xor128
        );
      });

    this._particles = Array(this._particles_num)
      .fill()
      .map(
        () => new Particle(this.width, this.height, this._particles_scl, xor128)
      );

    this._squares = Array(this._squares_num)
      .fill()
      .map(
        () =>
          new Square(
            this.width,
            this.height,
            this._squares_scl,
            this._duration,
            xor128
          )
      );

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this.background("rgb(240, 240, 240)");

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._cells.forEach((c) => c.update(t));
    this._cells.forEach((c) => c.show(this.ctx));
    this.ctx.restore();

    this._particles.forEach((p) => p.update());
    this._particles.forEach((p) => p.show(this.ctx));

    this._squares.forEach((s) => s.update(this.frameCount));
    this._squares.forEach((s) => s.show(this.ctx));

    this.ctx.restore();

    if (t >= 1 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }
}

export { Sketch };
