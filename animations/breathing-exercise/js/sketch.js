import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(245);
    this._fg = Color.fromHEX("#508AC9");
    this._text_color = Color.fromMonochrome(35);
    this._circle_scl = 0.65;
  }

  setup() {
    this._phases_duration = [4 * 60, 7 * 60, 8 * 60];
    this._current_phase = 0;
    this._current_frames = this.frameCount;
  }

  draw() {
    const delta_frame = this.frameCount - this._current_frames;
    const t = delta_frame / this._phases_duration[this._current_phase];

    this.ctx.save();
    this.background(this._bg);
    this.ctx.translate(this.width / 2, this.height / 2);

    this.ctx.fillStyle = this._fg.rgba;
    const e = this._easeInOutPoly(t);

    switch (this._current_phase) {
      case 0:
        this._drawCircle(e);
        break;
      case 1:
        this._drawCircle(1);
        break;
      case 2:
        this._drawCircle(1 - e);
        break;
      default:
        break;
    }

    this._writeText();

    this.ctx.restore();

    if (delta_frame > this._phases_duration[this._current_phase]) {
      this._current_phase =
        (this._current_phase + 1) % this._phases_duration.length;
      this._current_frames = this.frameCount;
    }
  }

  _drawCircle(t) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, (t * this.width * this._circle_scl) / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  _writeText() {
    const text = ["breathe in", "hold", "breathe out"][this._current_phase];
    const text_size = Math.floor((1 - this._circle_scl) * this.height * 0.2);
    this.ctx.save();
    this.ctx.translate(0, this.height / 2 - text_size);
    this.ctx.fillStyle = this._text_color.rgba;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "bottom";
    this.ctx.font = `${text_size}px Mirava`;
    this.ctx.fillText(text, 0, 0);

    this.ctx.restore();
  }

  _easeInPoly(x, n = 2) {
    return x ** n;
  }

  _easeOutPoly(x, n = 2) {
    return 1 - (1 - x) ** n;
  }

  _easeInOutPoly(x, n = 2) {
    if (x < 0.5) return this._easeInPoly(x * 2, n) / 2;

    return this._easeOutPoly((x - 0.5) * 2, n) / 2 + 0.5;
  }

  click() {
    this.setup();
  }
}

export { Sketch };
