import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Tile } from "./tile.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(15);
    this._fg = Color.fromMonochrome(245);
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
          this._fg,
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

    // write title

    this.ctx.save();
    this.ctx.font = `bold ${this._tile_size}px Lato`;

    // top text
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    // fill bg
    this.ctx.fillStyle = this._bg.rgb;
    const top_text = "THERE IS NO POINT IN THIS";
    const top_text_width = this.ctx.measureText(top_text).width;
    this.ctx.fillRect(0, 0, top_text_width, this._tile_size);
    // fill text
    this.ctx.fillStyle = this._fg.rgb;
    this.ctx.fillText(top_text, 0, 0);
    // strike through
    this.ctx.strokeStyle = this._fg.rgb;
    this.ctx.lineWidth = this._tile_size / 5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this._tile_size / 2);
    this.ctx.lineTo(top_text_width, this._tile_size / 2);
    this.ctx.stroke();

    // bottom text
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "bottom";
    // fill bg
    this.ctx.fillStyle = this._bg.rgb;
    const bottom_text = "JUST KEEP LOOKING, NOTHING TO SEE";
    const bottom_text_width = this.ctx.measureText(bottom_text).width;
    this.ctx.fillRect(
      this.width - bottom_text_width,
      this.height - this._tile_size,
      bottom_text_width,
      this._tile_size
    );
    // fill text
    this.ctx.fillStyle = this._fg.rgb;
    this.ctx.fillText(bottom_text, this.width, this.height);

    this.ctx.restore();

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
