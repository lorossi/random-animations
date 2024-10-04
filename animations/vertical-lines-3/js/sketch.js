import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Line } from "./line.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._cols = 200;
    this._noise_scl = 0.005;
    this._break_margin = 4;
    this._noise_dx = 100;
    this._font_size = 64;
    this._line_color = Color.fromMonochrome(205);
    this._background_color = Color.fromMonochrome(15);
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    const noise_seed = this._xor128.random_int(1e9);
    this._noise = new SimplexNoise(noise_seed);

    this._line_groups = this._xor128.random_int(3, 6) * 2 + 1;
    this._break_length = this._xor128.random_interval(0.5, 0.25) * this.height;

    const group_breaks = new Array(this._line_groups).fill(null).map((_, i) => {
      if (i == 0 || i == this._line_groups - 1) return [false, 0, 0];
      const break_length = this._xor128.random_interval(0.5, 0.1) * this.height;
      return [
        true,
        break_length,
        this._xor128.random_int(0, this.height - break_length),
      ];
    });

    const lines_in_group = this._cols / this._line_groups;

    const line_scl = this.width / (this._cols + 1);
    this._lines = new Array(this._cols).fill(null).map((_, i) => {
      const group = Math.floor(i / (this._cols / this._line_groups));
      const x = line_scl * (i + 0.5);

      const [has_break, break_length, break_y] = group_breaks[group];
      const margin_i = i % (this._cols / this._line_groups);
      const is_break_margin =
        margin_i < this._break_margin ||
        margin_i >= lines_in_group - this._break_margin;

      const length = this.height;
      const line = new Line(x, length);
      line.setNoise(this._noise, this._noise_scl, this._noise_dx);
      line.setColor(this._line_color);
      if (has_break && !is_break_margin) line.setBreak(break_y, break_length);

      line.update();
      return line;
    });
  }

  click() {
    this.setup();
    this.draw();
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._background_color);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._lines.forEach((line) => {
      line.draw(this.ctx);
    });

    // draw text
    this._drawText(this._font_size);

    // draw frame around the canvas
    this._drawFrame();

    this.ctx.restore();
  }

  _drawText(font_size = 64) {
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = this._line_color.rgba;
    this.ctx.font = `${font_size}px Staatliches`;

    const text_box = this.ctx.measureText("MISTAKES MAKE ELEGANCE");
    this.ctx.translate(this.width / 2, this.height / 2);

    // draw box
    const bx = text_box.width + font_size / 2;
    const by = font_size;
    this.ctx.save();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = this._line_color.rgba;
    this.ctx.translate(-bx / 2, -by / 2 - 0.05 * font_size);
    this.ctx.beginPath();
    this.ctx.rect(0, 0, bx, by);
    this.ctx.stroke();
    this.ctx.restore();

    this.ctx.fillStyle = this._line_color.rgba;
    this.ctx.fillText("MISTAKES MAKE ELEGANCE", 0, 0);

    this.ctx.restore();
  }

  _drawFrame() {
    this.ctx.save();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = this._line_color.rgba;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(this.width, 0);
    this.ctx.lineTo(this.width, this.height);
    this.ctx.lineTo(0, this.height);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.restore();
  }
}

export { Sketch };
