import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Layer } from "./layer.js";
import { PaletteFactory } from "./palette-factory.js";

class Sketch extends Engine {
  preload() {
    this._bg_color = Color.fromMonochrome(240);
    this._scl = 0.9;
    this._texture_scl = 2;
    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._palette = PaletteFactory.getRandomPalette(this._xor128);
    const layers_xor128 = new Array(this._palette.length)
      .fill()
      .map(() => new XOR128(this._xor128.random_int(1e16)));

    this._layers = new Array(this._palette.length).fill().map((_, i) => {
      const l = new Layer(this.width);
      l.setFGColor(this._palette.getColor(i));
      l.setXOR128(layers_xor128[i]);
      return l;
    });

    const cols = this._xor128.random_int(5, 10);
    this._clip_paths = this._createClipPaths(cols);
    this._texture_canvas = this._createTexture();
  }

  draw() {
    this.noLoop();
    const t = (this.frameCount / this._duration) % 1;

    const theta = (this._xor128.random_int(4) * Math.PI) / 2;

    this.ctx.save();
    this.background(this._bg_color);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.rotate(theta);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._layers.forEach((layer, i) => {
      this.ctx.save();

      layer.update(t);

      this.ctx.clip(this._clip_paths[i]);
      layer.show(this.ctx);
      this.ctx.restore();
    });

    this.ctx.save();
    this.ctx.globalCompositeOperation = "dodge";
    this.ctx.drawImage(this._texture_canvas, 0, 0);
    this.ctx.restore();

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }

  _createClipPaths(cols) {
    const paths = new Array(4).fill().map(() => new Path2D());
    const scl = Math.ceil(this.width / cols);

    for (let y = 0; y < cols; y++) {
      for (let x = 0; x < cols; x++) {
        const i = this._xor128.random_int(4);
        paths[i].rect(x * scl, y * scl, scl, scl);
      }
    }
    return paths;
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = this.width;
    canvas.height = this.height;

    for (let y = 0; y < this.height; y += this._texture_scl) {
      for (let x = 0; x < this.width; x += this._texture_scl) {
        const ch = this._xor128.random(127);
        const c = Color.fromMonochrome(ch, 0.05);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return canvas;
  }
}

export { Sketch };
