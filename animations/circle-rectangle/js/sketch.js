import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._cols = 7;
    this._rows = 5;
    this._scl = 0.9;
    this._cell_scl = 0.8;
    this._bg_color = Color.fromHEX("#F0EDE1");
    this._texture_scl = 2;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._palette = PaletteFactory.getRandomPalette(this._xor128);
    this._grid = new Grid(
      this._rows,
      this._cols,
      this.width,
      this._palette,
      this._seed,
      this._cell_scl
    );
    document.body.style.backgroundColor = this._bg_color.hex;

    this._frame_offset = this.frameCount;
  }

  draw() {
    this.ctx.save();
    this.background(this._bg_color);
    this.scaleFromCenter(this._scl);

    this._grid.update();
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
    const texture = document.createElement("canvas");
    texture.width = this.width;
    texture.height = this.height;

    const ctx = texture.getContext("2d");
    ctx.save();
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const r = this._xor128.random_int(0, 127);
        const c = Color.fromMonochrome(r, 0.05);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return texture;
  }

  _applyTexture() {
    const texture = this._createTexture();
    const pattern = this.ctx.createPattern(texture, "repeat");
    this.ctx.fillStyle = pattern;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

export { Sketch };
