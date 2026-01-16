import {
  Color,
  Engine,
  GradientPalette,
  Palette,
  PaletteFactory,
  Point,
  SimplexNoise,
  XOR128,
} from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._circles_num = 250;
    this._noise_scl = 0.0025;
    this._time_scl = 0.75;

    this._min_r = 25;
    this._max_r = 100;

    this._bg = Color.fromMonochrome(240);
    this._hex_palettes = [
      ["#0081A7", "#00AFB9", "#FDFCDC", "#FED9B7", "#F07167"],
      ["#780000", "#C1121F", "#FDF0D5", "#003049", "#669BBC"],
      ["#001524", "#15616D", "#FFECD1", "#FF7D00", "#78290F"],
      ["#2B2D42", "#8D99AE", "#EDF2F4", "#EF233C", "#D90429"],
      ["#003049", "#D62828", "#F77F00", "#FCBF49", "#EAE2B7"],
      ["#355070", "#6D597A", "#B56576", "#E56B6F", "#EAAC8B"],
      ["#5F49F2", "#527AF2", "#F2B807", "#F28907", "#F2220F"],
      ["#D904A0", "#D904CB", "#9305F2", "#05AFF2", "#05C7F2"],
    ];

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._seed);

    this._scl = new Array(2).fill(0).map(() => this._xor128.pick([-1, 1]));
    this._rotation = this._xor128.random_int(4) * (Math.PI / 2);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, false);
    if (this._xor128.random_bool()) this._palette.reverse();

    this._circles = new Array(this._circles_num).fill(null).map(() => {
      const x = this._xor128.random_int(this.width);
      const y = this._xor128.random_int(this.height);
      const size = this.width;
      return new Circle(
        x,
        y,
        size,
        this._min_r,
        this._max_r,
        this._noise_scl,
        this._noise,
        this._palette,
      );
    });

    this._bg = this._palette.getRandomColor(this._xor128);
    document.body.style.background = this._bg.rgb;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    const theta = t * Math.PI * 2;
    const tx = (1 + Math.cos(theta)) * 0.5 * this._time_scl;
    const ty = (1 + Math.sin(theta)) * 0.5 * this._time_scl;

    this.ctx.save();

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.rotate(this._rotation);
    this.ctx.scale(this._scl[0], this._scl[1]);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    if (delta_frame == 0) this._gradientBackground(4);

    this._circles.forEach((circle) => {
      circle.update(tx, ty);
      circle.show(this.ctx);
    });
    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _gradientBackground(scale) {
    this.ctx.save();

    for (let y = 0; y < this.height; y += scale) {
      const t = y / this.height;
      const c = this._palette.getSmoothColor(t);
      this.ctx.fillStyle = c.rgba;
      this.ctx.fillRect(0, y, this.width, scale);
    }

    this.ctx.restore();
  }

  click() {
    this.setup();
  }
}

export { Sketch };
