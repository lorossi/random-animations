import { Engine, SimplexNoise, PaletteFactory, XOR128 } from "./lib.js";
import { Box } from "./box.js";

class Sketch extends Engine {
  preload() {
    this._cols = 13;
    this._scl = 0.9;
    this._box_scl = 0.95;
    this._noise_scl = 0.001;

    this._hex_palettes = [
      ["#fbf1c7", "#282828"],
      ["#262626", "#f0f0f0"],
      ["#14213d", "#e5e5e5"],
      ["#353535", "#ffffff"],
    ];

    this._duration = 180;
    this._recording = false;
  }

  setup() {
    const timestamp = new Date().getTime().toString();

    this._seed = Math.abs(this._adler32(timestamp));
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e16));
    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);

    const scl = this.width / this._cols;
    this._boxes = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);
      const b = new Box(x * scl, y * scl, scl, this._box_scl);
      b.setFgColor(this._palette.getColor(0));
      b.setNoise(this._noise, this._noise_scl);
      return b;
    });

    // set the background color to the page
    document.body.style.backgroundColor = this._palette.getColor(1).rgb;

    this._animation_started = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  click() {
    this.setup();
  }

  draw() {
    const elapsed = this.frameCount - this._animation_started;
    const t = (elapsed / this._duration) % 1;

    this.ctx.save();
    this.background(this._palette.getColor(1));
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._boxes.forEach((box) => {
      box.update(t);
      box.show(this.ctx);
    });

    this.ctx.restore();

    if (t == 0 && elapsed > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _adler32(buffer) {
    let a = 1;
    let b = 0;

    for (let i = 0; i < buffer.length; i++) {
      a = (a + buffer[i]) % 65521;
      b = (b + a) % 65521;
    }

    return (b << 16) | a;
  }
}

export { Sketch };
