import { Engine, XOR128, Color, PaletteFactory } from "./lib.js";
import { Particle } from "./particle.js";

class Sketch extends Engine {
  preload() {
    this._particles_num = 350;
    this._scl = 0.9;
    this._bg = Color.fromMonochrome(15, 0.2);

    this._duration = 500;
    this._recording = false;

    this._hex_palettes = [
      ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
      ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
      ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c75"],
      ["#9b5de5", "#f15bb5", "#fee440", "#00bbf9", "#00f5d4"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);

    this._particles = new Array(this._particles_num).fill().map(() => {
      const r = this._xor128.random(0.5, 1);
      const palette = this._palette_factory.getRandomPalette(this._xor128);

      return new Particle((this.width / 2) * r, palette, this._xor128);
    });
    this._direction = this._xor128.random_bool() ? 1 : -1;

    document.body.style.backgroundColor = this._bg.rgb;

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
    this.ctx.fillStyle = this._bg.rgba;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);

    this._particles.forEach((p) => {
      p.update(t * this._direction);
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
