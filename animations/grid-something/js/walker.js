import { Point } from "./lib.js";

class Walker {
  constructor(grid_size, start_pos, palette, xor128) {
    this._grid_size = grid_size;
    this._start_pos = start_pos;
    this._palette = palette;
    this._xor128 = xor128;

    this._trail = this._createTrail();
    this._palette.shuffle(xor128);
  }

  showTrails(ctx, scl) {
    ctx.save();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    ctx.beginPath();
    this._trail.forEach((p, i) =>
      i === 0
        ? ctx.moveTo(p.x * scl, p.y * scl)
        : ctx.lineTo(p.x * scl, p.y * scl),
    );
    ctx.stroke();
    ctx.restore();
  }
  showPoints(ctx, scl) {
    ctx.save();

    this._trail.forEach((p) => {
      ctx.fillStyle = this._palette.getColor(p.x + p.y).rgba;

      ctx.beginPath();
      ctx.arc(p.x * scl, p.y * scl, 16, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.restore();
  }

  _createTrail(max_tries = 1000) {
    const directions = new Array(8).fill(null).map((_, i) => {
      const round_coord = (x) => {
        if (Math.abs(x) < 0.001) return 0;
        return x > 0 ? 1 : -1;
      };
      const angle = (Math.PI / 4) * i;
      const [x, y] = [Math.cos(angle), Math.sin(angle)].map(round_coord);
      return new Point(x, y);
    });
    let trail = [this._start_pos];
    let midpoints = [this._start_pos];

    let tries = 0;
    let placed = 0;
    while (tries < max_tries) {
      tries++;

      const last = trail[trail.length - 1];
      const next = this._xor128.pick(directions);

      const jump_length = this._xor128.random_int(1, 3);
      const end_x = last.x + next.x * jump_length;
      const end_y = last.y + next.y * jump_length;

      if (end_x < 1 || end_x >= this._grid_size) continue;
      if (end_y < 1 || end_y >= this._grid_size) continue;

      let found = false;
      for (let j = 1; j <= jump_length; j++) {
        const x = last.x + next.x * j;
        const y = last.y + next.y * j;
        if (midpoints.find((p) => p.x === x && p.y === y)) {
          found = true;
          break;
        }
      }
      if (found) continue;

      for (let j = 1; j <= jump_length; j++)
        midpoints.push(new Point(last.x + next.x * j, last.y + next.y * j));

      trail.push(new Point(end_x, end_y));

      placed++;
    }

    return trail;
  }
}

export { Walker };
