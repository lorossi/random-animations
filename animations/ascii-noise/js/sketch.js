import { Color, Engine, SimplexNoise, XOR128 } from "./lib.js";

class Sketch extends Engine {
  preload() {
    this._noise_scl = 0.05;
    this._time_scl = 0.5;
    this._palettes = [
      [Color.fromMonochrome(20), Color.fromMonochrome(235)],
      [Color.fromMonochrome(235), Color.fromMonochrome(20)],
      [Color.fromMonochrome(10), new Color(137, 243, 54)],
      [Color.fromMonochrome(10), new Color(255, 61, 73)],
    ];
    this._ascii_chars = "@%#*+=-:. ".split("");
    this._scl = 0.95;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._slots = this._xor128.random_int(30, 80);
    [this._bg, this._fg] = this._xor128.pick(this._palettes);

    this._slot_size = this.width / this._slots;

    this._font_loaded = false;
    document.fonts.load("16px Hack").then(() => (this._font_loaded = true));

    document.body.style.background = this._bg.rgba;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    if (!this._font_loaded) return;

    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    const theta = t * Math.PI * 2;
    const tx = (1 + Math.cos(theta)) * 0.5 * this._time_scl;
    const ty = (1 + Math.sin(theta)) * 0.5 * this._time_scl;

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this.ctx.fillStyle = this._fg.rgba;
    this.ctx.font = `${this._slot_size}px Hack`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    for (let y = 0; y < this._slots; y++) {
      for (let x = 0; x < this._slots; x++) {
        const n = this._noise.noise(
          x * this._noise_scl,
          y * this._noise_scl,
          tx,
          ty,
        );
        const c_index = Math.floor(((n + 1) / 2) * this._ascii_chars.length);
        const c = this._ascii_chars[c_index];

        this.ctx.fillText(
          c,
          (x + 0.5) * this._slot_size,
          (y + 0.6) * this._slot_size,
        );
      }
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
