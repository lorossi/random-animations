import { Engine, XOR128, PaletteFactory, Color } from "./lib.js";
import { Rectangle } from "./rectangle.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._bg = Color.fromMonochrome(240);
    this._hex_palettes = [
      ["#2b2d42", "#8d99ae", "#edf2f4", "#ef233c"],
      ["#011627", "#fdfffc", "#2ec4b6", "#e71d36", "#ff9f1c"],
      ["#001524", "#15616d", "#ffecd1", "#ff7d00", "#78290f"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._rectangles_num = 30;
    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, false);

    this._radius = this.width / 5;
    this._rotations = 4;

    const size =
      Math.min(this.width, this.height) * (1 + 1 / (this._rectangles_num - 1)) +
      this._radius * 4;
    const phi = this._xor128.random(Math.PI * 2);

    this._rectangles = new Array(this._rectangles_num).fill().map((_, i) => {
      const delay = i / this._rectangles_num;
      const color = this._palette.getColor(i);
      return new Rectangle(size, delay, phi, this._radius, color);
    });

    document.body.style.background = this._xor128.pick(
      this._palette.colors,
    ).hex;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg);

    this.ctx.translate(this.width / 2, this.height / 2);

    this._rectangles.forEach((rectangle) => rectangle.update(t));
    this._rectangles.sort((a, b) => b.t - a.t);
    this._rectangles.forEach((rectangle) => rectangle.draw(this.ctx));

    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    this.setup();
  }
}

export { Sketch };
