import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._cols = 3;
    this._scrambled_cols = 7;

    this._scl = 0.95;
    this._texture_scl = 2;
    this._off_amp = 0.1;
    this._rays = 100;
    this._bg = Color.fromMonochrome(245);
    this._fg = Color.fromHEX("#8b0000");

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    const circle_scl = this.width / this._cols;
    this._circles = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = (i % this._cols) * circle_scl;
      const y = Math.floor(i / this._cols) * circle_scl;
      const c = new Circle(x, y, circle_scl);
      c.initDependencies(this._xor128);
      return c;
    });

    this._position = new Array(this._scrambled_cols ** 2)
      .fill(0)
      .map((_, i) => ({ i: i, order: this._xor128.random() }))
      .sort((a, b) => a.order - b.order)
      .map((p) => p.i);

    [this._off_canvas, this._off_ctx] = this._createOffCanvas();
    this._noise_texture = this._createTexture();

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    // draw on the secondary canvas
    this._drawOffCanvas(t);

    this.ctx.save();
    this.background(this._bg.rgb);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    // draw the secondary canvas on the primary canvas
    this._pasteOffCanvas();

    // draw the texture
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(this._noise_texture, 0, 0);
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

  _createOffCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    return [canvas, canvas.getContext("2d")];
  }

  _drawOffCanvas(t) {
    this._off_ctx.save();
    this._off_ctx.strokeStyle = this._fg.rgba;
    this._off_ctx.clearRect(0, 0, this.width, this.height);
    this._off_ctx.fillStyle = this._bg.rgba;
    this._off_ctx.fillRect(0, 0, this.width, this.height);

    this._circles.forEach((c) => c.draw(this._off_ctx, t));

    this._off_ctx.restore();
  }

  _pasteOffCanvas() {
    const scrambled_square_scl = this.width / this._scrambled_cols;
    this._position.forEach((i, s) => {
      const dest_x = (i % this._scrambled_cols) * scrambled_square_scl;
      const dest_y =
        Math.floor(i / this._scrambled_cols) * scrambled_square_scl;

      const source_x = (s % this._scrambled_cols) * scrambled_square_scl;
      const source_y =
        Math.floor(s / this._scrambled_cols) * scrambled_square_scl;

      this.ctx.save();
      this.ctx.translate(
        dest_x + scrambled_square_scl / 2,
        dest_y + scrambled_square_scl / 2
      );
      this.ctx.translate(-scrambled_square_scl / 2, -scrambled_square_scl / 2);

      this.ctx.drawImage(
        this._off_canvas,
        source_x,
        source_y,
        scrambled_square_scl,
        scrambled_square_scl,
        0,
        0,
        scrambled_square_scl,
        scrambled_square_scl
      );
      this.ctx.restore();
    });
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext("2d");
    for (let x = 0; x < canvas.width; x += this._texture_scl) {
      for (let y = 0; y < canvas.height; y += this._texture_scl) {
        const c = this._xor128.random(127);
        ctx.fillStyle = Color.fromMonochrome(c, 0.05).rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return canvas;
  }

  _wrap(x, min, max) {
    while (x < min) x += max - min;
    while (x > max) x -= max - min;

    return x;
  }

  click() {
    this.setup();
  }
}

export { Sketch };
