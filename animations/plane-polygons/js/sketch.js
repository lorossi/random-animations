import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._bg = Color.fromMonochrome(240);
    this._scl = 0.95;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._palette = PaletteFactory.getRandomPalette(this._xor128, true);

    this._grid = new Grid(this.width, this.height, this._palette, this._xor128);
    this._grid.split();

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
