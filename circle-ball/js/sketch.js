import { Engine, SimplexNoise } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Particle } from "./particle.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._scl = 0.85;
    this._particles_num = 50000;
    this._particles_max_d = 200;
  }

  setup() {
    this._seed = new Date().getTime();
    console.log("Using seed", this._seed);
    this._noise = new SimplexNoise(this._seed);
    this._xor128 = new XOR128(this._seed);

    this._particles = Array(this._particles_num)
      .fill()
      .map(() => {
        while (true) {
          const x = this._xor128.random_interval(
            0,
            this.width / 2 + this._particles_max_d
          );
          const y = this._xor128.random_interval(
            0,
            this.height / 2 + this._particles_max_d
          );

          if (Math.hypot(x, y) < this.width / 2 + this._particles_max_d)
            return new Particle(x, y, this._particles_max_d, this._noise);
        }
      });

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;
    const theta = Math.PI * 2 * t;
    const nx = 1 + Math.cos(theta);
    const ny = 1 + Math.sin(theta);

    // draw background
    this.ctx.save();
    this.background("rgb(15, 15, 15)");
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);

    // draw a circle
    this.ctx.save();
    this.ctx.strokeStyle = "rgb(240, 240, 240)";
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    this.ctx.stroke();
    // also make it a clippath
    this.ctx.clip();

    // draw particles
    this._particles.forEach((p) => {
      p.update(nx, ny);
      p.draw(this.ctx);
    });

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
