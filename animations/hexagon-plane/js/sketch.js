import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._bg_color = Color.fromMonochrome(15);
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._cols = this._xor128.random_int(7, 12);

    this._grid = new Grid(
      this.width,
      this._cols,
      this._xor128.random_int(1e16)
    );

    this._frame_offset = this.frameCount;
    document.body.style.backgroundColor = this._bg_color.rgb;
  }

  draw() {
    this.noLoop();

    // draw on a new canvas
    const hex_canvas = document.createElement("canvas");
    hex_canvas.width = this.width;
    hex_canvas.height = this.height;
    const hex_ctx = hex_canvas.getContext("2d");

    hex_ctx.save();
    hex_ctx.clearRect(0, 0, this.width, this.height);
    hex_ctx.translate(this.width / 2, this.height / 2);
    hex_ctx.scale(this._scl, this._scl);
    hex_ctx.translate(-this.width / 2, -this.height / 2);

    this._grid.show(hex_ctx);
    hex_ctx.restore();

    // draw on main canvas with aberration
    this.ctx.save();

    // this.ctx.drawImage(hex_canvas, 0, 0);

    const aberrations = [
      [
        {
          color: new Color(255, 255, 0),
          dpos: { x: -1, y: 0 },
        },
        {
          color: new Color(255, 0, 255),
          dpos: { x: -1 / Math.SQRT2, y: 1 / Math.SQRT2 },
        },
        {
          color: new Color(0, 255, 255),
          dpos: { x: 1 / Math.SQRT2, y: 1 / Math.SQRT2 },
        },
      ],
    ];

    this.ctx.save();
    this.background(this._bg_color);
    this.scaleFromCenter(this._scl);
    this.ctx.drawImage(hex_canvas, 0, 0);
    for (const ab of aberrations) {
      for (const { color, dpos } of ab) {
        // create a ne wcanvas for each color
        const channel_canvas = document.createElement("canvas");
        channel_canvas.width = this.width;
        channel_canvas.height = this.height;
        const channel_ctx = channel_canvas.getContext("2d");
        const channel_color = color;
        channel_ctx.fillStyle = channel_color.rgba;
        channel_ctx.translate(dpos.x * 2, dpos.y * 2);
        channel_ctx.globalCompositeOperation = "source-over";
        channel_ctx.drawImage(hex_canvas, 0, 0);
        channel_ctx.globalCompositeOperation = "source-in";
        channel_ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.drawImage(channel_canvas, 0, 0);
      }
    }
    this.ctx.restore();

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
