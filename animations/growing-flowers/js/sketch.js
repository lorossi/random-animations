import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Circle, NoiseDetails } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._radius = 25;
    this._circles_num = 400;
    this._circle_speed = 2;
    this._bg = Color.fromMonochrome(240);
    this._scl = 0.95;
    this._noise_scl = 0.0015;
    this._noise_radius = 0.005;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette = PaletteFactory.getRandomPalette(this._xor128);

    this.background(this._bg);
    this._generateCircles();
  }

  _generateCircles() {
    const seed = this._xor128.random_int(1e9);
    const max_dist = this.width / 2;
    const d_seed_theta = Math.PI / 16;

    this._circles = new Array(this._circles_num).fill().map(() => {
      const theta = this._xor128.random(2 * Math.PI);
      const seed_theta = this._xor128.random_interval(0, d_seed_theta);
      const dsx = Math.cos(theta) * this._noise_radius;
      const dsy = Math.sin(seed_theta) * this._noise_radius;

      const noise_details = new NoiseDetails(seed, dsx, dsy, this._noise_scl);

      const c = new Circle(
        theta,
        this._radius,
        max_dist,
        this._circle_speed,
        this._palette,
      );
      c.setNoiseDetails(noise_details);

      return c;
    });
  }

  draw() {
    this.ctx.save();

    // clip to center
    this.ctx.beginPath();
    this.ctx.arc(
      this.width / 2,
      this.height / 2,
      (Math.min(this.width, this.height) / 2) * this._scl,
      0,
      2 * Math.PI,
    );
    this.ctx.clip();
    // move to center
    this.ctx.translate(this.width / 2, this.height / 2);

    this._circles.forEach((circle) => circle.update());
    this._circles.forEach((circle) => circle.draw(this.ctx));

    this.ctx.restore();

    if (this._circles.every((c) => c.ended)) {
      this._generateCircles();
    }
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
