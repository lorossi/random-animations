import { Engine, XOR128, Palette, PaletteFactory, Color } from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._circles_scl = 0.9;
    this._texture_scl = 2;
    this._texture_oversize = 1.1;

    this._hex_palettes = [
      ["#FFD166", "#EF476F", "#06D6A0", "#118AB2", "#073B4C"],
      ["#FFECD1", "#001524", "#15616D", "#FF7D00", "#78290F"],
      ["#F4D58D", "#001427", "#708D81", "#BF0603", "#8D0801"],
      ["#FFF3B0", "#335C67", "#E09F3E", "#9E2A2B", "#540B0E"],
      ["#f4f4f4", "#5F0F40", "#9A031E", "#FB8B24", "#E36414", "#0F4C5C"],
      ["#EDDDD4", "#283D3B", "#197278", "#C44536", "#772E25"],
      ["#FCAB20", "#E7363C", "#F56438", "#59AC99", "#3E446E"],
      ["#f4f4f4", "#0B7ABF", "#378C3C", "#F2B90C", "#F26E22", "#F2522E"],
      ["#D9CCC5", "#3049D9", "#2B65D9", "#2B88D9", "#F24C27"],
    ];

    this._duration = 300;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._cols = this._xor128.random_int(6, 12);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    const palette = this._palette_factory.getRandomPalette(this._xor128);
    this._bg = palette.getColor(0);
    const [_, ...fg_colors] = palette.colors;
    const fg_palette = new Palette(fg_colors).shuffle(this._xor128);

    const circle_size = this.width / this._cols;

    this._circles = new Array(this._cols ** 2).fill(null).map((_, i) => {
      const x = (i % this._cols) * circle_size;
      const y = Math.floor(i / this._cols) * circle_size;
      const seed = this._xor128.random_int(1e6);
      return new Circle(x, y, circle_size, seed, this._circles_scl, fg_palette);
    });

    this._texture = this._createTexture(
      this._texture_scl,
      this._texture_oversize,
    );

    document.body.style.background = this._bg.hex;
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

    this.ctx.save();
    this.scaleFromCenter(this._scl);

    this._circles.forEach((circle) => {
      circle.update(t);
      circle.draw(this.ctx);
    });

    this.ctx.restore();

    this._applyTexture(this._texture);

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

  _createTexture(texture_scl = 4, oversize = 1.2) {
    const canvas = document.createElement("canvas");
    canvas.width = this.width * oversize;
    canvas.height = this.height * oversize;
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < canvas.width; x += texture_scl) {
      for (let y = 0; y < canvas.height; y += texture_scl) {
        const ch = this._xor128.random_int(256);
        const c = Color.fromMonochrome(ch, 0.05);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, texture_scl, texture_scl);
      }
    }

    return canvas;
  }

  _applyTexture(texture) {
    const dx = -this._xor128.random_int(0, texture.width - this.width);
    const dy = -this._xor128.random_int(0, texture.height - this.height);

    this.ctx.save();
    this.ctx.globalCompositeOperation = "dodge";
    this.ctx.drawImage(texture, dx, dy);
    this.ctx.restore();
  }
}

export { Sketch };
