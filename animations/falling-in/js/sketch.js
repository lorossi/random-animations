import { Engine, XOR128, PaletteFactory } from "./lib.js";
import { HalfCircle } from "./half-circle.js";
import { Particle } from "./particle.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._scl = 0.9;
    this._particle_count = 2500;
    this._hex_palettes = [
      ["#DCDCDC", "#0F0F0F"],
      ["#EEE7D7", "#27221F"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    const palette = palette_factory.getRandomPalette(this._xor128);
    [this._bg_color, this._fg_color] = palette.colors;

    const circle_r = this.height * 0.5;
    const inner_r = circle_r * 0.45;
    const theta_1 = this._xor128.random(Math.PI * 2);
    const span = Math.PI * 0.975;
    const theta_2 = theta_1 + span;
    const lines = this._xor128.random_int(3, 8);

    this._half_circle = new HalfCircle(
      this.width / 2,
      this.height / 2,
      circle_r,
      inner_r,
      theta_1,
      theta_2,
      this._fg_color,
      lines,
    );
    0.95;

    const theta_gap = (Math.PI - span) / 2;
    this._particles = new Array(this._particle_count).fill().map(() => {
      const theta =
        this._xor128.random(Math.PI * 2 - span - 2 * theta_gap) +
        theta_2 +
        theta_gap;

      const color = this._fg_color;
      const p_seed = this._xor128.random_int(1e9);
      return new Particle(circle_r, inner_r, theta, p_seed, color);
    });

    document.body.style.backgroundColor = this._bg_color.hex;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg_color);
    this.scaleFromCenter(this._scl);

    this._half_circle.show(this.ctx);

    this.ctx.translate(this.width / 2, this.height / 2);

    this._particles.forEach((particle) => {
      particle.update(t);
      particle.show(this.ctx);
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
