import { Engine, XOR128, PaletteFactory } from "./lib.js";
import { Ribbon } from "./ribbon.js";

class Sketch extends Engine {
  preload() {
    this._recording = false;

    this._scl = 0.8;
    this._points_num = 400;
    this._line_width = 20;
    this._line_speed = 4;
    this._lines_num = 11;

    this._hex_palettes = [
      ["#0F0F0F", "#F0F0F0"],
      ["#19719C", "#FFFFFF"],
      ["#E68C3A", "#F4F2EF"],
      ["#EAE2D8", "#197F7F"],
      ["#EAE2D8", "#CC5F3A"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._initial_direction = [
      this._xor128.pick([-1, 1]) * this._line_speed,
      this._xor128.pick([-1, 1]) * this._line_speed,
    ];
    this._phi = this._xor128.random();

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);
    this._fg_color = this._palette.getColor(0);
    this._bg_color = this._palette.getColor(1);

    this._setPageColor(this._bg_color);

    this._ribbons = new Array(this._lines_num).fill().map((_, i) => {
      const y = (i + 0.5) * (this.height / (this._lines_num + 1));
      const initial_direction = [...this._initial_direction];
      const r = new Ribbon(
        0,
        y,
        this._points_num,
        this.width,
        initial_direction,
        this._line_width,
      );
      const preload =
        ((r.period / this._lines_num) * i + this._phi * r.period) % r.period;
      r.setColors(this._fg_color, this._bg_color);
      r.preload(preload);
      return r;
    });

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    this.ctx.save();

    this.background(this._bg_color);
    this.scaleFromCenter(this._scl);
    this.ctx.save();
    this._ribbons.forEach((ribbon) => {
      ribbon.update();
      ribbon.draw(this.ctx);
    });

    this.ctx.restore();

    const ended = this._ribbons.every((r) => r.ended);

    if (ended && this._recording) {
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

  _hashInt(x) {
    let h = 0;
    for (let i = 0; i < x.length; i++) {
      h = (h << 5) - h + x.charCodeAt(i);
      h |= 0;
    }
    return h;
  }

  _setPageColor(color) {
    document.body.style.backgroundColor = color.rgb;
  }
}

export { Sketch };
