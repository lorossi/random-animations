import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";

class Sketch extends Engine {
  preload() {
    this._noise_scl = 0.003;
    this._time_scl = 0.25;
    this._texture_scl = 1;
    this._noise_levels = 8;
    this._noise_eps = 0.0025;

    this._duration = 300;
    this._recording = false;
    this._background = Color.fromMonochrome(15);
    this._foreground = Color.fromMonochrome(245);
  }

  setup() {
    const seed = new Date().getTime();
    this._random = new XOR128(seed);
    this._noise = new SimplexNoise(seed);

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;
    const theta = t * 2 * Math.PI;
    const tx = (1 + Math.cos(theta)) * this._time_scl;
    const ty = (1 + Math.sin(theta)) * this._time_scl;

    this.ctx.save();
    this.background(this._background.rgb);

    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const n = this._noise.noise(
          x * this._noise_scl,
          y * this._noise_scl,
          tx,
          ty
        );
        const nn = (n + 1) / 2;
        const level = this._inRange(nn);

        if (level == -1) continue;

        const ch = this._easeOutPoly(level / this._noise_levels) * 255;
        this.ctx.save();
        this.ctx.fillStyle = Color.fromMonochrome(ch).rgb;
        this.ctx.translate(x, y);
        this.ctx.fillRect(0, 0, this._texture_scl, this._texture_scl);
        this.ctx.restore();
      }
    }

    this.ctx.restore();

    if (this.frameCount > 0 && t == 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _inRange(n) {
    for (let i = 1; i < this._noise_levels; i++) {
      if (Math.abs(n - i / this._noise_levels) < this._noise_eps) {
        return i;
      }
    }

    return -1;
  }

  _easeOutPoly(x, n = 2) {
    return 1 - (1 - x) ** n;
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
