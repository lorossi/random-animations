import { Color, Engine, Palette, XOR128 } from "./lib.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromHex("#FF4500");
    this._border_color = Color.fromMonochrome(245);
    this._border_size = 10;
    this._border_scl = 0.95;
    this._font = "Hack";

    this._palette = new Palette([
      Color.fromMonochrome(10),
      Color.fromMonochrome(245),
    ]);
  }

  setup() {
    this._font_loaded = false;
    document.fonts
      .load(`12px ${this._font}`)
      .then(() => (this._font_loaded = true));

    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._grid = new Grid(
      this.width,
      this.height,
      this._font,
      this._palette,
      this._xor128,
    );
    this._grid.generate();

    document.body.style.background = this._bg.hex;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    if (!this._font_loaded) return;

    this.ctx.save();
    this.background(this._bg);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._border_scl, this._border_scl);

    this.ctx.strokeStyle = this._border_color.rgba;
    this.ctx.lineWidth = this._border_size;

    this.ctx.strokeRect(
      -this.width / 2 + this._border_size / 2,
      -this.height / 2 + this._border_size / 2,
      this.width - this._border_size,
      this.height - this._border_size,
    );

    this.ctx.restore();

    this.ctx.save();
    this._grid.show(this.ctx);
    this.ctx.restore();

    this.noLoop();
  }

  click() {
    this.setup();
    this.loop();
  }
}

export { Sketch };
