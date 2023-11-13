import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Particle } from "./particle.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._cols = 35;
    this._bg_color = Color.fromMonochrome(245);
    this._particle_color = Color.fromMonochrome(15);
  }

  setup() {
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }

    const size = this.width / this._cols;
    const max_dist = this.width / 2;
    this._particles = Array(this._cols * this._cols)
      .fill()
      .map((_, i) => {
        const x = i % this._cols;
        const y = Math.floor(i / this._cols);

        const xx = x * size - this.width / 2;
        const yy = y * size - this.height / 2;

        if (Math.hypot(xx, yy) >= max_dist) return null;

        return new Particle(xx, yy, size, this._particle_color);
      })
      .filter((p) => p !== null);
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.background(this._bg_color);

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this._particles.forEach((p) => p.update(t));
    this._particles.forEach((p) => p.show(this.ctx));
    this.ctx.restore();

    if (t >= 1 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }
}

export { Sketch };
