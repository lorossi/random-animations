import { Engine, XOR128, PaletteFactory, Color } from "./lib.js";
import { Square } from "./square.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._scl = 0.95;
    this._hex_palettes = [
      ["#003049", "#D62828", "#F77F00", "#FCBF49", "#EAE2B7"],
      ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
      ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
      ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"],
      ["#233D4D", "#FE7F2D", "#FCCA46", "#A1C181", "#619B8A"],
      ["#4D5F5F", "#91B7B7", "#B9E1DC", "#EC4B36", "#F58120"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);

    this._cols = this._xor128.random_int(8, 15);

    const square_size = Math.min(this.width, this.height) / this._cols;
    const square_seed = this._xor128.random_int(1e9);
    this._squares = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const steps = this._xor128.random_int(4, 10);
      const x = (i % this._cols) * square_size;
      const y = Math.floor(i / this._cols) * square_size;
      return new Square(
        x,
        y,
        square_size,
        steps,
        this._palette,
        square_seed + i,
      );
    });

    this._bg = this._palette.getRandomColor(this._xor128);
    document.body.style.backgroundColor = this._bg.rgb;

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

    this._squares.forEach((square) => square.update(t));
    this._squares.forEach((square) => square.draw(this.ctx));
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
    this.draw();
  }
}

export { Sketch };
