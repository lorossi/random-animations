import { Color, Palette } from "./lib.js";

class Grid {
  constructor(size, cell_count, cell_scl, rect_count, xor128, palette) {
    this._size = size;
    this._cell_count = cell_count;
    this._cell_scl = cell_scl;
    this._rect_count = rect_count;

    this._grid_color = Color.fromMonochrome(15);
    this._intersection_color = Color.fromCSS("darkred");
    this._rect_colors = [Color.fromCSS("darkblue"), Color.fromCSS("darkgreen")];

    this._xor128 = xor128;
    this._palette = palette;

    this._setPalette(palette);
  }

  _setPalette(palette) {
    // extract colors and sort by luminance
    const colors = palette.colors.sort((a, b) => a.l - b.l);
    let [grid, ...remaining] = colors;

    this._grid_color = grid;

    // shuffle the remaining colors
    remaining = this._xor128.shuffle(remaining);
    this._intersection_color = remaining.shift();
    this._rect_colors = new Palette(remaining);
  }

  _createRect(d_pos, grid_width, grid_line_width, color, ctx) {
    const rect_dx = this._xor128.random_interval(0, this._size / 8);
    const rect_dy = this._xor128.random_interval(0, this._size / 8);
    const rect_rotation = this._xor128.random_interval(0, (5 / 180) * Math.PI);
    const rect_size = this._xor128.random(0.75, 1.25) * grid_width;
    const stroke_color = color.copy().darken(0.1);

    ctx.save();
    ctx.translate(d_pos + rect_dx, d_pos + rect_dy);
    ctx.rotate(rect_rotation);
    ctx.lineWidth = grid_line_width;
    ctx.fillStyle = color.rgba;
    ctx.strokeStyle = stroke_color.rgba;
    ctx.beginPath();
    ctx.rect(
      -grid_line_width,
      -grid_line_width,
      rect_size + grid_line_width,
      rect_size + grid_line_width,
    );
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  _createGrid(d_pos, grid_width, line_width, ctx) {
    const scl = grid_width / this._cell_count;
    const x_flip = this._xor128.pick([1, -1]);

    ctx.save();
    ctx.translate(this._size / 2, this._size / 2);
    ctx.scale(x_flip, 1);
    ctx.translate(-this._size / 2, -this._size / 2);

    ctx.fillStyle = this._intersection_color.rgba;
    ctx.lineWidth = line_width;
    for (let i = 0; i < this._cell_count + 1; i++) {
      const y = d_pos + i * scl;
      const end_x = d_pos + Math.min(this._cell_count, i + 1) * scl;

      if (i < this._cell_count) {
        // intersections
        ctx.fillRect(end_x - scl, y, scl, scl);
      }

      // horizontal lines
      if (i < this._cell_count + 1) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(end_x, y);
        ctx.stroke();
      }

      // vertical lines
      ctx.beginPath();
      ctx.moveTo(y, 0);
      ctx.lineTo(y, this._size);
      ctx.stroke();
    }

    ctx.restore();
  }

  show(ctx) {
    const line_width = 8;
    const d_pos =
      (1 - this._cell_scl) *
      this._size *
      this._xor128.random_interval(0.5, 0.1);

    const grid_width = this._size * this._cell_scl;

    ctx.save();

    ctx.lineWidth = line_width;
    ctx.strokeStyle = this._grid_color.rgba;

    for (let i = 0; i < this._rect_count; i++) {
      this._createRect(
        d_pos,
        grid_width,
        line_width,
        this._rect_colors.getColor(i),
        ctx,
      );
    }

    this._createGrid(d_pos, grid_width, line_width, ctx);

    ctx.restore();
  }
}

export { Grid };
