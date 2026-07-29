import { Utils, XOR128 } from "./lib.js";

class GrayScott {
  constructor(x, y, N, Da, Db, f, k, scl, seed, color) {
    this._x = x; // x position of the grid on the canvas
    this._y = y; // y position of the grid on the canvas

    this._n = N; // grid size
    this._Da = Da; // diffusion rate of A
    this._Db = Db; // diffusion rate of B
    this._f = f; // feed rate
    this._k = k; // kill rate
    this._scl = scl; // size of each cell in pixels
    this._seed = seed; // random seed
    this._color = color; // color scheme

    this._levels = 3; // number of discrete levels for posterization
    this._xor128 = new XOR128(seed); // random number generator

    // precompute the (levels + 1) distinct rgba strings used during posterized drawing
    this._level_colors = new Array(this._levels + 1);
    for (let l = 0; l <= this._levels; l++) {
      const level_color = color.copy();
      level_color.a = l / this._levels;
      this._level_colors[l] = level_color.rgba;
    }

    this._a1 = new Float32Array(N * N); // concentration of A
    this._b1 = new Float32Array(N * N); // concentration of B
    this._a2 = new Float32Array(N * N); // next concentration of A
    this._b2 = new Float32Array(N * N); // next concentration of B

    this._converged = false;
    this._convergence_threshold = 1e-4; // avg per-cell, per-step change below which the simulation is considered settled
    this._convergence_streak = 0; // consecutive step() calls under the threshold
    this._convergence_streak_required = 5; // streak needed before declaring convergence, to ignore transient lulls

    this._reset();
  }

  hasConverged() {
    return this._converged;
  }

  _reset() {
    this._a1.fill(1.0);
    this._b1.fill(0.0);

    const center = Math.floor(this._n / 2);
    const radius = Math.floor(10);

    for (let y = center - radius; y < center + radius; y++) {
      for (let x = center - radius; x < center + radius; x++) {
        const i = Utils.xy_to_i(x, y, this._n);

        this._a1[i] = 0.5;
        this._b1[i] = this._xor128.random(0.25, 0.3);
      }
    }
  }

  step(n) {
    if (this._converged) return;

    const N = this._n;
    const Da = this._Da;
    const Db = this._Db;
    const f = this._f;
    const k = this._k;

    for (let step = 0; step < n; step++) {
      const a1 = this._a1;
      const b1 = this._b1;
      const a2 = this._a2;
      const b2 = this._b2;

      for (let y = 0; y < N; y++) {
        const ym = (y === 0 ? N - 1 : y - 1) * N;
        const yp = (y === N - 1 ? 0 : y + 1) * N;
        const row = y * N;

        for (let x = 0; x < N; x++) {
          const xm = x === 0 ? N - 1 : x - 1;
          const xp = x === N - 1 ? 0 : x + 1;
          const i = row + x;

          const a = a1[i];
          const b = b1[i];

          const lap_a =
            a1[row + xm] + a1[row + xp] + a1[ym + x] + a1[yp + x] - 4 * a;
          const lap_b =
            b1[row + xm] + b1[row + xp] + b1[ym + x] + b1[yp + x] - 4 * b;
          const reaction = a * b * b;

          a2[i] = a + (Da * lap_a - reaction + f * (1 - a));
          b2[i] = b + (Db * lap_b + reaction - (k + f) * b);
        }
      }

      // swap buffers
      [this._a1, this._a2] = [this._a2, this._a1];
      [this._b1, this._b2] = [this._b2, this._b1];

      let total_change = 0;
      for (let i = 0; i < N * N; i++) {
        total_change += Math.abs(this._a1[i] - a1[i]) + Math.abs(this._b1[i] - b1[i]);
      }

      const avg_change = total_change / (N * N);
      if (avg_change < this._convergence_threshold) {
        this._convergence_streak++;
        if (this._convergence_streak >= this._convergence_streak_required) {
          this._converged = true;
          return;
        }
      } else {
        this._convergence_streak = 0;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y); // translate to the grid's position

    const N = this._n;
    const scl = this._scl;
    const levels = this._levels;
    const level_colors = this._level_colors;
    const a1 = this._a1;
    const b1 = this._b1;

    let current_fill = null;

    for (let y = 0; y < N; y++) {
      const row = y * N;
      for (let x = 0; x < N; x++) {
        const i = row + x;
        const a = a1[i];
        const b = b1[i];

        // color alpha based on concentration, posterized into discrete bands
        const raw_alpha = Utils.clamp(a - b, 0, 1);
        const eased_alpha = Utils.ease_in_poly(raw_alpha, 3); // apply easing for smoother transitions
        const level = Math.round(eased_alpha * levels);
        const fill = level_colors[level];

        if (fill !== current_fill) {
          ctx.fillStyle = fill;
          current_fill = fill;
        }
        ctx.fillRect(x * scl, y * scl, scl, scl);
      }
    }
    ctx.restore();
  }

  getA() {
    return this._a1;
  }

  getB() {
    return this._b1;
  }
}

const GrayScottType = Object.freeze({
  MITOSIS: "mitosis",
  CORAL: "coral",
  SPOTS: "spots",
  WORMS: "worms",
  SOLITONS: "solitons",
  WAVES: "waves",
  BUBBLES: "bubbles",
});

const GRAY_SCOTT_PARAMS = Object.freeze({
  [GrayScottType.MITOSIS]: { Da: 0.16, Db: 0.08, f: 0.0367, k: 0.0649 },
  [GrayScottType.CORAL]: { Da: 0.16, Db: 0.08, f: 0.0545, k: 0.062 },
  [GrayScottType.SPOTS]: { Da: 0.16, Db: 0.08, f: 0.035, k: 0.065 },
  [GrayScottType.WORMS]: { Da: 0.16, Db: 0.08, f: 0.058, k: 0.065 },
  [GrayScottType.SOLITONS]: { Da: 0.16, Db: 0.08, f: 0.03, k: 0.055 },
  [GrayScottType.WAVES]: { Da: 0.16, Db: 0.08, f: 0.014, k: 0.045 },
  [GrayScottType.BUBBLES]: { Da: 0.16, Db: 0.08, f: 0.098, k: 0.0555 },
});

const JITTER_RATIO = 0.0125; // max +/- fractional variation applied to f and k

class GrayScottFactory {
  static create(type, x, y, N, scl, seed, color) {
    const { Da, Db, f, k } = GRAY_SCOTT_PARAMS[type];
    const xor128 = new XOR128(seed);

    const jittered_f = f * xor128.random(1 - JITTER_RATIO, 1 + JITTER_RATIO);
    const jittered_k = k * xor128.random(1 - JITTER_RATIO, 1 + JITTER_RATIO);

    return new GrayScott(
      x,
      y,
      N,
      Da,
      Db,
      jittered_f,
      jittered_k,
      scl,
      seed,
      color,
    );
  }
}

export { GrayScott, GrayScottFactory, GrayScottType };
