import { Engine, XOR128, Palette, PaletteFactory } from "./lib.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._cols = 100;
    this._walkers_num = 5;
    this._walker_noise_scl = 0.005;
    this._scl = 0.95;

    this._hex_palettes = [
      ["#0F0F0F", "#373737", "#606060", "#898989", "#B2B2B2", "#DBDBDB"],
      ["#086788", "#07a0c3", "#f0c808", "#fff1d0", "#dd1c1a"],
      ["#0c0a3e", "#7b1e7a", "#b33f62", "#f9564f", "#f3c677"],
      ["#0d1b2a", "#1b263b", "#415a77", "#778da9", "#e0e1dd"],
      ["#0d1321", "#1d2d44", "#3e5c76", "#748cab", "#f0ebd8"],
      ["#0a2463", "#3e92cc", "#fffaff", "#d8315b", "#1e1b18"],
      ["#011627", "#fdfffc", "#2ec4b6", "#e71d36", "#ff9f1c"],
      ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
      ["#2f4858", "#33658a", "#86bbd8", "#f6ae2d", "#f26419"],
    ];

    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, false);
    if (this._xor128.random_bool()) this._palette.reverse();

    // extract the first color as the background color and the rest as the walkers' palette
    let colors;
    [this._bg, ...colors] = this._palette.colors;
    this._walkers_palette = new Palette(colors);
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
