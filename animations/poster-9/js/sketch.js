import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Tile } from "./tile.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(245);
    this._scale = 0.9;
    this._tile_scale = 0.8;
    this._noise_scl = 0.005;
    this._wrong_size = 4;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));
    this._noise.octaves = 3;
    this._noise.falloff = 0.5;

    this._cols = this._xor128.random_int(25, 40);
    this._rows = this._cols;

    // select 4x4 tiles to overwrite with a big X
    const wrong_x = this._xor128.random_int(
      2,
      this._cols - this._wrong_size - 1,
    );
    const wrong_y = this._xor128.random_int(
      2,
      this._rows - this._wrong_size - 1,
    );
    this._wrong_tiles_coords = new Point(wrong_x, wrong_y);

    this._tile_size = Math.min(this.width, this.height) / this._cols;
    this._tiles = new Array(this._cols * this._rows).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      const wrong =
        x >= this._wrong_tiles_coords.x &&
        x < this._wrong_tiles_coords.x + this._wrong_size &&
        y >= this._wrong_tiles_coords.y &&
        y < this._wrong_tiles_coords.y + this._wrong_size;

      return new Tile(
        x * this._tile_size,
        y * this._tile_size,
        this._tile_size,
        this._noise,
        this._tile_scale,
        this._noise_scl,
        wrong,
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

    // select 4 contiguous random tiles to overwrite with a big X

    this.ctx.save();
    this.ctx.strokeStyle = Color.fromHEX("#FF3131").rgba;
    this.ctx.lineWidth = this._tile_size / 4;
    this.ctx.translate(
      (this._wrong_tiles_coords.x + this._wrong_size / 2) * this._tile_size,
      (this._wrong_tiles_coords.y + +this._wrong_size / 2) * this._tile_size,
    );
    this.ctx.scale(
      this._xor128.random(1.0, 1.25),
      this._xor128.random(1.0, 1.25),
    );
    this.ctx.rotate(this._xor128.random(-0.1, 0.1));

    const cross_len = (this._wrong_size / 2) * this._tile_size;
    const d_pos = new Point(
      this._xor128.random_interval(0, cross_len / 8),
      this._xor128.random_interval(0, cross_len / 8),
    );
    this.ctx.beginPath();
    this.ctx.moveTo(-cross_len + d_pos.x, -cross_len + d_pos.y);
    this.ctx.lineTo(cross_len + d_pos.x, cross_len + d_pos.y);
    this.ctx.moveTo(cross_len + d_pos.x, -cross_len + d_pos.y);
    this.ctx.lineTo(-cross_len + d_pos.x, cross_len + d_pos.y);
    this.ctx.stroke();

    this.ctx.restore();

    // write the title

    const text = [
      "IT'S JUST ANOTHER MISTAKE OF MINE",
      "IT'S JUST ANOTHER WASTE OF TIME",
    ];

    text.forEach((t) => this._write_title(t));

    this.ctx.restore();
  }

  _write_title(text) {
    const text_margin = this._tile_size * 2;
    this.ctx.save();
    this.ctx.font = `bold ${this._tile_size * 1.25}px RadioCanada`;

    const title_width = this.ctx.measureText(text).width;
    const title_x = this._xor128.random(0, this.width - title_width);
    const title_y = this._xor128.random(
      2 * this._tile_size,
      this.height - text_margin,
    );

    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = Color.fromMonochrome(15).rgba;

    this.ctx.translate(title_x, title_y);
    this.ctx.rotate(this._xor128.random(-0.1, 0.1));
    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
