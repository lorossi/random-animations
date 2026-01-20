import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Container } from "./container.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._circles_num = 3;
    this._cols = 2;
    this._circles_scl = 0.9;
    this._circles_bars_ratio = 0.85;
    this._circles_bars_num = 50;
    this._noise_scl = 0.5;
    this._time_scl = 1;
    this._container_scl = 0.95;
    this._scl = 0.95;

    this._background_color = Color.fromMonochrome(15);
    this._circles_color = Color.fromMonochrome(240, 0.75);
    this._outline_color = Color.fromMonochrome(255, 0.5);
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._containers = new Array(this._cols * this._cols)
      .fill(null)
      .map((_, i) => {
        const x = (i % this._cols) * (this.width / this._cols);
        const y = Math.floor(i / this._cols) * (this.height / this._cols);
        const width = this.width / this._cols;
        const noise = new SimplexNoise(this._xor128.random_int(1e9));
        const c = new Container(x, y, this._circles_num, width);
        c.setAttributes(
          this._container_scl,
          this._circles_scl,
          this._circles_bars_ratio,
          this._circles_bars_num,
        );
        c.setColors(this._circles_color, this._outline_color);
        c.initDependencies(
          this._xor128,
          noise,
          this._noise_scl,
          this._time_scl,
        );
        c.init();
        return c;
      });

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this.background(this._background_color.rgb);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._containers.forEach((c) => {
      c.update(t);
      c.draw(this.ctx);
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
