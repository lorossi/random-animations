import { Engine, XOR128, Color } from "./lib.js";
import { Radar } from "./radar.js";
import { Bars } from "./bars.js";
import { TextLines } from "./textlines.js";
import { NoiseLetters } from "./noise-letters.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;
    this._bg = Color.fromMonochrome(15);
    this._fg = Color.fromHEX("#20C20E");
    this._cols = 49;
    this._omega = 2;
    this._layer_scl = 0.95;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const layer_classes = this._xor128.shuffle([
      Radar,
      NoiseLetters,
      Bars,
      TextLines,
    ]);

    this._layers = new Array(4).fill().map((_, i) => {
      const size = this.width / 2;
      const x = (i % 2) * size;
      const y = Math.floor(i / 2) * size;
      const cls = layer_classes[i % layer_classes.length];
      return new cls(
        x,
        y,
        size,
        this._fg,
        this._xor128.random_int(1e16),
        this._cols,
        this._omega,
        this._layer_scl,
      );
    });
    document.body.style.backgroundColor = this._bg.rgba;

    this._font_loaded = false;
    document.fonts.load(`12px Hack`).then(() => (this._font_loaded = true));

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    if (!this._font_loaded) {
      this._frame_offset = this.frameCount;
      return;
    }

    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg);

    this._layers.forEach((layer) => {
      layer.update(t);
      layer.show(this.ctx);
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
