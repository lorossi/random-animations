import { Engine, SimplexNoise, PaletteFactory, XOR128, Color } from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._cols = 3;
    this._scl = 0.85;
    this._texture_scl = 3;
    this._noise_scl = 0.01;
    this._circle_scl = 0.9;
    this._segments_num = 200;

    this._hex_palettes = [
      ["#fdf0d5", "#780000", "#c1121f", "#003049", "#669bbc"],
      ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
      ["#f1faee", "#e63946", "#a8dadc", "#457b9d", "#1d3557"],
      ["#eae2b7", "#003049", "#d62828", "#f77f00", "#fcbf49"],
      ["#f2e8cf", "#386641", "#6a994e", "#a7c957", "#bc4749"],
      ["#ef233c", "#2b2d42", "#8d99ae", "#edf2f4", "#d90429"],
      ["#e0fbfc", "#3d5a80", "#98c1d9", "#ee6c4d", "#293241"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);

    [this._bg, ...this._colors] = this._palette.colors;

    const circle_scl = this.width / this._cols;
    this._circles = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = (0.5 + (i % this._cols)) * circle_scl;
      const y = (0.5 + Math.floor(i / this._cols)) * circle_scl;
      const c = new Circle(x, y, circle_scl * this._circle_scl);
      c.setAttributes(this._colors, this._noise_scl, this._segments_num);
      c.initDependencies(this._xor128, this._noise);
      return c;
    });

    this._texture = this._createTexture();

    this.background(this._bg.rgba);
    this._ctx.drawImage(this._texture, 0, 0);
    document.body.style.backgroundColor = this._bg.rgba;
  }

  draw() {
    this._ctx.save();
    this._ctx.globalCompositeOperation = "multiply";
    this._ctx.translate(this.width / 2, this.height / 2);
    this._ctx.scale(this._scl, this._scl);
    this._ctx.translate(-this.width / 2, -this.height / 2);

    this._circles.forEach((circle) => {
      circle.update();
      circle.show(this._ctx);
    });
    this._ctx.restore();
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const r = this._xor128.random(127);
        const c = Color.fromMonochrome(r, 0.05);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return canvas;
  }

  click() {
    this.setup();
  }
}

export { Sketch };
