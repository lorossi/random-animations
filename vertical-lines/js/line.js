import { Point } from "./engine.js";

class Line {
  constructor(x, scl, size, turn_p, straighten_p, start_percent, xor128) {
    this._x = x;
    this._scl = scl;
    this._size = size;
    this._xor128 = xor128;
    this._turn_p = turn_p;
    this._straighten_p = straighten_p;
    this._start_percent = start_percent;

    this._nodes = [];
  }

  drop(others) {
    let x = this._x;
    let turned_right = false;
    let straightened = false;

    for (let y = 0; y <= this._size; y += this._scl) {
      const y_percent = y / this._size;
      const can_turn = y_percent > this._start_percent;

      if (!turned_right && can_turn && this._xor128.random() < this._turn_p) {
        turned_right = true;
        x += this._scl;
      } else if (turned_right && !straightened) {
        if (this._xor128.random() < this._straighten_p) {
          straightened = true;
        } else {
          x += this._scl;
        }
      }

      let node = new Point(x, y);
      if (x > this._size) return;
      this._nodes.push(node);
      if (others.some((other) => other.hasNode(x, y))) return;
    }
  }

  hasNode(x, y) {
    return this._nodes.some((node) => node.x === x && node.y === y);
  }

  draw(ctx, t) {
    ctx.save();
    ctx.strokeStyle = "rgb(245, 245, 245)";
    ctx.lineWidth = 2;

    ctx.beginPath();

    const end_i = Math.min(
      this._nodes.length,
      Math.floor(this._nodes.length * t)
    );

    for (let i = 0; i < end_i; i++) {
      const node = this._nodes[i];

      if (i === 0) ctx.moveTo(node.x, node.y);

      if (i < this._nodes.length - 1 && i == end_i - 1) {
        // interpolate between the two points
        let f = (t * this._nodes.length - i) % 1;
        let next = this._nodes[i + 1];

        if (next.x != node.x) f *= Math.SQRT1_2;

        const x = node.x + (next.x - node.x) * f;
        const y = node.y + (next.y - node.y) * f;
        ctx.lineTo(node.x, node.y);
        ctx.lineTo(x, y);
      } else ctx.lineTo(node.x, node.y);
    }
    ctx.stroke();

    ctx.restore();
  }

  get nodes_count() {
    return this._nodes.length;
  }
}

export { Line };
