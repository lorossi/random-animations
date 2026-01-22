import { Color } from "./lib.js";

class Sine {
  constructor(x, y, width, height, font) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._font = font;
    this._text_fill = Color.fromMonochrome(64);
    this._line_scl = 1;
  }

  initDependencies(noise, xor128) {
    this._noise = noise;
    this._xor128 = xor128;

    this._seed = this._xor128.random();
  }

  setAttributes(fill_ch, noise_scl, color_noise_scl, time_scl, text) {
    this._fill_ch = fill_ch;
    this._noise_scl = noise_scl;
    this._color_noise_scl = color_noise_scl;
    this._time_scl = time_scl;
    this._text = text;
  }

  init() {
    this._repetitions = 32;
    this._rotation = this._xor128.random_interval(0, Math.PI / 360);

    // calculate the length of the text
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `${this._width}px ${this._font}`;
    const ex = ctx.measureText("x").width;
    this._text_width = ctx.measureText(this._text).width + ex / 8;

    // the lines fill the canvas until the text
    this._lines_num = Math.floor(
      (this._height - this._text_width) / this._line_scl,
    );
  }

  update(t) {
    const theta = t * Math.PI * 2;
    const tx = (1 + Math.cos(theta)) * this._time_scl;
    const ty = (1 + Math.sin(theta)) * this._time_scl;

    this._widths = new Array(this._lines_num).fill(0).map((_, i) => {
      const n =
        (this._noise.noise(tx, ty, i * this._noise_scl, this._seed) + 1) / 2;
      const theta = (i * this._repetitions) / this._lines_num;
      const modulation = Math.cos((t - this._seed - theta) * Math.PI * 2);
      const w = n * this._width * modulation * 1.25;
      return w;
    });

    this._fills = new Array(this._lines_num + 1).fill(0).map((_, i) => {
      const n = this._noise.noise(
        tx + this._seed,
        ty + this._seed,
        i * this._color_noise_scl,
        this._seed + 1000,
      );
      const ch = (this._fill_ch * (n + 1)) / 2;
      return Color.fromMonochrome(ch, 1);
    });
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);

    // draw sines
    ctx.save();
    // small offset to align the sines with the text
    for (let i = 0; i < this._lines_num; i++) {
      const w = this._widths[i];
      const y = i * this._line_scl;
      ctx.fillStyle = this._fills[i].rgba;
      ctx.fillRect(-w * 0.5 - this._width * 0.1, y, w, this._line_scl);
    }
    ctx.restore();

    // draw text
    ctx.save();
    ctx.font = `${Math.floor(this._width)}px Recoleta`;
    ctx.fillStyle = this._text_fill.rgba;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.translate(0, this._height);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(this._text, 0, 0);
    ctx.restore();

    ctx.restore();
  }

  get rotation() {
    return this._rotation;
  }
}

export { Sine };
