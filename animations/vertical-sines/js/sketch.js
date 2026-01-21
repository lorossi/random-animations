import { Engine, XOR128, PaletteFactory, Point, Color } from "./lib.js";
import { Sines } from "./sines.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._omega = 2;
    this._hex_palettes = [
      ["#E8A93F", "#0B87BA", "#01112E"],
      ["#EDAE49", "#D1495B", "#00798C"],
      ["#2274A5", "#F75C03", "#F1C40F"],
      ["#084C61", "#DB504A", "#E3B505"],
      ["#006D77", "#83C5BE", "#EDF6F9"],
    ];
    this._segments_num = 25;

    this._scl = 0.9;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._sines_num = this._xor128.random_int(4, 8);
    this._vertical_omega = this._xor128.random(1, 2);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);

    let colors;
    [this._bg, ...colors] = this._palette.colors;

    this._sines = [];
    for (let i = 0; i < this._sines_num; i++) {
      const phi = (i / this._sines_num) * Math.PI * 2;
      const dx = ((i + 1) / (this._sines_num + 1)) * this.width;
      const width = this.width / this._sines_num;

      const s = new Sines(
        dx,
        width,
        this.height,
        phi,
        this._omega,
        this._vertical_omega,
        this._segments_num,
        colors[i % colors.length],
        colors[i % colors.length].darken(0.25),
      );
      this._sines.push(s);
    }

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

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._sines.forEach((s) => s.show(this.ctx, t));

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
