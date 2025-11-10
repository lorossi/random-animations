import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Shape } from "./shape.js";
import { Title, Subtitle } from "./title.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._empty_chances = 0.3;
    this._shape_scl = 0.95;
    this._noise_scl = 5;
    this._texture_scl = 4;

    // colors by https://color.adobe.com/-Bauhaus-color-theme-6950982/
    this._fg = Color.fromHex("#222222");
    this._bg = Color.fromHex("#EDEDED");
    this._colors = [
      Color.fromHex("#154084"),
      Color.fromHex("#9D2719"),
      Color.fromHex("#D7B418"),
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._rows = this._xor128.random_int(12, 24);
    const shape_size = this.width / this._rows;
    const shape_seed = this._xor128.random_int(1e9);

    this._shapes = [];

    for (let i = 0; i < this._rows * this._rows; i++) {
      const x = i % this._rows;
      const y = Math.floor(i / this._rows);

      const n = this._noise.noise(x * this._noise_scl, y * this._noise_scl);
      if ((n + 1) / 2 < this._empty_chances) continue;

      this._shapes.push(
        new Shape(x, y, shape_size, this._shape_scl, shape_seed, this._colors)
      );
    }

    this._title = new Title(
      shape_size,
      shape_size,
      shape_size * 2,
      this._fg,
      this._bg
    );
    this._subtitle = new Subtitle(
      this._rows * shape_size - shape_size,
      this._rows * shape_size - shape_size,
      shape_size,
      this._fg,
      this._bg
    );

    this._texture = this._createTexture();
  }

  _createTexture() {
    const texture_canvas = document.createElement("canvas");
    texture_canvas.width = this.width;
    texture_canvas.height = this.height;
    const texture_ctx = texture_canvas.getContext("2d");

    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const ch = this._xor128.random_int(127);
        const c = Color.fromMonochrome(ch, 0.05);
        texture_ctx.fillStyle = c.rgba;
        texture_ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return texture_canvas;
  }

  _applyTexture(texture) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(texture, 0, 0);
    this.ctx.restore();
  }

  draw() {
    this.noLoop();

    this.ctx.save();

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._shapes.forEach((shape) => shape.show(this.ctx));
    this._title.show(this.ctx);
    this._subtitle.show(this.ctx);
    this.ctx.restore();

    this._applyTexture(this._texture);
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
