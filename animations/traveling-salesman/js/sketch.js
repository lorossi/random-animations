import { Engine, Color, Point, XOR128 } from "./lib.js";
import { GeneticTSP } from "./genetic.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._cols = 2;
    this._rows = 2;

    this._num_cities = 75;
    this._scl = 0.86;
    this._min_dist = 10;

    this._dot_r = 2.5;
    this._line_w = 1.25;
    this._ghost_count = 12;
    this._steps_per_frame = 1;

    this._bg = Color.fromMonochrome(15);
    this._fg = Color.fromMonochrome(245);
    this._accent = Color.fromHex("#ff6b4a");
    this._leader_color = Color.fromHex("#5ce1e6");
    this._ghost = Color.fromRGB(170, 200, 255, 0.08);
    this._divider = Color.fromMonochrome(255, 0.12);
  }

  setup() {
    const seed = new Date().getTime();
    this._random = new XOR128(seed);

    this._cell_w = this.width / this._cols;
    this._cell_h = this.height / this._rows;

    // single shared set of cities solved by all 4 differently-seeded runs
    this._points = this._generatePoints(this._cell_w, this._cell_h);

    const count = this._cols * this._rows;
    this._solvers = Array.from({ length: count }, (_, i) => {
      const solver_seed = seed + (i + 1) * 104729;
      const solver_random = new XOR128(solver_seed);
      return {
        ga: new GeneticTSP(this._points, solver_random, {
          population_size: 200,
          elite_count: 2,
          tournament_size: 5,
          mutation_rate: 0.1,
          inversion_prob: 0.8,
        }),
        flash: 0,
      };
    });

    document.body.style.backgroundColor = this._bg.rgba;

    this._frame_offset = this.frame_count;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  _generatePoints(w, h) {
    const points = [];
    const margin_x = (w * (1 - this._scl)) / 2;
    const margin_y = (h * (1 - this._scl)) / 2;
    const max_attempts = this._num_cities * 60;

    let attempts = 0;
    while (points.length < this._num_cities && attempts < max_attempts) {
      attempts++;
      const x = this._random.random(margin_x, w - margin_x);
      const y = this._random.random(margin_y, h - margin_y);
      const candidate = new Point(x, y);

      const too_close = points.some((p) => p.distance(candidate) < this._min_dist);
      if (!too_close) {
        points.push(candidate);
      }
    }

    return points;
  }

  _drawTour(order, stroke_style, line_width) {
    if (!order || order.length < 2) return;

    this.ctx.beginPath();
    const first = this._points[order[0]];
    this.ctx.moveTo(first.x, first.y);
    for (let i = 1; i < order.length; i++) {
      const p = this._points[order[i]];
      this.ctx.lineTo(p.x, p.y);
    }
    this.ctx.closePath();

    this.ctx.strokeStyle = stroke_style;
    this.ctx.lineWidth = line_width;
    this.ctx.stroke();
  }

  draw(dt) {
    const delta_frame = this.frame_count - this._frame_offset;

    let leader_idx = 0;
    let leader_dist = Infinity;

    for (let s = 0; s < this._solvers.length; s++) {
      const solver = this._solvers[s];
      let improved = false;
      for (let i = 0; i < this._steps_per_frame; i++) {
        if (solver.ga.step().improved) {
          improved = true;
        }
      }

      if (improved) {
        solver.flash = 1;
      } else {
        solver.flash = Math.max(0, solver.flash - 0.045);
      }

      if (solver.ga.best_distance < leader_dist) {
        leader_dist = solver.ga.best_distance;
        leader_idx = s;
      }
    }

    this.ctx.save();
    this.background(this._bg);
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";

    for (let s = 0; s < this._solvers.length; s++) {
      const solver = this._solvers[s];
      const col = s % this._cols;
      const row = Math.floor(s / this._cols);
      const is_leader = s === leader_idx;

      this.ctx.save();
      this.ctx.translate(col * this._cell_w, row * this._cell_h);

      // faint exploration trails of top candidate tours
      const top_orders = solver.ga.topOrders(this._ghost_count);
      for (let i = 1; i < top_orders.length; i++) {
        this._drawTour(top_orders[i], this._ghost.rgba, 0.85);
      }

      // best tour found so far, with subtle warm pulse on improvement
      const base_color = is_leader ? this._leader_color : this._fg;
      const best_color = base_color.mix(this._accent, solver.flash * 0.75);
      const best_width = this._line_w + solver.flash * 1.25;
      this._drawTour(solver.ga.best_order, best_color.rgba, best_width);

      // cities (dots)
      this.ctx.fillStyle = this._fg.rgba;
      for (let i = 0; i < this._points.length; i++) {
        const p = this._points[i];
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, this._dot_r, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // length counter in bottom right corner of each quadrant
      this.ctx.font = "18px monospace";
      this.ctx.textAlign = "right";
      this.ctx.textBaseline = "bottom";
      this.ctx.fillStyle = best_color.rgba;
      this.ctx.fillText(
        `LEN ${Math.round(solver.ga.best_distance)}`,
        this._cell_w - 14,
        this._cell_h - 10,
      );

      this.ctx.restore();
    }

    // subtle 2x2 grid dividers
    this.ctx.strokeStyle = this._divider.rgba;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for (let c = 1; c < this._cols; c++) {
      const x = c * this._cell_w;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }
    for (let r = 1; r < this._rows; r++) {
      const y = r * this._cell_h;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    this.ctx.stroke();

    this.ctx.restore();

    if (delta_frame >= this._duration && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    this.setup();
  }
}

export { Sketch };
