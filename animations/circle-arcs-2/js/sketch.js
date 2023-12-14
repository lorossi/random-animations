import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Circle } from "./circle.js";
import { PaletteFactory } from "./palette.js";

class Sketch extends Engine {
  preload() {
    console.warn("TODO: add texture");
    this._scl = 0.9;
    this._time_scl = 0.75;
    this._cols = 4;

    this._min_rings = 4;
    this._max_rings = 8;

    this._min_arcs = 3;
    this._max_arcs = 7;
    this._min_arc_length = Math.PI / 2;
    this._max_arc_length = Math.PI * 2;

    this._probability = 0.75;

    this._duration = 900;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128);
    this._palette = PaletteFactory.getRandomPalette(this._xor128);

    const circle_scl = this.width / this._cols;
    this._circles = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = (i % this._cols) * circle_scl + circle_scl / 2;
      const y = Math.floor(i / this._cols) * circle_scl + circle_scl / 2;
      const r = circle_scl / 2;
      const rings = this._xor128.random_int(this._min_rings, this._max_rings);
      const circle = new Circle(x, y, r);
      circle.initDependencies(this._xor128, this._noise);
      circle.setAttributes(
        rings,
        this._min_arcs,
        this._max_arcs,
        this._min_arc_length,
        this._max_arc_length,
        this._probability,
        this._time_scl
      );
      circle.setPalette(this._palette.colors);
      circle.generate();
      return circle;
    });
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this.background(this._palette.background.rgba);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    this._circles.forEach((c) => {
      c.update(t);
      c.show(this.ctx);
    });
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
