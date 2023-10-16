import { Engine, SimplexNoise, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Slice } from "./slice.js";

class Sketch extends Engine {
  preload() {
    this._slices_num = 8;
    this._seeds_num = 2;
    this._background_color = Color.fromMonochrome(240);
    this._particle_color = Color.fromMonochrome(15);

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._random = new XOR128(this._seed);

    this._noise_scl = this._random.random(0.0005, 0.001);
    this._noises = Array(this._seeds_num)
      .fill(0)
      .map(() => new SimplexNoise(this._random.random_int(1e9)));

    this._slices = Array(this._seeds_num)
      .fill(0)
      .map((_, i) => {
        const x = (i / this._slices_num) * this.width;
        const w = this.width / this._slices_num;
        const h = this.height;

        const s = new Slice(x, 0, w, h);
        s.initDependencies(
          this._random,
          this._noises[i % this._seeds_num],
          this._particle_color,
          this._noise_scl
        );

        return s;
      });

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }

    this.background(this._background_color.rgb);
  }

  draw() {
    this._slices.forEach((s) => s.update());

    this.ctx.save();

    for (let i = 0; i < this._slices_num / this._seeds_num; i++) {
      this.ctx.save();
      const dx = (this.width / this._slices_num) * this._seeds_num * i;
      this.ctx.translate(dx, 0);

      this._slices.forEach((s) => s.show(this.ctx));

      this.ctx.restore();
    }

    if (this._slices.every((s) => s.ended)) {
      this.noLoop();
      console.log("End of sketch. Click to restart.");
      if (this._recording) {
        this.stopRecording();
        console.log("%cRecording stopped", "color:red");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
      }
    }
  }

  click() {
    if (this._recording) return;
    this.setup();
    this.loop();
  }
}

export { Sketch };
