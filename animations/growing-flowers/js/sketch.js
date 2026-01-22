import { Engine, XOR128, PaletteFactory, Color } from "./lib.js";
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

    this._hex_palettes = [
      ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
      ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
      ["#2f4858", "#33658a", "#86bbd8", "#f6ae2d", "#f26419"],
      ["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"],
      ["#f72585", "#7209b7", "#3a0ca3", "#4361ee", "#4cc9f0"],
      ["#355070", "#6d597a", "#b56576", "#e56b6f", "#eaac8b"],
      ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
      ["#390099", "#9e0059", "#ff0054", "#ff5400", "#ffbd00"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);

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
