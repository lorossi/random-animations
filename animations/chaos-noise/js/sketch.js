import { Engine, SimplexNoise, Point, Color, XOR128 } from "./lib.js";
import { Pairing } from "./pairing.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Texture } from "./texture.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._noise_scl = 0.0015;
    this._noise_rho = 0.5;
    this._bg = Color.fromMonochrome(240);

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._cols = this._xor128.random_int(17, 30);
    this._palette = PaletteFactory.getRandomPalette(this._xor128, true);

    const seed = this._xor128.random_int(1e9);
    const pairing_size = this.width / this._cols;
    this._pairings = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      return new Pairing(
        x * pairing_size,
        y * pairing_size,
        pairing_size,
        seed,
        this._noise_scl,
        this._palette.copy().colors
      );
    });

    this._texture = new Texture(this.width * 1.5, 4, this._seed);

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    const time_theta = t * 2 * Math.PI;
    const tx = this._noise_rho * (1 + Math.cos(time_theta));
    const ty = this._noise_rho * (1 + Math.sin(time_theta));

    this.ctx.save();
    this.background(this._bg);

    this.ctx.save();
    this.scaleFromCenter(this._scl);
    this._pairings.forEach((p) => p.update(tx, ty));
    this._pairings.forEach((p) => p.draw(this.ctx));
    this.ctx.restore();

    this._texture.draw(this.ctx);

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
    this.draw();
  }
}

export { Sketch };
