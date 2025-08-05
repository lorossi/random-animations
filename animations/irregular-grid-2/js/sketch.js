import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Grid } from "./grid.js";
import { Agent } from "./agent.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromHEX("#fff1d0");
    this._scl = 0.9;
    this._texture_scl = 2;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._cols = 25;
    this._agents_num = this._xor128.random_int(50, 201);

    this._grid = new Grid(this.width, this._cols, this._xor128.random_int(1e6));
    this._palette = PaletteFactory.getRandomPalette(this._xor128);

    for (let i = 0; i < this._agents_num; i++) {
      const seed = this._xor128.random_int(1e6);
      const color = this._palette.getColor(i);
      this._grid.addAgent(new Agent(this._grid, seed, color));
    }

    document.body.style.backgroundColor = this._bg.rgb;
    this._frame_offset = this.frameCount;
  }

  draw() {
    this.ctx.save();

    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._grid.generate();
    this._grid.clean();
    this._grid.show(this.ctx);

    this.ctx.restore();

    this._applyTexture();

    this.noLoop();
  }

  click() {
    this.setup();
    this.draw();
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const r = this._xor128.random_int(64);
        const c = Color.fromMonochrome(r, 0.1);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return canvas;
  }

  _applyTexture() {
    const texture = this._createTexture();
    this.ctx.save();
    this.ctx.globalCompositeOperation = "dodge";
    this.ctx.drawImage(texture, 0, 0);
    this.ctx.restore();
  }
}

export { Sketch };
