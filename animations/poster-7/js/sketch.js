import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Tile } from "./tile.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(15);
    this._scale = 0.9;
    this._empty_probability = 0.3;
    this._tile_scale = 0.9;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._cols = this._xor128.random_int(5, 16);

    const tile_size = Math.min(this.width, this.height) / this._cols;
    this._tiles = Array(this._cols * this._cols)
      .fill(0)
      .map((_, i) => {
        const x = (i % this._cols) * tile_size;
        const y = Math.floor(i / this._cols) * tile_size;

        return new Tile(
          x,
          y,
          tile_size,
          this._xor128,
          this._tile_scale,
          this._empty_probability
        );
      });
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scale, this._scale);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._tiles.forEach((t) => t.draw(this.ctx));

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
