import { Engine, SimplexNoise, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Shape } from "./arcs.js";

class Sketch extends Engine {
  preload() {
    this._cols = 4;
    this._scl = 0.9;
    this._background_color = Color.fromMonochrome(245);
    this._time_scl = 0.1;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    this._noise = new SimplexNoise();
    this._random = new XOR128();

    this._arc_scl = this.width / this._cols;
    this._shapes = Array(this._cols * this._cols)
      .fill(null)
      .map(
        (_, i) =>
          new Shape(
            i % this._cols,
            Math.floor(i / this._cols),
            this._arc_scl,
            this._noise,
            this._random
          )
      );

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color: green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;
    const theta = t * Math.PI * 2;
    const tx = (1 + Math.cos(theta)) * this._time_scl;
    const ty = (1 + Math.sin(theta)) * this._time_scl;

    this.ctx.save();
    this.background(this._background_color.rgba);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._shapes.forEach((s) => {
      s.move(tx, ty);
      s.show(this.ctx);
    });

    this.ctx.restore();

    if (this._recording && this.frameCount > 0 && t == 0) {
      console.log("%cRecording stopped", "color: red");
      this.stopRecording();
      this.saveRecording();
      this.noLoop();
      console.log("%cRecording saved!", "color: green");
    }
  }

  click() {
    this.setup();
  }
}

export { Sketch };
