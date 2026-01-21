import { Engine, XOR128, Color } from "./lib.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromHEX("#D6D9CE");
    this._fg = Color.fromHEX("#000112");
    this._title_color = Color.fromMonochrome(15, 1);
    this._subtitle_color = Color.fromMonochrome(15, 0.75);
    this._accent = Color.fromHEX("#F3A714");

    this._cols = 12;
    this._rows = 12;
    this._rows_offset = 2;
    this._scl = 0.95;
    this._texture_scl = 2;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._circle_x_size = this.width / this._cols;
    this._circle_y_size = this.height / (this._rows + this._rows_offset);
    this._circle_r =
      (Math.min(this._circle_x_size, this._circle_y_size) / 2) *
      this._xor128.random_interval(1, 0.1);
    this._mask_r_factor = this._xor128.random_interval(1, 0.2);

    this._texture = this._createTexture();

    document.body.style.backgroundColor = this._bg.rgba;
    this._frame_started = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_started;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg.rgba);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this.ctx.save();
    this.ctx.fillStyle = this._accent.rgba;
    this._clipMask(this.ctx, t, false);
    this._drawCircles(this.ctx);
    this.ctx.restore();

    this.ctx.save();
    this.ctx.fillStyle = this._fg.rgba;
    this._clipMask(this.ctx, t, true);
    this._drawCircles(this.ctx);
    this.ctx.restore();

    this.ctx.save();
    this.ctx.fillStyle = this._title_color.rgba;
    const font_height = Math.floor(
      this._circle_y_size * this._rows_offset * 0.4,
    );

    this.ctx.font = `${font_height}px HelveticaNeue`;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";

    const par_indent = this.ctx.measureText("C").width / 4;

    this.ctx.fillText("Circle Modernism", 0, 0);

    this.ctx.font = `${font_height * 0.6}px HelveticaNeue`;
    this.ctx.fillStyle = this._subtitle_color.rgba;
    this.ctx.fillText("function over form", par_indent, font_height * 1.1);
    this.ctx.fillText(
      "what does function mean to you?",
      par_indent,
      font_height * 1.7,
    );

    this.ctx.restore();
    this.ctx.restore();

    this._drawTexture(this.ctx, this._texture);

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    if (this._recording) return;
    this.setup();
  }

  _drawCircles(ctx) {
    const a = 0.5;
    ctx.save();
    for (let y = this._rows_offset; y < this._rows + this._rows_offset; y++) {
      const scl =
        a * this._polyEaseInOut(y / (this._rows + this._rows_offset)) + (1 - a);
      for (let x = 0; x < this._cols; x++) {
        const circle_x = this._circle_x_size * (x + 0.5);
        const circle_y = this._circle_y_size * (y + 0.5);
        ctx.beginPath();
        ctx.arc(circle_x, circle_y, this._circle_r * scl, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  _clipMask(ctx, t = 0, outer = false) {
    const theta = Math.PI * 2 * t;
    const r = (this.width / 3) * this._mask_r_factor;
    const x = this.width / 2 + 0.75 * r * Math.cos(theta);
    const y = this.height / 2 + 0.75 * r * Math.sin(theta);

    const circle_clip = new Path2D();
    if (outer) circle_clip.rect(0, 0, this.width, this.height);
    circle_clip.arc(x, y, r, 0, 2 * Math.PI, outer);

    ctx.clip(circle_clip);
  }

  _createTexture() {
    const texture = document.createElement("canvas");
    texture.width = this.width;
    texture.height = this.height;

    const ctx = texture.getContext("2d");
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const n = this._xor128.random(127);
        const c = Color.fromMonochrome(n, 0.1);

        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return texture;
  }

  _drawTexture(ctx, texture) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(texture, 0, 0);
    ctx.restore();
  }

  _polyEaseInOut(x, n = 3) {
    if (x < 0.5) return x ** n * 2 ** (n - 1);
    return 1 - (-2 * x + 2) ** n / 2 ** (n - 1);
  }
}

export { Sketch };
