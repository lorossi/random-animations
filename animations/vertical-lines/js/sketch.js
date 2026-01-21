import { Engine, XOR128, Color } from "./lib.js";
import { Line } from "./line.js";

class Sketch extends Engine {
  preload() {
    this._lines_num = 50;
    this._turn_p = 0.01;
    this._straighten_p = 0.05;
    this._start_percent = 0.1;
    this._scl = 0.8;
    this._duration = 300;
    this._recording = false;

    this._fg = Color.fromMonochrome(240);
    this._bg = Color.fromMonochrome(15);
  }

  setup() {
    const seed = new Date().getTime();
    const xor128 = new XOR128(seed);
    const line_scl = this.width / this._lines_num;
    this._lines = new Array(this._lines_num)
      .fill(0)
      .map(
        (_, i) =>
          new Line(
            i * line_scl,
            line_scl,
            this.height,
            this._turn_p,
            this._straighten_p,
            this._start_percent,
            this._fg,
            xor128,
          ),
      );
    this._lines.forEach((line, i) => line.drop(this._lines.slice(0, i)));
    this._max_nodes = this._lines.reduce(
      (acc, line) => (line.nodes_count > acc ? line.nodes_count : acc),
      0,
    );
    if (this._recording && !this._animated)
      throw new Error("Cannot record if not animated");

    document.body.style.background = this._bg.rgba;

    this._frame_offset = this.frameCount;
    if (this._recording) this.startRecording();
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);

    this.ctx.strokeStyle = this._fg.rgba;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );

    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._lines.forEach((line) => {
      const line_t = t / (line.nodes_count / this._max_nodes);
      line.draw(this.ctx, line_t);
    });

    this.ctx.restore();

    if (this._recording && t == 0 && delta_frame > 0) {
      this._recording = false;
      this.stopRecording();
      this.saveRecording();
    }
  }

  click() {
    if (this._recording) return;
    this.setup();
  }
}

export { Sketch };
