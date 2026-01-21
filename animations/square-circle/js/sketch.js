import { Engine, XOR128, PaletteFactory } from "./lib.js";
import { Pacman } from "./pacman.js";

class Sketch extends Engine {
  preload() {
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
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);

    this._scale_direction = new Array(2)
      .fill(0)
      .map(() => this._xor128.pick([-1, 1]));

    this._cols = this._xor128.random_int(4, 16);

    const pacman_scl = this.width / this._cols;
    this._pacmans = new Array(this._cols ** 2).fill(null).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      const px = x * pacman_scl + pacman_scl / 2;
      const py = y * pacman_scl + pacman_scl / 2;
      const r = pacman_scl / 2;

      const quadrant_x = x % 2;
      const quadrant_y = y % 2;
      const direction = (quadrant_x + quadrant_y) % 2 == 0 ? 1 : -1;

      const phi = [
        [Math.PI / 2, Math.PI, 0, (3 * Math.PI) / 2],
        [0, (3 * Math.PI) / 2],
      ][quadrant_y][quadrant_x];

      const color = this._palette.getColor(1);
      return new Pacman(px, py, r, direction, phi, color);
    });

    document.body.style.backgroundColor = this._palette.getColor(0).rgb;

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
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scale_direction[0], this._scale_direction[1]);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this.background(this._palette.getColor(0));

    this._pacmans.forEach((pacman) => {
      pacman.update(t);
      pacman.draw(this.ctx);
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
