import { Engine, XOR128, Color, PaletteFactory } from "./lib.js";
import { Circle, Square } from "./shape.js";

class Sketch extends Engine {
  preload() {
    this._max_tries = 10000;
    this._max_items = 1000;
    this._min_r = 5;
    this._max_r = 200;
    this._scl = 0.9;

    this.bg = Color.fromHEX("#FFFDEA");
    this._hex_palettes = [
      ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"],
      ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93"],
      ["#EE6055", "#60D394", "#AAF683", "#FFD97D", "#FF9B85"],
    ];
    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = Date.now();
    this._xor128 = new XOR128(seed);
    this._shapes = [];

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);

    let placed = true;
    while (placed) {
      placed = false;
      let tries = 0;
      while (this._shapes.length < this._max_items && tries < this._max_tries) {
        const nr = this._xor128.random(this._min_r, this._max_r);
        const nx = this._xor128.random(nr, this.width - nr);
        const ny = this._xor128.random(nr, this.height - nr);

        let ns = this._xor128.random_bool()
          ? new Circle(nx, ny, nr)
          : new Square(nx, ny, nr);

        if (this._shapes.some((s) => s.overlap(ns))) tries++;
        else {
          placed = true;
          this._shapes.push(ns);
          break;
        }
      }

      if (!placed) console.log({ tries, shapes: this._shapes.length });
    }

    this.background(this.bg);
    document.body.style.background = this.bg.rgba;

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    if (this._shapes.length === 0) {
      this.noLoop();
      return;
    }

    const ns = this._shapes.pop();
    const c = this._palette.getRandomColor(this._xor128);

    this.ctx.save();
    this.scaleFromCenter(this._scl);

    this.ctx.save();
    this.ctx.fillStyle = c.rgba;
    ns.show(this.ctx);
    this.ctx.restore();

    this.ctx.restore();

    const delta_frame = this.frameCount - this._frame_offset;
    if (delta_frame >= this._duration && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    this.setup();
    this.loop();
  }
}

export { Sketch };
