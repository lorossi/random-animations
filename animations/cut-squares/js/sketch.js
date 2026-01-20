import { Engine, PaletteFactory, SimplexNoise, XOR128, Color } from "./lib.js";
import { Square } from "./square.js";

class Sketch extends Engine {
  preload() {
    this._cols = 12;
    this._scl = 0.9;
    this._square_scl = 0.8;
    this._noise_scl = 0.15;
    this._texture_scl = 3;

    this._duration = 300;
    this._recording = false;

    this._hex_palettes = [
      ["#0F0F0F", "#F0F0F0"],
      ["#130E0A", "#DCD7C4"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(2 ** 31));
    this._noise.setDetail(2, 0.25);

    this._createTexture();

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, true);

    [this._bg, this._fg] = this._palette.colors;

    document.body.style.backgroundColor = this._bg.rgb;

    const square_size = this.width / this._cols;
    const phi = this._xor128.random(Math.PI * 2);
    this._squares = new Array(this._cols * this._cols)
      .fill(null)
      .map((_, i) => {
        const x = i % this._cols;
        const y = Math.floor(i / this._cols);

        return new Square(
          x * square_size,
          y * square_size,
          square_size,
          this._square_scl,
          phi,
          this._fg,
        );
      });

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._squares.forEach((square, i) => {
      const x = (i % this._cols) - this._cols / 2 + 0.5;
      const y = Math.floor(i / this._cols) - this._cols / 2 + 0.5;
      const dist = Math.atan2(y, x) / (2 * Math.PI) + 0.5;
      const phi = dist;
      square.update(t + phi);
      square.draw(this.ctx);
    });

    this.ctx.restore();

    this._drawTexture(this.ctx);

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _createTexture() {
    this._texture = document.createElement("canvas");
    this._texture.width = this.width;
    this._texture.height = this.height;

    const ctx = this._texture.getContext("2d");
    ctx.save();
    for (let x = 0; x < this._texture.width; x += this._texture_scl) {
      for (let y = 0; y < this._texture.height; y += this._texture_scl) {
        const n = this._xor128.random(127);
        const c = Color.fromMonochrome(n, 0.05);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }
    ctx.restore();
  }

  _drawTexture() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(this._texture, 0, 0);
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
