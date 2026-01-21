import { Engine, XOR128, Palette, PaletteFactory } from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._cols = 4;
    this._scl = 0.95;
    this._circle_scl = 0.8;
    this._circle_noise_radius = 0.5;
    this._hex_palettes = [
      ["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557"],
      ["#2b2d42", "#8d99ae", "#edf2f4", "#ef233c", "#d90429"],
      ["#da2c38", "#226f54", "#87c38f", "#f4f0bb", "#43291f"],
      ["#011627", "#fdfffc", "#2ec4b6", "#e71d36", "#ff9f1c"],
      ["#f4f1de", "#e07a5f", "#3d405b", "#81b29a", "#f2cc8f"],
      ["#d00000", "#ffba08", "#3f88c5", "#032b43", "#136f63"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    const palette = palette_factory.getRandomPalette(this._xor128);

    [this._bg, ...this._fg] = palette.colors;
    this._palette = new Palette(this._fg);

    const circle_r = this.width / this._cols / 2;
    this._circles = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = (i % this._cols) * 2 * circle_r + circle_r;
      const y = Math.floor(i / this._cols) * 2 * circle_r + circle_r;
      const random_seed = this._xor128.random_int(1e16);
      const noise_seed = this._xor128.random_int(1e16);

      const c = new Circle(x, y, circle_r, this._circle_scl);
      c.setNoise(noise_seed, this._circle_noise_radius);
      c.setRandom(random_seed);
      c.setPalette(this._palette);
      return c;
    });

    document.body.style.backgroundColor = this._bg.rgb;
  }

  draw() {
    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._circles.forEach((circle) => circle.draw(this.ctx));

    this.ctx.restore();

    this.noLoop();
  }

  click() {
    this.draw();
    this.setup();
  }
}

export { Sketch };
