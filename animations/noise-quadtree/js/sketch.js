import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { QuadTree } from "./quadtree.js";

class Sketch extends Engine {
  preload() {
    this._points_num = 500;

    this._scl = 0.95;
    this._noise_scl = 0.001;
    this._texture_particles = 100000;

    this._noise_enabled = false;
    console.log("Press SPACE to toggle noise texture");
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._palette = PaletteFactory.getRandomPalette(this._xor128);
    [this._bg, this._fg] = this._palette.colors;

    document.body.style.background = this._bg.hex;

    this._points = [];
    while (this._points.length < this._points_num) {
      const x = this._xor128.random(this.width);
      const y = this._xor128.random(this.height);
      const noise_value = this._noise.noise(
        x * this._noise_scl,
        y * this._noise_scl
      );
      if (noise_value < 0) continue;
      this._points.push(new Point(x, y));
    }

    this._quadtree = new QuadTree(
      this.width,
      this._points,
      this._fg,
      this._xor128,
      4
    );
    this._quadtree.split();
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._quadtree.draw(this.ctx);

    this.ctx.restore();

    if (this._noise_enabled) {
      this.ctx.save();
      this._drawParticleTexture();
      this.ctx.restore();
    }
  }

  click() {
    this.setup();
    this.draw();
  }

  _drawParticleTexture() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    for (let i = 0; i < this._texture_particles; i++) {
      const x = this._xor128.random(this.width);
      const y = this._xor128.random(this.height);
      const n = this._noise.noise(x * this._texture_scl, y * this._texture_scl);
      const alpha = this._map(n, 0, 0.025);

      const c = Color.fromMonochrome(32, alpha);

      this.ctx.fillStyle = c.rgba;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  _map(x, min, max) {
    // assuming x in range -1, 1
    return ((x + 1) / 2) * (max - min) + min;
  }

  keyDown(_, code) {
    if (code == 32) {
      // space
      this._noise_enabled = !this._noise_enabled;
      console.log("Noise texture enabled:", this._noise_enabled);
      this.draw();
    }
  }
}

export { Sketch };
