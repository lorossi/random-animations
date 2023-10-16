import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Circle, Square } from "./shape.js";

class Sketch extends Engine {
  preload() {
    this._max_tries = 10000;
    this._max_items = 1000;
    this._min_r = 5;
    this._max_r = 200;
    this._scl = 0.9;

    this._background = "#FFFDEA";
    this._palette = ["#ef476f", "#ffd166", "#118ab2", "#06d6a0"];
    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = Date.now();
    this._xor128 = new XOR128(seed);
    this._shapes = [];

    this.background(this._background);

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }

    let placed = true;

    while (placed) {
      placed = false;
      let tries = 0;
      while (this._shapes.length < this._max_items && tries < this._max_tries) {
        const nr = this._xor128.random(this._min_r, this._max_r);
        const nx = this._xor128.random(nr, this.width - nr);
        const ny = this._xor128.random(nr, this.height - nr);

        let ns = this._xor128.random_bool()
          ? new Circle(nx, ny, nr)
          : new Square(nx, ny, nr);

        if (this._shapes.some((s) => s.overlap(ns))) tries++;
        else {
          placed = true;
          this._shapes.push(ns);
          break;
        }
      }

      if (!placed) console.log({ tries, shapes: this._shapes.length });
    }
  }

  draw() {
    if (this._shapes.length === 0) {
      this.noLoop();
      return;
    }

    const ns = this._shapes.pop();

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this.ctx.save();
    this.ctx.fillStyle = this._xor128.pick(this._palette);
    ns.show(this.ctx);
    this.ctx.restore();

    this.ctx.restore();

    const t = (this.frameCount / this._duration) % 1;

    if (t >= 1 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    this.setup();
    this.loop();
  }
}

export { Sketch };
