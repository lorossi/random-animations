import { Engine, XOR128, PaletteFactory, Color } from "./lib.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._bg = Color.fromMonochrome(240);
    this._scl = 0.95;

    this._hex_palettes = [
      ["#00296b", "#003f88", "#00509d", "#fdc500", "#ffd500"],
      ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b"],
      ["#390099", "#9e0059", "#ff0054", "#ff5400", "#ffbd00"],
      ["#011627", "#fdfffc", "#2ec4b6", "#e71d36", "#ff9f1c"],
      ["#233d4d", "#fe7f2d", "#fcca46", "#a1c181", "#619b8a"],
      ["#000000", "#3F3F3F", "#7F7F7F", "#BFBFBF", "#FFFFFF"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, true);

    this._grid = new Grid(this.width, this.height, this._palette, this._xor128);
    this._grid.split();

    document.body.style.background = this._bg.rgba;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;
    const eased_t = this._easeInOutSin(t, 3);

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._grid.update(eased_t);
    this._grid.show(this.ctx);
    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _easeInOutSin(x, n = 3) {
    return Math.sin((x * Math.PI) / 2) ** n;
  }

  click() {
    this.setup();
  }
}

export { Sketch };
