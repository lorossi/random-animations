import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Circle } from "./circle.js";
import { PaletteFactory } from "./palette.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.9;
    this._cols = 4;

    this._rings = 3;
    this._min_arcs = 3;
    this._max_arcs = 7;
    this._min_arc_length = Math.PI / 5;
    this._max_arc_length = Math.PI;

    this._probability = 0.75;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128);
    this._palette_factory = new PaletteFactory(this._xor128);
    this._palette = this._palette_factory.randomPalette();

    const circle_scl = this.width / this._cols;
    this._circles = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = (i % this._cols) * circle_scl + circle_scl / 2;
      const y = Math.floor(i / this._cols) * circle_scl + circle_scl / 2;
      const r = circle_scl / 2;
      const circle = new Circle(x, y, r);
      circle.injectDependencies(this._xor128, this._noise);
      circle.setAttributes(
        this._rings,
        this._min_arcs,
        this._max_arcs,
        this._min_arc_length,
        this._max_arc_length,
        this._probability
      );
      circle.setPalette(this._palette.colors);
      circle.generate();
      return circle;
    });
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._palette.background.rgba);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    this._circles.forEach((circle) => circle.show(this.ctx));
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
