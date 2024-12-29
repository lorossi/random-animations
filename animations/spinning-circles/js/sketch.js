import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Circle } from "./circle.js";
import { Text } from "./text.js";

class Sketch extends Engine {
  preload() {
    this._duration = 180;
    this._recording = false;

    this._cols = 3;
    this._circle_chance = 0.35;
    this._scl = 0.9;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const palette = PaletteFactory.getRandomPalette(this._xor128);
    [this._bg, this._fg] = palette.colors;

    const col_scl = this.width / this._cols;
    this._circles = new Array(this._cols ** 2)
      .fill()
      .map((_, i) => {
        if (this._xor128.random() > this._circle_chance) return null;

        const x = (i % this._cols) * col_scl + col_scl / 2;
        const y = Math.floor(i / this._cols) * col_scl + col_scl / 2;
        const dx = this._xor128.random_interval(0, 0.25) * col_scl;
        const dy = this._xor128.random_interval(0, 0.25) * col_scl;
        const r = (this.width / this._cols / 2) * 0.95;
        const seed = this._xor128.random_int(1e6);
        return new Circle(x + dx, y + dy, r, seed, this._fg);
      })
      .filter((c) => c !== null);

    this._text = new Text(
      120,
      this.width,
      this._xor128.random_int(1e6),
      this._fg
    );

    this._audio_context = new AudioContext();
    this._oscillator = this._audio_context.createOscillator();
    this._oscillator.type = "sine";
    this._oscillator.connect(this._audio_context.destination);

    document.body.style.backgroundColor = this._bg.rgb;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
    this.loop();
    this._beep();
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    if (this._circles.length == 0) {
      this.setup();
      return;
    }

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);
    this._circles.forEach((circle) => {
      circle.update(t);
      circle.show(this.ctx);
    });
    this._text.draw(this.ctx);
    this.ctx.restore();

    if (t == 0 && delta_frame > 0) {
      if (this._recording) {
        this._recording = false;
        this.stopRecording();
        console.log("%cRecording stopped. Saving...", "color:yellow");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
        this.noLoop();
      }
      this.setup();
    }
  }

  click() {
    this.setup();
  }

  async _beep(duration = 250) {
    this._oscillator.frequency.setValueAtTime(
      800,
      this._audio_context.currentTime
    );
    this._oscillator.start();
    await this._sleep(duration);
    this._oscillator.stop();
  }

  async _sleep(delay = 500) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export { Sketch };
