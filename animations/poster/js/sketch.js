import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Band } from "./band.js";
import { Circle } from "./circle.js";
import { PaletteFactory } from "./palette_factory.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(64);
    this._texture_scl = 2;
    this._band_saturation = 0.8;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._palette = PaletteFactory.getRandomPalette(this._xor128);

    const bands_num = this._xor128.random_int(5, 7);
    const bands_scl = this.width / bands_num;
    const circle_r = this.width / 4;

    this._bands = new Array(bands_num).fill(0).map((_, i) => {
      const b = new Band(i * bands_scl, bands_scl, this.height);
      b.setPalette(this._palette.colors, this._band_saturation);
      b.initDependencies(this._xor128);
      return b;
    });

    this._circle = new Circle(
      this.width / 2,
      this.height / 2,
      circle_r,
      bands_scl / 2
    );
    this._circle.setPalette(this._palette.colors);
    this._circle.initDependencies(this._xor128);

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    this.noLoop();

    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg.rgb);

    this._bands.forEach((b) => {
      b.generate();
      b.draw(this.ctx);
    });
    this._circle.generate();
    this._circle.draw(this.ctx);

    // draw some noise
    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const ch = this._xor128.random(25);
        const c = Color.fromMonochrome(ch, 0.25);
        this.ctx.fillStyle = c.rgba;
        this.ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    this.ctx.restore();
    this.ctx.restore();

    if (t == 0 && this.frameCount > 0 && this._recording) {
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
