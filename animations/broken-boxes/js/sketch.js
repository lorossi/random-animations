import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Box } from "./box.js";
import { PaletteFactory } from "./palette.js";

class Sketch extends Engine {
  preload() {
    this._cols = 6;
    this._scale = 0.9;
    this._box_scale = 0.9;
    this._box_angle_radius = 25;
    this._box_noise_scl = 0.005;
    this._texture_scl = 4;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise_seed = this._xor128.random_int(1e16);

    this._bg_color = Color.fromMonochrome(this._xor128.random_int(230, 256));
    this._setBgColor(this._bg_color);

    const palette = PaletteFactory.getRandomPalette(this._xor128);

    const scl = this.width / this._cols;
    this._boxes = new Array(this._cols * this._cols).fill(null).map((_, i) => {
      const x = ((i % this._cols) * this.width) / this._cols;
      const y = (Math.floor(i / this._cols) * this.height) / this._cols;
      const b = new Box(x, y, scl, this._box_angle_radius, this._box_scale);
      b.setBgColor(this._bg_color);
      b.setRandomSeed(this._seed + i * 10);
      b.setNoiseSeed(this._noise_seed);
      b.setPalette(palette);
      b.setNoiseScl(this._box_noise_scl);
      return b;
    });
  }

  click() {
    this.setup();
    this.draw();
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg_color);

    // draw boxes
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scale, this._scale);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    this._boxes.forEach((box) => box.draw(this.ctx));
    this.ctx.restore();

    // overlay some texture
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const n = this._xor128.random(137);
        const c = Color.fromMonochrome(n, 0.05);

        this.ctx.fillStyle = c.rgba;
        this.ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    this.ctx.restore();
  }

  _setBgColor(bg_color) {
    // set the dom background color by replacing the :root css variable "--background-color"
    const r = document.querySelector(":root");
    r.style.setProperty("--background-color", bg_color.rgba);
  }
}

export { Sketch };
