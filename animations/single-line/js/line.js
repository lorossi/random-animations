import { DIRECTION_TO_POINT } from "./grid.js";

class Line {
  constructor(start_pos, slot_size, stripes, palette, xor128, draw_from = 0) {
    this._start_pos = start_pos.copy();
    this._slot_size = Math.ceil(slot_size);
    this._stripes = stripes;
    this._palette = palette;
    this._xor128 = xor128;
    this._draw_from = draw_from;

    this._directions = [];
    this._widths = new Array(stripes)
      .fill(0)
      .map(
        (_, i) =>
          (this._slot_size * 0.75 * (this._stripes - i)) / this._stripes,
      );
    this._ended = false;
  }

  copy() {
    const new_line = new Line(
      this._start_pos,
      this._slot_size,
      this._stripes,
      this._palette,
      this._xor128,
      this._directions.length - 1,
    );
    new_line.directions = this._directions;
    return new_line;
  }

  update(available_directions) {
    if (this._ended) return;

    if (available_directions.length == 0) {
      this._ended = true;
      return null;
    }

    const next_direction = this._xor128.pick(available_directions);
    this._directions.push(next_direction);
    return this.current_position.copy().add(DIRECTION_TO_POINT[next_direction]);
  }

  show(ctx) {
    ctx.save();

    this._widths.forEach((width, j) => {
      ctx.save();
      ctx.strokeStyle = this._palette.getColor(j).rgba;
      ctx.lineWidth = width;

      let curr_pos = this._start_pos.copy();
      for (let i = 0; i < this._directions.length; i++) {
        if (i >= this._draw_from) {
          if (i == 0) {
            this._drawStartEndLine(this._directions[i], curr_pos, ctx);
          } else if (this._directions[i] == this._directions[i - 1]) {
            this._drawLine(this._directions[i], curr_pos, ctx);
          } else {
            this._drawTurn(
              this._directions[i - 1],
              this._directions[i],
              curr_pos,
              ctx,
            );
          }
        }

        curr_pos = curr_pos.copy().add(DIRECTION_TO_POINT[this._directions[i]]);
      }

      if (this.ended) {
        this._drawStartEndLine(
          this._directions[this._directions.length - 1] + 2,
          curr_pos,
          ctx,
        );
      }

      ctx.restore();
    });

    ctx.restore();
  }

  backtrack() {
    if (this._directions.length == 0) return null;
    this._directions.pop();
    this._draw_from = Math.max(0, this._draw_from - 1);

    return this.current_position.copy();
  }

  _drawLine(cell_direction, pos, ctx) {
    // draw a line segment at pos with direction_in and direction_out
    const len = Math.ceil(this._slot_size);
    ctx.save();
    ctx.translate(...this._posToCanvasPos(pos));
    ctx.rotate((Math.PI / 2) * cell_direction);

    // draw line segment

    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.lineTo(len / 2, 0);
    ctx.stroke();

    ctx.restore();
  }

  _drawStartEndLine(cell_direction, pos, ctx) {
    // draw a line segment at pos with direction_in and direction_out
    ctx.save();
    ctx.translate(...this._posToCanvasPos(pos));
    ctx.rotate((Math.PI / 2) * (cell_direction + 2));
    ctx.lineCap = "round";

    // draw line segment

    ctx.beginPath();
    ctx.moveTo(-this._slot_size / 2, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();

    ctx.restore();
  }

  _drawTurn(direction_in, direction_out, pos, ctx) {
    let rotation;
    if (
      (direction_in == 0 && direction_out == 1) ||
      (direction_in == 3 && direction_out == 2)
    ) {
      rotation = 0;
    } else if (
      (direction_in == 1 && direction_out == 2) ||
      (direction_in == 0 && direction_out == 3)
    ) {
      rotation = Math.PI / 2;
    } else if (
      (direction_in == 2 && direction_out == 3) ||
      (direction_in == 1 && direction_out == 0)
    ) {
      rotation = Math.PI;
    } else if (
      (direction_in == 3 && direction_out == 0) ||
      (direction_in == 2 && direction_out == 1)
    ) {
      rotation = (3 * Math.PI) / 2;
    }

    const r = Math.ceil(this._slot_size / 2);

    ctx.save();
    ctx.translate(...this._posToCanvasPos(pos));
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.arc(-r, r, r, (Math.PI * 3) / 2, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  _xyToCanvasPos(x, y) {
    return [(x + 0.5) * this._slot_size, (y + 0.5) * this._slot_size];
  }

  _posToCanvasPos(pos) {
    return this._xyToCanvasPos(pos.x, pos.y);
  }

  get ended() {
    return this._ended;
  }

  get last_direction() {
    if (this._directions.length == 0) return null;
    return this._directions[this._directions.length - 1];
  }

  get directions() {
    return [...this._directions];
  }

  set directions(dirs) {
    this._directions = [...dirs];
  }

  get current_position() {
    return this._directions.reduce((pos, dir) => {
      return pos.add(DIRECTION_TO_POINT[dir]);
    }, this._start_pos.copy());
  }

  get draw_length() {
    return this._directions.length - this._draw_from;
  }
}

export { Line };
