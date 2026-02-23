import { PaletteFactory, Engine, XOR128 } from "./lib.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._duration = 600;
    this._recording = false;

    this._sanzo_wada_palettes = [
      ["Rosolanc Purple", "Helvetia Blue"],
      ["Old Rose", "White"],
      ["Aconite Violet", "Dark Soft Violet"],
      ["Ochraceous Salmon", "Pompeian Red"],
      ["Lincoln Green", "Raw Sienna"],
      ["Eugenia Red", "Vandar Poel's Blue"],
      ["Yellow Orange", "Violet Blue"],
      ["Antwarp Blue", "Orange Yellow"],
      ["Dark Tyrian Blue", "Light Glaucous Blue"],
      ["Cameo Pink", "Pompeian Red"],
      ["Dusky Madder Violet", "Cinnamon Rufous"],
      ["Aconite Violet", "Eosine Pink"],
      ["Violet Blue", "Olive Buff"],
      ["Golden Yellow", "Warm Gray"],
      ["Green Blue", "Turquoise Green"],
      ["Black", "Sulphur Yellow"],
      ["Olympic Blue", "Light Porcelain Green"],
    ];
    this._grid_cols = 1;
    this._scl = 0.98;
    this._noise_scl = 0.5;
    this._max_tries = 5e3;

    this._i = 0;
    this._color_phase = 0;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette_factory = PaletteFactory.fromSanzoWadaArray(
      this._sanzo_wada_palettes,
    );
    this._palette = this._palette_factory.getRandomPalette(this._xor128, true);

    [this._fg, this._bg] = this._palette.colors;

    this._slots = this._xor128.random_int(24, 40);
    if (this._slots % 2 != 0) this._slots++;

    this._grid_size = this.width / this._grid_cols;

    this._grids = new Array(this._grid_cols ** 2).fill(0).map((_, i) => {
      return new Grid(
        this._grid_size,
        this._slots,
        this._xor128.random_int(1e9),
        this._noise_scl,
        this._max_tries,
        this._fg,
      );
    });
    this._grids.forEach((g) => g.solve());

    document.body.style.background = this._bg.rgba;
    this._animation_freeze = false;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;

    if (delta_frame % this._duration === 0 && delta_frame > 0) {
      this._animation_freeze = true;
      this.noLoop();
    }

    const t = this._animation_freeze ? 1 : (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._grids.forEach((grid, i) => {
      const x = (i % this._grid_cols) * this._grid_size;
      const y = Math.floor(i / this._grid_cols) * this._grid_size;
      this.ctx.save();
      this.ctx.translate(x, y);
      grid.update(t);
      grid.show(this.ctx);
      this.ctx.restore();
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
    if (this._animation_freeze) {
      this.setup();
      this.loop();
    } else {
      this._animation_freeze = true;
    }
  }
}

export { Sketch };
