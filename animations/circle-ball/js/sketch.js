import { Engine, Color, SimplexNoise, XOR128 } from "./lib.js";
import { Particle } from "./particle.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._scl = 0.85;
    this._time_scl = 1;
    this._noise_scl = 0.0025;

    this._bg = Color.fromMonochrome(15);
    this._fg = Color.fromMonochrome(240);

    this._particles_num = 50000;
    this._particles_max_d = 200;
  }

  setup() {
    this._seed = new Date().getTime();
    this._noise = new SimplexNoise(this._seed);
    this._xor128 = new XOR128(this._seed);

    this._particles = Array(this._particles_num)
      .fill()
      .map(() => {
        while (true) {
          const x = this._xor128.random_interval(
            0,
            this.width / 2 + this._particles_max_d,
          );
          const y = this._xor128.random_interval(
            0,
            this.height / 2 + this._particles_max_d,
          );

          if (Math.hypot(x, y) < this.width / 2 + this._particles_max_d)
            return new Particle(
              x,
              y,
              this._particles_max_d,
              this._fg,
              this._noise,
              this._noise_scl,
            );
        }
      });

    document.body.style.background = this._bg.hex;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    const theta = Math.PI * 2 * t;

    const tx = ((1 + Math.cos(theta)) / 2) * this._time_scl;
    const ty = ((1 + Math.sin(theta)) / 2) * this._time_scl;

    // draw background
    this.ctx.save();
    this.background(this._bg);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);

    // draw a circle
    this.ctx.save();
    this.ctx.strokeStyle = this._fg.rgba;
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    this.ctx.stroke();
    // also make it a clippath
    this.ctx.clip();

    // draw particles
    this._particles.forEach((p) => {
      p.update(tx, ty);
      p.draw(this.ctx);
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

  click() {
    this.setup();
  }
}

export { Sketch };
