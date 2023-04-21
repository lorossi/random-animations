class Sketch extends Engine {
  preload() {
    this._recording = false;

    this._seed = null;
    this._num = 500;
    this._r = 2;
  }

  setup() {
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }

    if (this._seed == null) this._seed = Date.now();

    this._random = new XOR128(this._seed);

    this._points = Array(this._num)
      .fill(0)
      .map(() => {
        const x = Math.floor(this._random.random(0, this.width));
        const y = Math.floor(this._random.random(0, this.height));
        return new Point(x, y);
      });

    this._tree = prim(this._points);

    this.background("rgb(0, 0, 0)");
    this.ctx.fillStyle = "rgb(255, 255, 255)";

    this._points.forEach((p) => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, this._r, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  draw() {
    const e = this._tree.next();
    if (!e.done) {
      const u = e.value.u;
      const v = e.value.v;
      this.ctx.save();
      this.ctx.strokeStyle = "rgb(200, 200, 252005)";
      this.ctx.beginPath();
      this.ctx.moveTo(u.x, u.y);
      this.ctx.lineTo(v.x, v.y);
      this.ctx.stroke();
      this.ctx.restore();
    } else {
      this.noLoop();
      console.log("End of sketch. Click to restart.");
      if (this._recording) {
        this.stopRecording();
        console.log("%cRecording stopped", "color:red");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
      }
    }
  }

  click() {
    this.setup();
    this.loop();
  }
}

const prim = function* (points) {
  let S = new Set();
  let T = new Set();

  const p = [...points];
  S.add(p.pop());

  const N = new Set(p);
  const n = points.length;

  while (T.size < n - 1) {
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

  let found;
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
