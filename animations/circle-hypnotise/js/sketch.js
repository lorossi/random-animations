import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._bg_color = Color.fromMonochrome(245);
    this._circle_color = Color.fromMonochrome(235);
    this._stripes_colors = [
      new Color(244, 67, 54, 0.75),
      new Color(11, 188, 201, 0.75),
    ];
    this._scl = 0.95;

    this._duration = 120;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._stripes_num = this._xor128.random_int(15, 30);

    this._circles = new Array(2).fill().map((_, i) => {
      const theta = this._xor128.random(Math.PI * 2);
      const rho =
        this.width / 2 + this._xor128.random(this.width / this._stripes_num);
      const x = rho * (1 + Math.cos(theta));
      const y = rho * (1 + Math.sin(theta));

      return new Circle(
        x,
        y,
        this.width * 2,
        this._stripes_num,
        this._stripes_colors[i % this._stripes_colors.length]
      );
    });

    this._frame_started = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = ((this.frameCount - this._frame_started) / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg_color);
    this.scaleFromCenter(this._scl);

    // clip circle
    this.ctx.beginPath();
    this.ctx.arc(
      this.width / 2,
      this.height / 2,
      this.width / 2,
      0,
      Math.PI * 2
    );
    this.ctx.clip();

    this.ctx.save();
    this.ctx.fillStyle = this._circle_color.rgba;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this._circles.forEach((circle) => circle.draw(this.ctx, t));

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
  }
}

export { Sketch };
