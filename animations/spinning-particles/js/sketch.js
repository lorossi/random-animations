import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Particle } from "./particle.js";

class Sketch extends Engine {
  preload() {
    this._particles_num = 350;
    this._scl = 0.9;
    this._bg = Color.fromMonochrome(15, 0.2);

    this._duration = 500;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._particles = new Array(this._particles_num).fill().map(() => {
      const r = this._xor128.random(0.5, 1);
      return new Particle((this.width / 2) * r, this._xor128);
    });
    this._direction = this._xor128.random_bool() ? 1 : -1;

    this.background(this._bg.rgb);
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this.ctx.fillStyle = this._bg.rgba;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this._particles.forEach((p) => {
      p.update(t * this._direction);
      p.draw(this.ctx);
    });
    this.ctx.restore();

    if (t == 0 && this.frameCount > 0 && this._recording) {
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
