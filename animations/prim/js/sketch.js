import { Engine, XOR128, Color, Point } from "./lib.js";

class Sketch extends Engine {
  preload() {
    this._recording = false;

    this._seed = null;
    this._num = 250;
    this._r = 2;
    this._scl = 0.9;

    this._bg = Color.fromMonochrome(15);
    this._fg = Color.fromMonochrome(245);
  }

  setup() {
    if (this._seed == null) this._seed = Date.now();

    this._random = new XOR128(this._seed);

    this._points = Array(this._num)
      .fill(0)
      .map(() => {
        const x = Math.floor(
          this._random.random(1 - this._scl, this._scl) * this.width,
        );
        const y = Math.floor(
          this._random.random(1 - this._scl, this._scl) * this.height,
        );
        return new Point(x, y);
      });

    this._tree = prim(this._points, this.width, this.height);
    this._edges = [];
    this.ctx.fillStyle = this._fg.rgba;

    document.body.style.backgroundColor = this._bg.rgba;

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const e = this._tree.next();
    this._edges.push(e);
    if (!e.done) {
      const u = e.value.u;
      const v = e.value.v;

      this.ctx.save();
      this.ctx.strokeStyle = this._fg.rgba;
      this.ctx.beginPath();
      this.ctx.moveTo(u.x, u.y);
      this.ctx.lineTo(v.x, v.y);
      this.ctx.stroke();
      this.ctx.restore();
    } else {
      this.noLoop();
    }

    this.ctx.save();
    this.background(this._bg);

    this._points.forEach((p) => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, this._r, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this._edges.forEach((edge) => {
      if (edge.done) return;
      const u = edge.value.u;
      const v = edge.value.v;

      this.ctx.save();
      this.ctx.strokeStyle = this._fg.rgba;
      this.ctx.beginPath();
      this.ctx.moveTo(u.x, u.y);
      this.ctx.lineTo(v.x, v.y);
      this.ctx.stroke();
      this.ctx.restore();
    });

    this.ctx.restore();

    if (this._recording && e.done) {
      this.stopRecording();
      console.log("%cRecording stopped", "color:red");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    this.setup();
    this.loop();
  }
}

const prim = function* (points, width, height) {
  let S = new Set();
  let T = new Set();

  const manhattan = (u) =>
    Math.abs(u.x - width / 2) + Math.abs(u.y - height / 2);
  const first = points.reduce((a, b) => {
    return manhattan(a) < manhattan(b) ? a : b;
  });

  const p = [...points];
  p.splice(p.indexOf(first), 1);
  S.add(first);

  const N = new Set(p);
  const n = points.length;

  while (T.size < n - 2) {
    const [u, v, d] = closest(S, N);
    const n = { u: u.copy(), v: v.copy(), d: d };
    S.add(v.copy());
    T.add(n);
    yield n;
  }

  return;
};

const closest = (S, N) => {
  const difference = (A, B) => {
    return [...A].filter((u) => [...B].every((v) => !u.equals(v)));
  };

  let found = [];
  let min_dist = Infinity;

  S.forEach((u) => {
    difference(N, S).forEach((v) => {
      const d = u.distance(v);
      if (d < min_dist) {
        min_dist = d;
        found = [u.copy(), v.copy(), d];
      }
    });
  });

  return found;
};

export { Sketch };
