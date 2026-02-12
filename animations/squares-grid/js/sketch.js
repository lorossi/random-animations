import { Color, Engine, SimplexNoise, XOR128 } from "./lib.js";
import { Square } from "./square.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._bg = Color.fromHex("#edede9");
    this._stripes_hex_colors = [
      "#00AFB9",
      "#669BBC",
      "#81B29A",
      "#C1121F",
      "#E07A5F",
      "#F07167",
    ];

    this._noise_scl = 0.25;
    this._time_scl = 1;

    this._texture_oversize = 1.1;
    this._texture_scale = 2;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    const noise_seed = this._xor128.random_int(2 ** 31);
    this._noise = new SimplexNoise(noise_seed);

    const slots = this._xor128.random_int(4, 10);
    const square_size = Math.ceil(this.width / slots);
    const stripes_num = this._xor128.random_int(2, 8);
    const stripes_color = this._xor128.pick(this._stripes_hex_colors);

    const new_canvas_size = slots * square_size;
    this._resize(new_canvas_size, new_canvas_size);

    this._squares = new Array(slots ** 2).fill().map((_, i) => {
      const x = (i % slots) * square_size;
      const y = Math.floor(i / slots) * square_size;
      return new Square(
        x,
        y,
        square_size,
        stripes_num,
        stripes_color,
        this._noise_scl,
        this._noise,
      );
    });

    this._texture = this._create_texture();

    document.body.style.backgroundColor = this._bg.hex;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    const theta = t * Math.PI * 2;
    const tx = (1 + Math.cos(theta)) * this._time_scl;
    const ty = (1 + Math.sin(theta)) * this._time_scl;

    this.ctx.save();
    this.background(this._bg);

    this._squares.forEach((square) => {
      square.update(tx, ty);
      square.draw(this.ctx);
    });

    this._apply_texture(this._texture);

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

  _resize(size) {
    this.canvas.width = size;
    this.canvas.height = size;
  }

  _create_texture() {
    const texture_canvas = document.createElement("canvas");
    texture_canvas.width = this.width * this._texture_oversize;
    texture_canvas.height = this.height * this._texture_oversize;
    const texture_ctx = texture_canvas.getContext("2d");

    for (let x = 0; x < texture_canvas.width; x += this._texture_scale) {
      for (let y = 0; y < texture_canvas.height; y += this._texture_scale) {
        const m = this._xor128.random_int(127);
        const c = Color.fromMonochrome(m, 0.1);
        texture_ctx.fillStyle = c.rgba;
        texture_ctx.fillRect(x, y, this._texture_scale, this._texture_scale);
      }
    }

    return texture_canvas;
  }

  _apply_texture(texture_canvas) {
    const bx = texture_canvas.width - this.width;
    const by = texture_canvas.height - this.height;

    const dx = this._xor128.random_int(bx);
    const dy = this._xor128.random_int(by);

    this.ctx.save();
    this.ctx.globalCompositeOperation = "dodge";
    this.ctx.drawImage(
      texture_canvas,
      dx,
      dy,
      texture_canvas.width,
      texture_canvas.height,
      0,
      0,
      texture_canvas.width,
      texture_canvas.height,
    );
    this.ctx.restore();
  }
}

export { Sketch };
