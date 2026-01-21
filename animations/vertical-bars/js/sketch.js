import { Engine, XOR128, PaletteFactory } from "./lib.js";
import { Bar } from "./bars.js";

class Sketch extends Engine {
  preload() {
    this._duration = 600;
    this._recording = false;

    this._hex_palettes = [
      ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
      ["#1A535C", "#4ECDC4", "#F7FFF7", "#FF6B6B", "#FFE66D"],
      ["#F9C80E", "#F86624", "#EA3546", "#662E9B", "#43BCCD"],
    ];
  }

  setup() {
    const seed = new Date().getTime();

    this._xor128 = new XOR128(seed);
    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, false);

    const bars_num = this._xor128.random_int(40, 60);

    const bar_scl = this.width / bars_num;
    const dt = this._xor128.random();
    this._bars = Array(bars_num)
      .fill(null)
      .map((_, i) => {
        const seed = (i / bars_num + dt) * Math.PI * 12;
        return new Bar(bar_scl * i, bar_scl, this.height, seed, this._palette);
      });

    this._bg = this._palette.getRandomColor(this._xor128);
    document.body.style.background = this._bg.rgba;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color: green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;
    const theta = t * Math.PI * 2;

    console.log(this.frameRateAverage);

    this._bars.forEach((b) => {
      b.move(theta);
      b.show(this.ctx);
    });

    if (this._recording && t == 0 && delta_frame > 0) {
      this._recording = false;
      console.log("%cRecording stopped", "color: red");
      this.stopRecording();
      this.saveRecording();
      this.noLoop();
      console.log("%cRecording saved!", "color: green");
    }
  }

  click() {
    this.setup();
  }
}

export { Sketch };
