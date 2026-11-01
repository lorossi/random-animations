import { Engine } from "./lib.js";

import {
  Color,
  GradientPalette,
  Palette,
  PaletteFactory,
  Point,
  SimplexNoise,
  Utils,
  XOR128,
} from "./lib.js";

import { Circle } from "./circle.js";
import { Intersection } from "./intersection.js";

class Sketch extends Engine {
  preload() {
    this._duration = 600;
    this._recording = false;


    this._intersection_size = 10;
    this._max_pull = 0.0; // how far circles can move from the border, 0 to 1
    this._bg = Color.fromMonochrome(15);
    this._fg = Color.fromMonochrome(240);
    this._circle_color = Color.fromMonochrome(240, 0.3);
    this._accents = ["#ff3864", "#2de2e6", "#ffd319", "#ff6c11", "#7cff6b"];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._frame_offset = this.frame_count;

    this._circle_count = this._xor128.random_int(7, 13);

    // a single vivid color for the hull, everything else stays monochrome
    this._accent = Color.fromHEX(this._xor128.pick(this._accents));
    this._hull_fill = this._accent.copy();
    this._hull_fill.a = 0.12;

    // split the perimeter in equal slots, one circle per slot,
    // then pull each circle towards the center by a random amount
    const perimeter = 2 * (this.width + this.height);
    const slot = perimeter / this._circle_count;
    const offset = this._xor128.random(perimeter);

    this._circles = new Array(this._circle_count).fill(0).map((_, i) => {
      const t =
        (offset + (i + this._xor128.random(0.2, 0.8)) * slot) % perimeter;

      const [px, py] = this._perimeterPoint(t);
      const pull = this._xor128.random(this._max_pull);
      const x = px + (this.width / 2 - px) * pull;
      const y = py + (this.height / 2 - py) * pull;

      // circles closer to the center are smaller, so they don't swallow it
      const max_radius =
        (this._xor128.random_interval(1, 0.05) * this.width * (1 - pull)) / 2;
      const seed = this._xor128.random_int(2e16);

      return new Circle(x, y, max_radius, this._circle_color, seed);
    });

    // every pair of circles can cross in two points
    this._intersections = [];
    for (let i = 0; i < this._circles.length; i++) {
      for (let j = i + 1; j < this._circles.length; j++) {
        [0, 1].forEach((side) => {
          this._intersections.push(
            new Intersection(
              this._circles[i],
              this._circles[j],
              side,
              this._intersection_size,
            ),
          );
        });
      }
    }

    document.body.style.backgroundColor = this._bg.hex;

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frame_count - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this._circles.forEach((circle) => circle.update(t));
    this._intersections.forEach((intersection) => intersection.update());
    const active = this._intersections.filter((i) => i.active);
    const visible = active.filter(
      (i) => i.x >= 0 && i.x <= this.width && i.y >= 0 && i.y <= this.height,
    );
    this._hull = this._convexHull(visible);

    // draw the circles on an offscreen canvas
    const lines_canvas = document.createElement("canvas");
    lines_canvas.width = this.width;
    lines_canvas.height = this.height;
    const lines_ctx = lines_canvas.getContext("2d");

    this._circles.forEach((circle) => {
      circle.show(lines_ctx);
    });

    // outline the intersections: the stroke is twice as wide as needed,
    // the cut below removes its inner half and the parts inside other holes
    lines_ctx.save();
    lines_ctx.lineWidth = 4;
    active.forEach((intersection) => {
      const on_hull = this._hull.includes(intersection);
      lines_ctx.strokeStyle = on_hull ? this._accent.rgba : this._fg.rgba;
      lines_ctx.beginPath();
      intersection.cut(lines_ctx);
      lines_ctx.stroke();
    });
    lines_ctx.restore();

    // outline around the intersections inside the canvas,
    // the cut below trims it at the holes
    if (this._hull.length > 2) {
      lines_ctx.save();
      lines_ctx.lineWidth = 3;
      lines_ctx.lineJoin = "round";
      lines_ctx.strokeStyle = this._accent.rgba;
      lines_ctx.fillStyle = this._hull_fill.rgba;
      lines_ctx.beginPath();
      this._hull.forEach((p) => lines_ctx.lineTo(p.x, p.y));
      lines_ctx.closePath();
      lines_ctx.fill();
      lines_ctx.stroke();
      lines_ctx.restore();
    }

    // cut holes around the intersections
    lines_ctx.save();
    lines_ctx.globalCompositeOperation = "destination-out";
    lines_ctx.beginPath();
    active.forEach((intersection) => intersection.cut(lines_ctx));
    lines_ctx.fill();
    lines_ctx.restore();

    this.background(this._bg);
    this.ctx.drawImage(lines_canvas, 0, 0);

    // light up the corners of the hull
    this.ctx.save();
    this.ctx.fillStyle = this._accent.rgba;
    this.ctx.beginPath();
    this._hull.forEach((p) => {
      this.ctx.moveTo(p.x + p.size * 0.4, p.y);
      this.ctx.arc(p.x, p.y, p.size * 0.4, 0, 2 * Math.PI);
    });
    this.ctx.fill();
    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _convexHull(points) {
    // Andrew's monotone chain, returns the hull in order
    const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
    if (sorted.length < 3) return sorted;

    const cross = (o, a, b) =>
      (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const half = (list) => {
      const chain = [];
      list.forEach((p) => {
        while (
          chain.length >= 2 &&
          cross(chain[chain.length - 2], chain[chain.length - 1], p) <= 0
        )
          chain.pop();
        chain.push(p);
      });
      chain.pop();
      return chain;
    };

    return [...half(sorted), ...half([...sorted].reverse())];
  }

  _perimeterPoint(t) {
    // walk clockwise along the border, starting from the top-left corner
    if (t < this.width) return [t, 0];
    t -= this.width;
    if (t < this.height) return [this.width, t];
    t -= this.height;
    if (t < this.width) return [this.width - t, this.height];
    t -= this.width;
    return [0, this.height - t];
  }

  click() {
    this.setup();
  }
}

export { Sketch };
