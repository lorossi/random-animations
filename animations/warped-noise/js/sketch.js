import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { ColorFactory } from "./palette.js";

class Sketch extends Engine {
  preload() {
    this._noise_scl = 0.0025; // about 0.002
    this._distortion_scl = 1.5; // between 0.5 and 2.5 looks good
    this._noises_count = 3;
    this._rect_scl = 2;
    this._border = 25;
  }

  setup() {
    this._seed = new Date().getTime();

    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._seed);
    this._colorFactory = new ColorFactory(this._xor128);

    this._noise_scl *= this._xor128.random_interval(1, 0.1);
    this._distortion_scl *= this._xor128.random_interval(1, 0.1);
    this._title = `warped-noise-${this._xor128.shuffle(this._seed.toString())}`;
  }

  draw() {
    this.noLoop();

    this.ctx.save();

    for (let x = 0; x < this.width; x += this._rect_scl) {
      for (let y = 0; y < this.height; y += this._rect_scl) {
        const nx = x * this._noise_scl;
        const ny = y * this._noise_scl;
        const levels = this._warpNoise(nx, ny);
        const c = this._colorFactory.mix(levels);
        this.ctx.fillStyle = c.rgb;
        this.ctx.fillRect(x, y, this._rect_scl, this._rect_scl);
      }
    }

    this.ctx.restore();
  }

  _warpNoise(x, y, level = 0, color = undefined) {
    if (level == this._noises_count) return color;

    const p = this._noise.noise(x, y);
    const d = p * this._distortion_scl;
    const c = (p + 1) / 2;

    if (color == undefined) color = [c];
    else color.push(c);

    return this._warpNoise(x + d, y + d, level + 1, color);
  }

  click() {
    this.setup();
    this.draw();
  }

  keyPress(_, c) {
    console.log(c);
    switch (c) {
      case 13: // enter
        this.saveFrame(this._title);
        break;
      default:
        break;
    }
  }
}

export { Sketch };
