import { Engine, XOR128, Color, PaletteFactory } from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._bg_color = Color.fromMonochrome(245);
    this._circle_color = Color.fromMonochrome(235);
    this._hex_palettes = [
      ["#F44336C0", "#0BBCC9C0"],
      ["#da525dc0", "#00b49bc0"],
      ["#f58e84c0", "#00978dc0"],
    ];

    this._duration = 120;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._stripes_colors = this._palette_factory.getRandomPalette(
      this._xor128,
      true,
    );

    this._stripes_num = this._xor128.random_int(15, 30);

    this._circles = new Array(2).fill().map((_, i) => {
      const theta = this._xor128.random(Math.PI * 2);
      const rho =
        this.width / 2 +
        this._xor128.random(this.width / this._stripes_num) / 2;
      const x = rho * (1 + Math.cos(theta));
      const y = rho * (1 + Math.sin(theta));

      return new Circle(
        x,
        y,
        this.width * 2,
        this._stripes_num,
        this._stripes_colors.getColor(i),
      );
    });

    document.body.style.backgroundColor = this._bg_color.hex;

    this._frame_started = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_started;
    const t = (delta_frame / this._duration) % 1;

    if (delta_frame % 60 === 0) console.log(this.frameRateAverage);

    this.ctx.save();
    this.background(this._bg_color);

    // clip circle
    this.ctx.beginPath();
    this.ctx.arc(
      this.width / 2,
      this.height / 2,
      this.width / 2,
      0,
      Math.PI * 2,
    );
    this.ctx.clip();

    this.ctx.save();
    this.ctx.fillStyle = this._circle_color.rgba;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this._circles.forEach((circle) => circle.draw(this.ctx, t));

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
