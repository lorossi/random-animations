import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Tile } from "./tile.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(245);
    this._scale = 0.9;
    this._tile_scale = 0.8;
    this._noise_scl = 0.005;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));
    this._noise.octaves = 3;
    this._noise.falloff = 0.5;

    this._cols = this._xor128.random_int(25, 40);
    this._rows = this._cols;

    this._tile_size = Math.min(this.width, this.height) / this._cols;
    this._tiles = Array(this._cols * this._rows)
      .fill(0)
      .map((_, i) => {
        const x = (i % this._cols) * this._tile_size;
        const y = Math.floor(i / this._cols) * this._tile_size;

        return new Tile(
          x,
          y,
          this._tile_size,
          this._noise,
          this._tile_scale,
          this._noise_scl
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
    const mark_x = this._xor128.random_int(2, this._cols - 5);
    const mark_y = this._xor128.random_int(2, this._rows - 5);

    this.ctx.fillStyle = this._bg.rgba;
    this.ctx.fillRect(
      mark_x * this._tile_size,
      mark_y * this._tile_size,
      this._tile_size * 4,
      this._tile_size * 4
    );

    this.ctx.strokeStyle = Color.fromMonochrome(15).rgba;
    this.ctx.lineWidth = this._tile_size / 4;
    this.ctx.translate(
      (mark_x + 2) * this._tile_size,
      (mark_y + 2) * this._tile_size
    );
    this.ctx.scale(
      this._xor128.random(1.0, 1.25),
      this._xor128.random(1.0, 1.25)
    );

    this.ctx.beginPath();
    this.ctx.moveTo(-this._tile_size * 2, -this._tile_size * 2);
    this.ctx.lineTo(this._tile_size * 2, this._tile_size * 2);
    this.ctx.moveTo(this._tile_size * 2, -this._tile_size * 2);
    this.ctx.lineTo(-this._tile_size * 2, this._tile_size * 2);
    this.ctx.stroke();

    this.ctx.restore();

    // write the title

    const title_text = "IT'S JUST ANOTHER MISTAKE OF MINE";

    this.ctx.save();
    this.ctx.fillStyle = Color.fromMonochrome(15).rgba;
    this.ctx.font = `bold ${this._tile_size}px RadioCanada`;

    const title_width = this.ctx.measureText(title_text).width;
    const title_x = this._xor128.random(0, this.width - title_width);
    const title_y = this._xor128.random(
      this._tile_size * 2,
      this.height - this._tile_size * 2
    );

    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";

    this.ctx.translate(title_x, title_y);
    this.ctx.rotate(this._xor128.random(-0.1, 0.1));

    this.ctx.fillText("JUST ANOTHER MISTAKE OF MINE", 0, 0);
    this.ctx.restore();

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
