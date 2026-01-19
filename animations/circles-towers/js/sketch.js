import { Engine, PaletteFactory, XOR128, Color } from "./lib.js";
import { Tower } from "./tower.js";

class Sketch extends Engine {
  preload() {
    this._noise_scl = 0.001;
    this._time_scl = 0.25;
    this._bg = Color.fromMonochrome(240);
    this._scl = 0.95;
    this._circles_scl = 0.95;

    this._hex_palettes = [
      // https://coolors.co/palette/5f0f40-9a031e-fb8b24-e36414-0f4c5c
      ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
      // https://coolors.co/palette/003049-d62828-f77f00-fcbf49-eae2b7
      ["#003049", "#d62828", "#f77f00", "#fcbf49", "#eae2b7"],
      // https://coolors.co/palette/edae49-d1495b-00798c-30638e-003d5b
      ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b"],
      // https://coolors.co/palette/ef476f-ffd166-06d6a0-118ab2-073b4c
      ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
    ];

    this._duration = 300;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._cols = this._xor128.random_int(3, 6);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, false);
    if (this._xor128.random_bool()) this._palette = this._palette.reverse();

    const noise_seed = this._xor128.random_int(1e9);
    const tower_size = this.width / this._cols;
    this._towers = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);
      return new Tower(
        x * tower_size,
        y * tower_size,
        tower_size,
        noise_seed,
        this._noise_scl,
        this._circles_scl,
        this._palette,
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
    const eased_t = this._easeInOutPoly(t, 2);
    const theta = Math.PI * 2 * eased_t;

    const tx = Math.cos(theta) * this._time_scl;
    const ty = Math.sin(theta) * this._time_scl;

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._towers.forEach((tower) => {
      tower.update(tx, ty);
      tower.draw(this.ctx);
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

  _easeInOutPoly(x, n = 2) {
    if (x < 0.5) return 0.5 * Math.pow(2 * x, n);
    return 1 - 0.5 * Math.pow(2 * (1 - x), n);
  }

  _generateTexture(cell_size, oversize, xor128) {
    const canvas = document.createElement("canvas");
    canvas.width = this.width * oversize;
    canvas.height = this.height * oversize;

    const ctx = canvas.getContext("2d");

    for (let y = 0; y < canvas.height; y += cell_size) {
      for (let x = 0; x < canvas.width; x += cell_size) {
        const ch = xor128.random_int(0, 127);
        const color = Color.fromMonochrome(ch, 0.05);

        ctx.fillStyle = color.rgba;
        ctx.fillRect(x, y, cell_size, cell_size);
      }
    }

    return canvas;
  }

  click() {
    this.setup();
  }
}

export { Sketch };
