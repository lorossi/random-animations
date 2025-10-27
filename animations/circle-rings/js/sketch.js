import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Ring, Circle } from "./ring.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(127);
    this._fg = Color.fromMonochrome(240);
    this._scl = 0.9;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._palette = PaletteFactory.getRandomPalette(this._xor128);
    [this._fg, this._bg] = [...this._palette.colors];

    this._phi = this._xor128.random(Math.PI * 2);
    this._direction = this._xor128.random_int(2);

    this._rings_num = this._xor128.random_int(7, 11);
    this._rings = new Array(this._rings_num)
      .fill(0)
      .map((_, i) => {
        const r = (((i + 1) / this._rings_num) * this.width) / 2;
        const length = Math.PI * 0.55;
        const phi = (i / this._rings_num) * Math.PI * 2;
        const dir = i % 2 == this._direction ? 1 : -1;
        const omega = (i + 1) * dir;

        let current_rings = [];
        for (let j = 0; j < 2; j++) {
          current_rings.push(
            new Ring(r, length, phi + j * Math.PI, omega, this._fg)
          );
        }
        return current_rings;
      })
      .flat();

    this._circles = new Array(this._rings_num).fill(0).map((_, i) => {
      const r = (((i + 1) / this._rings_num) * this.width) / 2;
      return new Circle(r, this._fg);
    });

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }

    document.body.style.backgroundColor = this._bg.rgb;
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.rotate(this._phi);

    this._rings.forEach((ring) => ring.update(t));

    this._circles.forEach((circle) => circle.draw(this.ctx));
    this._rings.forEach((ring) => ring.draw(this.ctx));

    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording(t);
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
