import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Ribbon } from "./ribbon.js";
import { PaletteFactory } from "./palette-factory.js";

// https://pinterest.com/pin/27514247717114473/

class Sketch extends Engine {
  preload() {
    this._recording = false;

    this._scl = 0.8;
    this._points_num = 400;
    this._line_width = 20;
    this._line_speed = 4;
    this._lines_num = 11;
  }

  setup() {
    const seed = Date.now();
    this._xor128 = new XOR128(seed);
    this._initial_direction = [
      this._xor128.pick([-1, 1]) * this._line_speed,
      this._xor128.pick([-1, 1]) * this._line_speed,
    ];
    this._phi = this._xor128.random();
    const palette = PaletteFactory.getRandomPalette(this._xor128);
    this._fg_color = palette.getColor(0);
    this._bg_color = palette.getColor(1);

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
        this._line_width
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

  click() {
    this.setup();
  }

  draw() {
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
