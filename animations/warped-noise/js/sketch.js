import { Engine, SimplexNoise, XOR128, Color } from "./lib.js";

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

    this._colors = this._generateColors();
    this._bg = Color.fromMonochrome(240);

    this._noise_scl *= this._xor128.random_interval(1, 0.1);
    this._distortion_scl *= this._xor128.random_interval(1, 0.1);

    document.body.style.backgroundColor = this._bg.rgb;
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg);

    for (let x = 0; x < this.width; x += this._rect_scl) {
      for (let y = 0; y < this.height; y += this._rect_scl) {
        const nx = x * this._noise_scl;
        const ny = y * this._noise_scl;
        const levels = this._warpNoise(nx, ny);

        const c = this._mixColors(levels);
        this.ctx.fillStyle = c.rgb;
        this.ctx.fillRect(x, y, this._rect_scl, this._rect_scl);
      }
    }

    this.ctx.restore();
  }

  _warpNoise(x, y, level = 0, color = undefined) {
    if (level == this._noises_count) return color;

    const p = this._noise.noise(x, y, 1000);
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

  _generateColors() {
    const h = this._xor128.random_int(0, 360);
    return new Array(3)
      .fill(0)
      .map((_, i) => Color.fromHSL((h + i * 30) % 360, 100, 50));
  }

  _mixColors(levels) {
    let components = new Array(3).fill(0);
    levels = levels
      .map((l) => l / levels.reduce((acc, curr) => acc + curr, 0)) // normalize
      .forEach((l, i) => {
        if (i < this._colors.length) {
          // get the rgb values
          components[0] += this._colors[i].r * l;
          components[1] += this._colors[i].g * l;
          components[2] += this._colors[i].b * l;
        }
      });

    components = components.map((c) =>
      Math.min(255, Math.max(0, Math.floor(c))),
    );
    return new Color(...components);
  }
}

export { Sketch };
