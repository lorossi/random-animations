import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Constellation } from "./constellation.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._scl = 0.9;
    this._constellation_scl = 0.9;
    this._constellations_cols = 10;
    this._cols = 4;
    this._stars_num = 5;
    this._stars_r = 3;
    this._fg_color = Color.fromMonochrome(245);
    this._star_color = Color.fromMonochrome(255);
    this._line_color = Color.fromMonochrome(200);
    this._bg_color = Color.fromMonochrome(15);
    this._noise_scl = 0.0002;
    this._time_scl = 0.125;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    const noise_seed = this._xor128.random_int(1e16);
    this._noise = new SimplexNoise(noise_seed);

    const star_seeds = new Array(this._stars_num)
      .fill(0)
      .map(() => this._xor128.random_int(1e3));

    const c_size = this.width / this._cols;
    this._constellations = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = (i % this._cols) * c_size;
      const y = Math.floor(i / this._cols) * c_size;
      const constellation = new Constellation(
        x,
        y,
        c_size,
        this._constellation_scl,
        this._stars_num,
        this._constellations_cols
      );
      constellation.setStarsSeeds(star_seeds);
      constellation.setStarsR(this._stars_r);
      constellation.setNoise(this._noise, this._noise_scl, this._time_scl);
      constellation.setColors(
        this._fg_color,
        this._star_color,
        this._line_color
      );
      return constellation;
    });

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg_color);
    this.scaleFromCenter(this._scl);

    this._constellations.forEach((constellation) => {
      constellation.update(t);
      constellation.show(this.ctx);
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
