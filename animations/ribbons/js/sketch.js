import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Grid } from "./grid.js";
import { Palette, PaletteFactory } from "./palette-factory.js";

class Sketch extends Engine {
  preload() {
    this._cols = 100;
    this._walkers_num = 5;
    this._walker_noise_scl = 0.05;
    this._scl = 0.95;

    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const palette = PaletteFactory.getRandomPalette(this._xor128);

    // sort either from low to high or high to low so the background is always either dark or light
    const sort_direction = this._xor128.random_bool() ? 1 : -1;
    const colors = palette.colors.sort((a, b) => sort_direction * (a.h - b.h));

    // extract the first color as the background color and the rest as the walkers' palette
    this._bg = colors[0];
    this._walkers_palette = new Palette(colors.slice(1));
    // initialize the grid
    this._grid = new Grid(this._cols, this.width);
    this._grid.setRandomSeed(this._xor128.random_int(1e16));
    this._grid.setPalette(this._walkers_palette);
    this._grid.setNoiseScl(this._walker_noise_scl);
    this._grid.setWalkerLineNum(3);

    for (let i = 0; i < this._walkers_num; i++) this._grid.addWalker();
    // set the background color
    document.body.style.backgroundColor = this._bg.rgb;

    this._ended = false;

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    if (this._ended) {
      return;
    }

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._ended = this._grid.update();
    this._grid.show(this.ctx);

    this.ctx.restore();

    if (this._ended) {
      console.log("ended");
      if (this._recording) {
        this._recording = false;
        this.stopRecording();
        console.log("%cRecording stopped. Saving...", "color:yellow");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
      }
    }
  }

  click() {
    if (this._recording) return;
    this._reset();
  }

  _reset() {
    this.setup();
  }
}

export { Sketch };
