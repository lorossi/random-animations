import {
  Engine,
  SimplexNoise,
  Point,
  Color,
  XOR128,
  Palette,
  PaletteFactory,
} from "./lib.js";
import { HexagonGrid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._palettes_hex = [
      ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
      ["#FF6700", "#EBEBEB", "#C0C0C0", "#3A6EA5", "#004E98"],
      ["#283D3B", "#197278", "#EDDDD4", "#C44536", "#772E25"],
      ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
      ["#23282D", "#1E2D59", "#294A70", "#EACD82", "#F2F2F2"],
      ["#FFFFFF", "#F50A32", "#F5AF0A", "#0A697B", "#333333"],
      ["#FF445A", "#EDAE4C", "#F2F2F2", "#595959", "#0D0D0D"],
    ];
    this._bg = Color.fromMonochrome(240);
    this._hexagon_scl = 0.8;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const slots = this._xor128.random_int(50, 100);

    const palette_factory = PaletteFactory.fromHEXArray(this._palettes_hex);
    const palette = palette_factory.getRandomPalette(this._xor128, false);
    if (this._xor128.random_bool()) palette.reverse();

    this._grid = new HexagonGrid(
      slots,
      this.width,
      this._hexagon_scl,
      this._xor128.random_int(1e6),
      palette
    );

    document.body.style.background = this._bg.hex;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;

    this.ctx.save();
    this.background(this._bg);
    this._grid.update();
    this._grid.show(this.ctx);
    this.ctx.restore();

    if (delta_frame > 0 && this._recording && delta_frame >= this._duration) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click(x, y) {
    this.setup();
  }
}

export { Sketch };
