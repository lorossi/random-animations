import { Engine, Color, PaletteFactory, XOR128 } from "./lib.js";
import { Grid } from "./grid.js";
import { Texture } from "./texture.js";

class Sketch extends Engine {
  preload() {
    this._cols = 20;
    this._scl = 1;
    this._texture_scl = 4;
    this._texture_oversample = 1.1;

    this._hex_palettes = [
      ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b"],
      ["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557"],
      ["#267365", "#F2CB05", "#F29F05", "#F28705", "#F23030"],
      ["#D9A404", "#D97904", "#F25C05", "#D93232", "#0D0D0D"],
      ["#FFFCF2", "#CCC5B9", "#403D39", "#252422", "#EB5E28"],
    ];

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, false);
    this._grid = new Grid(this.width, this._cols, this._seed, this._palette);
    this._texture = new Texture(
      this.width * this._texture_oversample,
      this._texture_scl,
      this._xor128
    );

    this._bg = this._palette.getRandomColor(this._xor128);
    document.body.style.backgroundColor = this._bg.hex;

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
    this.scaleFromCenter(this._scl);

    this._grid.update(t);
    this._grid.show(this.ctx);

    this.ctx.restore();

    this._texture.draw(this.ctx);

    this.ctx.save();
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
