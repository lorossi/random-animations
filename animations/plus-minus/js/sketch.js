import { Engine, XOR128, PaletteFactory } from "./lib.js";
import { Plus } from "./plus.js";

class Sketch extends Engine {
  preload() {
    this._phase = 0;

    this._duration = 180;
    this._recording = false;

    this._hex_palettes = [
      ["#EDF2F4", "#2B2D42"],
      ["#0F0F0F", "#F2F2F2"],
      ["#0D1321", "#F0EBD8"],
      ["#FFFCF2", "#252422"],
      ["#101012", "#28EBCF"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);

    this._cols = this._xor128.random_int(6, 12);
    this._plus_scl = this.width / this._cols;

    this._plus = [];
    this._negative_plus = [];

    this._rotation_directions = this._xor128.shuffle([1, -1]);

    // place the plus
    for (let i = -this._cols / 2; i < this._cols; i++) {
      const dx = (-1 / 3) * this._plus_scl * i;
      const dy = this._plus_scl * i;
      let x = 0;
      while ((x - 6) * this._plus_scl < this.width) {
        const px = dx + this._plus_scl * x;
        const py = dy + (1 / 3) * this._plus_scl * x;
        this._plus.push(
          new Plus(
            px,
            py,
            this._plus_scl,
            this._palette.getColor(0),
            this._rotation_directions[x % 2],
          ),
        );
        x++;
      }

      x = 0;
      while ((x - 6) * this._plus_scl < this.width) {
        const px = dx + this._plus_scl * x - (5 / 3) * this._plus_scl;
        const py = dy + (1 / 3) * this._plus_scl * x;
        this._negative_plus.push(
          new Plus(
            px,
            py,
            this._plus_scl,
            this._palette.getColor(1),
            this._rotation_directions[(x + 1) % 2],
          ),
        );
        x++;
      }
    }

    this._scl = new Array(2).fill(0).map(() => this._xor128.pick([-1, 1]));
    this._dt = this._xor128.random();
    document.body.style.backgroundColor = this._palette.getColor(0).rgba;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration + this._dt) % 1;

    this._phase = t < 0.5 ? 0 : 1;

    this.ctx.save();

    this.background(this._palette.getColor((this._phase + 1) % 2));
    this.scaleFromCenter(...this._scl);

    this.ctx.translate(
      (-this._plus_scl * t * 5) / 3,
      (-this._plus_scl * t * 5) / 3,
    );

    if (this._phase == 0) {
      const tt = (t * 2) % 1;
      this._plus.forEach((p) => {
        p.update(tt);
        p.draw(this.ctx);
      });
    } else {
      const tt = (t - 0.5) * 2;
      this._negative_plus.forEach((p) => {
        p.update(tt);
        p.draw(this.ctx);
      });
    }

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
