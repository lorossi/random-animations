import { Engine, XOR128, Point, PaletteFactory } from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._duration = 600;
    this._recording = false;

    this._hex_palettes = [
      ["#DCDCDC", "#0F0F0F"],
      ["#EEE7D7", "#27221F"],
      ["#f1faee", "#1d3557"],
      ["#edf2f4", "#2b2d42"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    const lines_num = this._xor128.random_int(6, 10);
    const circles_num = this._xor128.random_int(3, 6);
    const phi = (this._xor128.random_int(4) * Math.PI) / 2;
    const circle_r = (this.width / 2) * Math.sin(Math.PI / lines_num);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);
    [this._bg_color, this._fg_color] = this._palette.colors;

    const coords = new Array(circles_num).fill(null).map((_, i) => {
      const theta_to_point = (theta) => {
        return new Point(
          (this.width / 2 - circle_r) * Math.cos(theta) + this.width / 2,
          (this.width / 2 - circle_r) * Math.sin(theta) + this.height / 2,
        );
      };
      return {
        from: theta_to_point(phi + (i * Math.PI * 2) / circles_num),
        to: theta_to_point(phi + (i * Math.PI * 2) / circles_num + Math.PI),
      };
    });

    this._circles = new Array(circles_num).fill(null).map((_, i) => {
      return new Circle(
        coords[i].from,
        coords[i].to,
        circle_r,
        lines_num,
        this._fg_color,
      );
    });

    this._circles_canvas = document.createElement("canvas");
    this._circles_canvas.width = this.width;
    this._circles_canvas.height = this.height;
    this._circles_ctx = this._circles_canvas.getContext("2d");

    document.body.style.backgroundColor = this._bg_color.hex;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    const tt = t < 0.5 ? t * 2 : 1 - (t - 0.5) * 2;

    this._circles_ctx.clearRect(0, 0, this.width, this.height);
    this._circles_ctx.globalCompositeOperation = "xor";

    this._circles.forEach((circle) => {
      circle.update(tt);
      circle.show(this._circles_ctx);
    });

    this.ctx.save();
    this.background(this._bg_color);
    this.ctx.drawImage(this._circles_canvas, 0, 0);
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
