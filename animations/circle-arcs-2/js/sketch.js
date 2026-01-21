import { Engine, SimplexNoise, PaletteFactory, XOR128 } from "./lib.js";
import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    console.warn("TODO: add texture");
    this._scl = 0.9;
    this._time_scl = 1;
    this._cols = 4;

    this._min_rings = 4;
    this._max_rings = 8;

    this._min_arcs = 3;
    this._max_arcs = 7;
    this._min_arc_length = Math.PI / 2;
    this._max_arc_length = Math.PI * 2;

    this._probability = 0.75;
    this._hex_palettes = [
      ["#023047", "#8ecae6", "#219ebc", "#ffb703", "#fb8500"],
      ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
      ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
      ["#001524", "#15616d", "#ffecd1", "#ff7d00", "#78290f"],
      ["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"],
      ["#ffffff", "#00171f", "#003459", "#007ea7", "#00a8e8"],
    ];

    this._duration = 900;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(2 ** 31));

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);
    [this._bg, ...this._colors] = this._palette.colors;

    const circle_scl = this.width / this._cols;
    this._circles = new Array(this._cols * this._cols).fill(0).map((_, i) => {
      const x = (i % this._cols) * circle_scl + circle_scl / 2;
      const y = Math.floor(i / this._cols) * circle_scl + circle_scl / 2;
      const r = circle_scl / 2;
      const rings = this._xor128.random_int(this._min_rings, this._max_rings);
      const circle = new Circle(x, y, r);
      circle.initDependencies(this._xor128, this._noise);
      circle.setAttributes(
        rings,
        this._min_arcs,
        this._max_arcs,
        this._min_arc_length,
        this._max_arc_length,
        this._probability,
        this._time_scl,
      );
      circle.setPalette(this._colors);
      circle.generate();
      return circle;
    });

    document.body.style.background = this._bg.hex;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color: green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg.rgba);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    this._circles.forEach((c) => {
      c.update(t);
      c.show(this.ctx);
    });
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
