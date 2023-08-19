import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Ring } from "./ring.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._particle_count = 1000;
    this._rings_count = 4;
    this._orbit_width = 0.8;
    this._scl = 0.9;
  }

  setup() {
    const inner_r = (this.width / 2) * (1 - this._orbit_width);
    const outer_r = this.width / 2;

    const xor128 = new XOR128();
    const noise = new SimplexNoise();

    this._rings = Array(this._rings_count)
      .fill()
      .map(
        () => new Ring(this._particle_count, inner_r, outer_r, noise, xor128)
      );

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this.background("black");
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);

    this._rings.forEach((ring, i) => {
      const scl = 1 - i / this._rings_count;
      this.ctx.save();
      this.ctx.scale(scl, scl);
      ring.update(t);
      ring.show(this.ctx);
      this.ctx.restore();
    });

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
